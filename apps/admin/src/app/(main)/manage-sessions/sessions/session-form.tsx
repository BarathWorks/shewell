import SubmitButton from '@/src/_components/shared/submit-button';
import { useRouter } from 'next/navigation';
import useToastContext from '@/src/_hooks/useToast';
import { ISessionCategory } from '@/src/_models/session-category.model';
import { ISession } from '@/src/_models/session.model';
import { SessionStatus, SessionType } from '@repo/database';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import { classNames } from 'primereact/utils';
import { Controller, useForm } from 'react-hook-form';
import { createSession, updateSession } from './session-actions';
import { useRef, useState, useEffect } from 'react';
import uploadProductImage from '../../upload-image-actions';
import { set } from 'date-fns';
import { slugifyName } from '@/src/lib/utils';

type SessionFormProps = {
  hideDialog: () => void;
  session: ISession;
  categories: ISessionCategory[];
};

const SessionForm = ({ hideDialog, session, categories }: SessionFormProps) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const thumbnailFileInputRef = useRef<FileUpload>(null);
  const bannerFileInputRef = useRef<FileUpload>(null);

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [bannerUrls, setBannerUrls] = useState<{ id: string; url: string }[]>([]);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Initialize URLs from existing session data
  useEffect(() => {
    if (session.thumbnailMedia?.fileUrl) {
      setThumbnailUrl(session.thumbnailMedia.fileUrl);
    }
    if (session.banners) {
      const existingBanners = session.banners.filter((b) => b.media.fileUrl).map((b) => ({ id: b.media.id || '', url: b.media.fileUrl! }));
      setBannerUrls(existingBanners);
      setValue(
        'bannerMediaIds',
        existingBanners.map((b) => b.id)
      );
    }
  }, [session]);

  const { control, handleSubmit, watch, setValue } = useForm<ISession>({
    defaultValues: {
      ...session,
      startAt: session.startAt ? new Date(session.startAt) : undefined,
      endAt: session.endAt ? new Date(session.endAt) : undefined,
      language: session.language || 'English',
      type: session.type || SessionType.ONLINE
    }
  });

  const sessionType = watch('type');
  const startAt = watch('startAt');
  const duration = watch('duration');
  const title = watch('title');

  const watchedTitle = watch('title');
  const slug = slugifyName(watchedTitle);

  useEffect(() => {
    setValue('slug', slug);
  }, [watchedTitle]);
  // Auto-calculate endAt based on startAt + duration
  useEffect(() => {
    if (startAt && duration && duration > 0) {
      const endDateTime = new Date(startAt.getTime() + duration * 60000);
      setValue('endAt', endDateTime);
    }
  }, [startAt, duration, setValue]);

  const statusOptions = Object.values(SessionStatus).map((s) => ({ label: s, value: s }));
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));
  const typeOptions = Object.values(SessionType).map((t) => ({ label: t, value: t }));
  const languageOptions = [
    { label: 'English', value: 'English' },
    { label: 'Tamil', value: 'Tamil' },
    { label: 'Hindi', value: 'Hindi' }
  ];

  const onSelectThumbnail = async (event: FileUploadSelectEvent) => {
    setIsUploadingThumbnail(true);
    const file = event.files[0] as File;

    try {
      const resp = await uploadProductImage(file.name, file.type, 'Session Thumbnail');
      if ('error' in resp) {
        throw new Error(resp.error);
      }
      const { id, fileUrl, presignedUrl } = resp;
      if (!presignedUrl || !id || !fileUrl) {
        throw new Error('Failed to get upload URL');
      }
      // Upload to S3
      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      setValue('thumbnailMediaId', id);
      setThumbnailUrl(fileUrl);
      showToast('success', 'Success', 'Thumbnail uploaded successfully');
    } catch (error) {
      showToast('error', 'Error', 'Failed to upload thumbnail');
      console.error(error);
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailFileInputRef.current) {
        thumbnailFileInputRef.current.clear();
      }
    }
  };

  const onSelectBanner = async (event: FileUploadSelectEvent) => {
    // Check if we already have 2 banners
    if (bannerUrls.length >= 2) {
      showToast('error', 'Error', 'Maximum 2 banners allowed');
      if (bannerFileInputRef.current) bannerFileInputRef.current.clear();
      return;
    }

    setIsUploadingBanner(true);
    const files = event.files as File[];
    const newBanners = [...bannerUrls];
    const newIds = watch('bannerMediaIds') || [];

    try {
      for (const file of files) {
        if (newBanners.length >= 2) break;

        const resp = await uploadProductImage(file.name, file.type, 'Session Banner');
        if ('error' in resp) {
          throw new Error(resp.error);
        }
        const { id, fileUrl, presignedUrl } = resp;
        if (!presignedUrl || !id || !fileUrl) {
          throw new Error('Failed to get upload URL');
        }
        // Upload to S3
        await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });

        newBanners.push({ id, url: fileUrl });
        newIds.push(id);
      }

      setValue('bannerMediaIds', newIds);
      setBannerUrls(newBanners);
      showToast('success', 'Success', 'Banner(s) uploaded successfully');
    } catch (error) {
      showToast('error', 'Error', 'Failed to upload banner');
      console.error(error);
    } finally {
      setIsUploadingBanner(false);
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.clear();
      }
    }
  };

  const removeBanner = (id: string) => {
    const updatedBanners = bannerUrls.filter((b) => b.id !== id);
    setBannerUrls(updatedBanners);
    setValue(
      'bannerMediaIds',
      updatedBanners.map((b) => b.id)
    );
  };

  const callServerAction = (data: ISession) => {
    if (session?.id) return updateSession({ ...data, id: session.id });
    else return createSession(data);
  };

  const submitForm = (data: ISession) => {
    // Remove duration field before submitting (it's UI-only)
    const { duration, ...submitData } = data;
    console.log('SessionForm submitting data:', submitData);

    return callServerAction(submitData)
      .then((resp) => {
        if (resp.error) {
          showToast('error', 'Error', resp.error);
        }

        if (resp.message) {
          showToast('success', 'Successful', resp.message);
          // Refresh the server-rendered table. `revalidatePath` in the action marks
          // the cache stale but does not re-render the page the caller is already
          // sitting on, so every admin CRUD screen showed stale rows until a manual
          // reload.
          router.refresh();
          hideDialog();
        }
      })
      .catch((err) => {
        showToast('error', 'Error', err.message);
        console.log(err);
      });
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
        {/* Field for title */}
        <div className="field">
          <label htmlFor="title">Title</label>
          <Controller
            name="title"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Title is required.'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <InputText
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                    {...field}
                    value={field.value || ''}
                    autoFocus
                    onChange={(e) => {
                      setValue('title', e.target.value);
                    }}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        {/* Field for slug */}
        <div className="field">
          <label htmlFor="slug">Slug</label>
          <Controller
            name="slug"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Slug is required.'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <InputText
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                    {...field}
                    value={field.value || ''}
                    disabled
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        {/* Field for Category */}
        <div className="field">
          <label htmlFor="categoryId">Category</label>
          <Controller
            name="categoryId"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Category is required.'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    options={categoryOptions}
                    optionLabel="label"
                    placeholder="Select a Category"
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div className="formgrid grid">
          {/* Field for Session Type */}
          <div className="field col">
            <label htmlFor="type">Session Type</label>
            <Controller
              name="type"
              control={control}
              render={({ field, fieldState }) => {
                return (
                  <>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      options={typeOptions}
                      optionLabel="label"
                      placeholder="Select Type"
                      className={classNames({
                        'p-invalid': fieldState.error
                      })}
                    />
                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                  </>
                );
              }}
            />
          </div>

          {/* Field for Language */}
          <div className="field col">
            <label htmlFor="language">Language</label>
            <Controller
              name="language"
              control={control}
              render={({ field, fieldState }) => {
                return (
                  <>
                    <Dropdown
                      id={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      options={languageOptions}
                      optionLabel="label"
                      placeholder="Select Language"
                      className={classNames({
                        'p-invalid': fieldState.error
                      })}
                    />
                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                  </>
                );
              }}
            />
          </div>
        </div>

        {/* Field for Status */}
        <div className="field">
          <label htmlFor="status">Status</label>
          <Controller
            name="status"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Status is required.'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <Dropdown
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    options={statusOptions}
                    optionLabel="label"
                    placeholder="Select a Status"
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div className="formgrid grid">
          {/* Field for startAt */}
          <div className="field col">
            <label htmlFor="startAt">Start Date & Time</label>
            <Controller
              name="startAt"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Start time is required.'
                }
              }}
              render={({ field, fieldState }) => {
                return (
                  <>
                    <Calendar
                      id={field.name}
                      value={field.value}
                      onChange={(e) => field.onChange(e.value)}
                      showTime
                      hourFormat="12"
                      className={classNames({
                        'p-invalid': fieldState.error
                      })}
                    />
                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                  </>
                );
              }}
            />
          </div>

          {/* Field for Duration (in minutes) */}
          <div className="field col">
            <label htmlFor="duration">Duration (minutes)</label>
            <Controller
              name="duration"
              control={control}
              render={({ field, fieldState }) => {
                return (
                  <>
                    <InputNumber
                      id={field.name}
                      value={field.value}
                      onValueChange={(e) => field.onChange(e.value)}
                      min={1}
                      max={1440}
                      suffix=" min"
                      className={classNames({
                        'p-invalid': fieldState.error
                      })}
                    />
                    <small className="p-text-secondary">Auto-calculates end time</small>
                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                  </>
                );
              }}
            />
          </div>
        </div>

        {/* Field for endAt (auto-calculated or manual) */}
        <div className="field">
          <label htmlFor="endAt">End Date & Time (Auto-calculated or Manual)</label>
          <Controller
            name="endAt"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'End time is required.'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <Calendar
                    id={field.name}
                    value={field.value}
                    onChange={(e) => field.onChange(e.value)}
                    showTime
                    hourFormat="12"
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        {/* Field for Price */}
        <div className="field">
          <label htmlFor="price">Price</label>
          <Controller
            name="price"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Price is required.'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <InputNumber
                    id={field.name}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    mode="currency"
                    currency="INR"
                    locale="en-IN"
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>
 
        {/* Field for Max Bookings */}
        <div className="field">
          <label htmlFor="maxBookings">Max Bookings (Leave empty for unlimited)</label>
          <Controller
            name="maxBookings"
            control={control}
            render={({ field, fieldState }) => {
              return (
                <>
                  <InputNumber
                    id={field.name}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e.value)}
                    min={0}
                    placeholder="Unlimited"
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>


        {/* Conditional Meeting Link Field (only for ONLINE sessions) */}
        {sessionType === SessionType.ONLINE && (
          <div className="field">
            <label htmlFor="meetingLink">Meeting Link</label>
            <Controller
              name="meetingLink"
              control={control}
              rules={{
                required: {
                  value: sessionType === SessionType.ONLINE,
                  message: 'Meeting link is required for online sessions.'
                },
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL'
                }
              }}
              render={({ field, fieldState }) => {
                return (
                  <>
                    <InputText
                      className={classNames({
                        'p-invalid': fieldState.error
                      })}
                      {...field}
                      value={field.value || ''}
                      placeholder="https://zoom.us/j/..."
                    />
                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                  </>
                );
              }}
            />
          </div>
        )}

        {/* Field for Overview */}
        <div className="field">
          <label htmlFor="overview">Overview</label>
          <Controller
            name="overview"
            control={control}
            render={({ field, fieldState }) => {
              return (
                <>
                  <InputTextarea
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                    {...field}
                    value={field.value || ''}
                    rows={5}
                    placeholder="Detailed description of the session..."
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="field">
          <label htmlFor="thumbnail">Thumbnail Image</label>
          <Controller
            name="thumbnailMediaId"
            control={control}
            render={({ field }) => {
              return (
                <div>
                  <FileUpload
                    ref={thumbnailFileInputRef}
                    mode="basic"
                    accept="image/*"
                    maxFileSize={5000000}
                    onSelect={onSelectThumbnail}
                    disabled={isUploadingThumbnail}
                    chooseLabel={isUploadingThumbnail ? 'Uploading...' : 'Choose Thumbnail'}
                    auto
                  />
                  {thumbnailUrl && (
                    <div className="mt-2">
                      <img src={thumbnailUrl} alt="Thumbnail preview" style={{ maxWidth: '200px', maxHeight: '150px' }} />
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>

        {/* Banner Upload */}
        <div className="field">
          <label htmlFor="banner">Banner Images (Min-Max 2)</label>
          <Controller
            name="bannerMediaIds"
            control={control}
            rules={{
              validate: (value) => (value && value.length >= 1) || 'At least 1 banner image is required'
            }}
            render={({ field, fieldState }) => {
              return (
                <div>
                  <FileUpload
                    ref={bannerFileInputRef}
                    mode="basic"
                    accept="image/*"
                    maxFileSize={5000000}
                    onSelect={onSelectBanner}
                    disabled={isUploadingBanner || bannerUrls.length >= 2}
                    chooseLabel={isUploadingBanner ? 'Uploading...' : 'Choose Banners'}
                    multiple
                    auto
                  />
                  {fieldState.error && <small className="p-error block mt-1">{fieldState.error.message}</small>}
                  <div className="flex flex-wrap gap-4 mt-2">
                    {bannerUrls.map((banner) => (
                      <div key={banner.id} className="relative group">
                        <img src={banner.url} alt="Banner preview" style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                        <Button type="button" icon="pi pi-times" rounded severity="danger" size="small" className="absolute -top-2 -right-2 p-button-sm" style={{ width: '2rem', height: '2rem' }} onClick={() => removeBanner(banner.id)} />
                      </div>
                    ))}
                  </div>
                  {bannerUrls.length < 2 && !isUploadingBanner && <small className="p-text-secondary">You can upload {2 - bannerUrls.length} more image(s)</small>}
                </div>
              );
            }}
          />
        </div>

        <div className="flex flex-row gap-4 mt-4">
          <Button label="Cancel" type="button" icon="pi pi-times" severity="danger" onClick={hideDialog} />
          <SubmitButton label="Save" icon="pi pi-check" />
        </div>
      </form>
    </>
  );
};

export default SessionForm;

//                 {/* Field for Status */}
//                 <div className="field">
//                     <label htmlFor="status">Status</label>
//                     <Controller
//                         name="status"
//                         control={control}
//                         rules={{
//                             required: {
//                                 value: true,
//                                 message: 'Status is required.'
//                             }
//                         }}
//                         render={({ field, fieldState }) => {
//                             return (
//                                 <>
//                                     <Dropdown
//                                         id={field.name}
//                                         value={field.value}
//                                         onChange={(e) => field.onChange(e.value)}
//                                         options={statusOptions}
//                                         optionLabel="label"
//                                         placeholder="Select a Status"
//                                         className={classNames({
//                                             'p-invalid': fieldState.error
//                                         })}
//                                     />
//                                     {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
//                                 </>
//                             );
//                         }}
//                     />
//                 </div>

//                 <div className="formgrid grid">
//                     {/* Field for startAt */}
//                     <div className="field col">
//                         <label htmlFor="startAt">Start Date & Time</label>
//                         <Controller
//                             name="startAt"
//                             control={control}
//                             rules={{
//                                 required: {
//                                     value: true,
//                                     message: 'Start time is required.'
//                                 }
//                             }}
//                             render={({ field, fieldState }) => {
//                                 return (
//                                     <>
//                                         <Calendar
//                                             id={field.name}
//                                             value={field.value}
//                                             onChange={(e) => field.onChange(e.value)}
//                                             showTime
//                                             hourFormat="12"
//                                             className={classNames({
//                                                 'p-invalid': fieldState.error
//                                             })}
//                                         />
//                                         {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
//                                     </>
//                                 );
//                             }}
//                         />
//                     </div>

//                     {/* Field for endAt */}
//                     <div className="field col">
//                         <label htmlFor="endAt">End Date & Time</label>
//                         <Controller
//                             name="endAt"
//                             control={control}
//                             rules={{
//                                 required: {
//                                     value: true,
//                                     message: 'End time is required.'
//                                 }
//                             }}
//                             render={({ field, fieldState }) => {
//                                 return (
//                                     <>
//                                         <Calendar
//                                             id={field.name}
//                                             value={field.value}
//                                             onChange={(e) => field.onChange(e.value)}
//                                             showTime
//                                             hourFormat="12"
//                                             className={classNames({
//                                                 'p-invalid': fieldState.error
//                                             })}
//                                         />
//                                         {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
//                                     </>
//                                 );
//                             }}
//                         />
//                     </div>
//                 </div>

//                 {/* Field for Price */}
//                 <div className="field">
//                     <label htmlFor="price">Price</label>
//                     <Controller
//                         name="price"
//                         control={control}
//                         rules={{
//                             required: {
//                                 value: true,
//                                 message: 'Price is required.'
//                             }
//                         }}
//                         render={({ field, fieldState }) => {
//                             return (
//                                 <>
//                                     <InputNumber
//                                         id={field.name}
//                                         value={field.value}
//                                         onValueChange={(e) => field.onChange(e.value)}
//                                         mode="currency"
//                                         currency="INR"
//                                         locale="en-IN"
//                                         className={classNames({
//                                             'p-invalid': fieldState.error
//                                         })}
//                                     />
//                                     {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
//                                 </>
//                             );
//                         }}
//                     />
//                 </div>

//                 <div className="flex flex-row gap-4 mt-4">
//                     <Button label="Cancel" type="button" icon="pi pi-times" severity="danger" onClick={hideDialog} />
//                     <SubmitButton label="Save" icon="pi pi-check" />
//                 </div>
//             </form>
//         </>
//     );
// };

// export default SessionForm;
