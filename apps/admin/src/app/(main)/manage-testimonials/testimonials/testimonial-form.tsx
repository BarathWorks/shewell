import SubmitButton from '@/src/_components/shared/submit-button';
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
import uploadProductImage from '../../upload-image-actions';
type TestimonialFormProps = {
  hideDialog: () => void;
  testimonial: ITestimonial;
};
const TestimonialForm = ({ hideDialog, testimonial }: TestimonialFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingState, setUploadingState] = useState<0 | 1 | 2>(0);
  const [testimonialImageUrl, setTestimonialImageUrl] = useState<string>();
  const [showError, setShowError] = useState<boolean>(false);
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

  const onSelectImage = async (event: FileUploadSelectEvent) => {
    
    if (event.files.length > 0) {
      event.files.forEach((image) => {
        setUploadingState(1);
        uploadProductImage(image.name, image.type)
          .then(async (resp) => {
            const { id, fileUrl, presignedUrl } = resp;
            const requestOptions = {
              method: 'PUT',
              body: image
            };
            const res = await fetch(presignedUrl!, requestOptions);
            console.log(res, presignedUrl, id);
            if (res.ok) {
              setValue('mediaId', id!);
              setTestimonialImageUrl(fileUrl);
              setShowError(false)
              if (fileInputRef.current) fileInputRef.current.value = '';
            }
          })
          .catch(() => {
            if (fileInputRef.current) fileInputRef.current.value = '';
          });
      });
    }
  };


  const callServerAction = (data: ITestimonial) => {
    if (testimonial?.id) return updateTestimonial(data);
    else return createTestimonial(data);
  };
  const submitForm = (data: ITestimonial) => {
    if(!testimonialImageUrl){
      setShowError(true)
      console.log("image required")
      
      return
    }
    return callServerAction(data)
      .then((resp) => {
        if (resp.error) {
          showToast('error', 'Error', resp.error);
        }

        if (resp.message) {
          showToast('success', 'Successful', resp.message);
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
        <div className="field mb-4">
          <label className="text-[13px] font-semibold text-on-surface-variant mb-1.5 block">Testimonial Image</label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onSelectImage({ files: [file] } as any);
              }
            }} 
            accept="image/*" 
            className="hidden" 
          />
          {testimonialImageUrl || (testimonial.media && testimonial.media.fileUrl) ? (
            <div className="relative group w-full max-w-[200px] h-[200px] rounded-full overflow-hidden border border-outline-variant/60">
              <img src={testimonialImageUrl || testimonial.media.fileUrl} className="w-full h-full object-cover" alt="Testimonial preview" />
              <button 
                type="button"
                onClick={() => {
                  setTestimonialImageUrl('');
                  setValue('mediaId', '');
                }}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1.5 hover:bg-black transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] block">delete</span>
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-[200px] h-[200px] flex flex-col items-center justify-center gap-1.5 border border-dashed border-outline-variant/60 rounded-full hover:bg-surface/50 hover:border-brand/40 transition-all text-on-surface-variant bg-white"
            >
              <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
              <span className="text-[12px] font-medium text-center px-2">Choose Image</span>
            </button>
          )}
          {showError && <small className="p-error block mt-1">Please upload the image</small>}
        </div>
        {/* {testimonialImageUrl && <Image src={testimonialImageUrl} alt="Image" className="relative" width="150" height="80" preview />} */}
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
                  <Checkbox checked={field.value} {...field} />
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
