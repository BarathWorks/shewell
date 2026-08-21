import SubmitButton from '@/src/_components/shared/submit-button';
import { useRouter } from 'next/navigation';
import { ITestimonial } from '@/src/_models/testimonial.model';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
// import { uploadProductImage } from '../upload-image-actions';
import { Image } from 'primereact/image';
import useToastContext from '@/src/_hooks/useToast';
import { createTestimonial } from './testimonial-actions';
import { updateTestimonial } from './testimonial-actions';
type TestimonialFormProps = {
  hideDialog: () => void;
  testimonial: ITestimonial;
};
const TestimonialForm = ({ hideDialog, testimonial }: TestimonialFormProps) => {
  const router = useRouter();
  const fileInputRef = useRef<FileUpload>(null);
  const [uploadingState, setUploadingState] = useState<0 | 1 | 2>(0);
  const [testimonialImageUrl, setTestimonialImageUrl] = useState<string>();
  const { showToast } = useToastContext();
  const { control, handleSubmit, setValue } = useForm<ITestimonial>({
    defaultValues: testimonial
  });

  // const onSelectImage = async (event: FileUploadSelectEvent) => {
  //   console.log('action called', event.files);
  //   if (event.files.length > 0) {
  //     event.files.forEach((image) => {
  //       setUploadingState(1);
  //       uploadProductImage(image.name, image.type)
  //         .then(async (resp) => {
  //           console.log('Response is', resp);
  //           const { id, presignedUrl, fileUrl } = resp;
  //           const requestOptions = {
  //             method: 'PUT',
  //             body: image
  //           };
  //           const res = await fetch(presignedUrl!, requestOptions);

  //           console.log(res, id);
  //           if (res.ok) {
  //             setValue('mediaId', id!);
  //             setTestimonialImageUrl(fileUrl);
  //             fileInputRef.current?.clear();
  //           }
  //         })
  //         .catch((error) => {
  //           console.log('action error', error);
  //           fileInputRef.current?.clear();
  //         });
  //     });
  //   }
  // };

  const callServerAction = (data: ITestimonial) => {
    if (testimonial?.id) return updateTestimonial(data);
    else return createTestimonial(data);
  };
  const submitForm = (data: ITestimonial) => {
    return callServerAction(data)
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
      })
      .finally(() => {});
    console.log(data);
  };
  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
        {testimonialImageUrl && <Image src={testimonialImageUrl} alt="Image" className="relative" width="150" height="80" preview />}
        {/* <div className="field mb-2">
          <FileUpload ref={fileInputRef} mode="basic" maxFileSize={1000000} onSelect={onSelectImage} />
        </div> */}
        {/* Field for name */}
        <div className="field">
          <label htmlFor="name">Name</label>
          <Controller
            name="name"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Name is required.'
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
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="Title">Title</label>
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
                  <InputTextarea
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                    {...field}
                    value={field.value || ''}
                    rows={5}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        {/* Field for ratings */}
        <div className="field">
          <label htmlFor="Title">Rating</label>
          <Controller
            name="avgRating"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Rating is required'
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
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          ></Controller>
        </div>
        {/* Field for active */}
        <div className="field">
          <Controller
            name="active"
            control={control}
            render={({ field }) => {
              return (
                <div className="flex gap-2">
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(!!e.checked)}
                  />
                  <label htmlFor="active">Active</label>
                </div>
              );
            }}
          />
        </div>

        <div className="flex flex-row gap-4">
          <Button label="Cancel" type="reset" icon="pi pi-times" severity="danger" onClick={hideDialog} />
          <SubmitButton label="Save" icon="pi pi-check" />
        </div>
      </form>
    </>
  );
};

export default TestimonialForm;
