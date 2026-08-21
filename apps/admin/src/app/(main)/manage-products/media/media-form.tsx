import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import React, { useEffect, useRef, useState } from 'react';
import { createMedia, updateMedia } from './media-actions';
import useToastContext from '@/src/_hooks/useToast';
import { IMedia } from '@/src/_models/media.model';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import uploadImageActions, { deleteImageFromKey, getPresignedMediaImageUrl } from '@/src/app/(main)/upload-image-actions';
import { Image } from 'primereact/image';

type CurrencyFormProps = {
  media: IMedia;
  hideDialog: () => void;
};

const MediaForm = ({ media, hideDialog }: CurrencyFormProps) => {
  const router = useRouter();
  const fileInputRef = useRef<FileUpload>(null);
  const [uploadingState, setUploadingState] = useState<0 | 1 | 2>(0);
  const { showToast } = useToastContext();
  const {
    getValues,
    setValue,
    control,
    handleSubmit,
    reset,
    formState: { isLoading }
  } = useForm<IMedia>({
    defaultValues: {
      id: '',
      fileKey: '',
      fileUrl: '',
      comments: '',
      mimeType: ''
    }
  });

  useEffect(() => {
    reset({
      id: media?.id || '',
      fileKey: media?.fileKey || '',
      fileUrl: media?.fileUrl || '',
      comments: media?.comments || '',
      mimeType: media?.mimeType || ''
    });
  }, [media, reset]);

  const callServerAction = async (data: IMedia) => {
    if (media?.id) {
      return await updateMedia(data);
    } else {
      return await createMedia(data);
    }
  };

  const submitForm = (data: IMedia) => {
    return callServerAction(data)
      .then((resp) => {
        if (resp.error) {
          showToast('error', 'Error', resp.error ?? 'Upload failed');
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
      .finally(() => { });
  };

  const onSelectImage = async (event: FileUploadSelectEvent) => {
    await deleteImageFromKey(getValues().fileKey);
    console.log(event);
    if (event.files.length > 0) {
      event.files.forEach((image) => {
        setUploadingState(1);
        getPresignedMediaImageUrl(image.name, image.type)
          .then(async (resp) => {
            if ('error' in resp) {
              showToast('error', 'Error', resp.error ?? 'Upload failed');
              setUploadingState(2);
              fileInputRef.current?.clear();
              return;
            }
            const { key, imageUrl, presignedUrl } = resp;
            setValue('fileKey', key!);
            setValue('fileUrl', imageUrl);
            setValue('mimeType', image.type);
            const requestOptions = {
              method: 'PUT',
              headers: {
                'Content-Type': image.type
              },
              body: image
            };
            try {
              const res = await fetch(presignedUrl!, requestOptions);
              console.log('S3 Upload Response:', res.status, res.statusText);

              if (res.ok) {
                fileInputRef.current?.clear();
                setUploadingState(0);
                showToast('success', 'Success', 'File uploaded successfully');
                return;
              }

              // Log S3 error for debugging
              const errorText = await res.text();
              console.error('S3 Upload Error:', res.status, errorText);
              showToast('error', 'Upload Failed', `S3 Error: ${res.status} - ${res.statusText}`);
              fileInputRef.current?.clear();
              setUploadingState(2);
            } catch (e) {
              console.error('Upload exception:', e);
              showToast('error', 'Upload Failed', 'Network error during upload');
              fileInputRef.current?.clear();
              setUploadingState(2);
            }
          })
          .catch((resp) => {
            console.error('Presigned URL error:', resp);
            showToast('error', 'Error', 'Failed to get upload URL');
            fileInputRef.current?.clear();
            setUploadingState(2);
          });
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
        <input type="hidden" name="id" value={media?.id} />
        <input type="hidden" name="fileKey" value={media?.fileKey} />
        <Controller
          name="fileUrl"
          control={control}
          render={({ field, fieldState }) => {
            return (
              <>
                {field.value && <Image preview src={field.value} className="mb-2 h-60" />}
                <input type="hidden" {...field} value={field.value || ''} />
              </>
            );
          }}
        />
        <input type="hidden" name="mimeType" value={media?.mimeType!} />
        <div className="field mb-2">
          <FileUpload ref={fileInputRef} mode="basic" maxFileSize={1000000} onSelect={onSelectImage} />
        </div>
        {uploadingState === 1 && <div className="text-blue-500">Image uploading.</div>}
        {uploadingState === 2 && <div className="text-red-500">Image upload failed.</div>}
        <div className="field">
          <label htmlFor="comments">Comments</label>
          <Controller
            name="comments"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Comment is required.'
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
        <div className="flex flex-row gap-4">
          <Button label="Cancel" type="reset" icon="pi pi-times" severity="danger" onClick={hideDialog} />
          <Button disabled={uploadingState === 1} type="submit" label="Save" icon="pi pi-check" />
        </div>
      </form>
    </>
  );
};

export default MediaForm;
