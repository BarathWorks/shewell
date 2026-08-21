import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import SubmitButton from '@/src/_components/shared/submit-button';
import React, { useEffect, useRef, useState } from 'react';
import useToastContext from '@/src/_hooks/useToast';
import { ICountrySelect } from '@/src/_models/country.model';
import { IState } from '@/src/_models/state.model';
import { createState, updateState } from '@/src/app/(main)/manage-locations/states/state-actions';
import { Dropdown } from 'primereact/dropdown';

import { Checkbox } from 'primereact/checkbox';
import { createSpecialisation, updateSpecialisation } from './specialization-parent-category-action';
import { IMedia } from '@/src/_models/media.model';
import { Image } from 'primereact/image';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import uploadProductImage from '../../upload-image-actions';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
interface ISpecialization {
  id: string;
  name: string;
  active: boolean;
  mediaId: string;
  media : IMedia | null
}
type CurrencyFormProps = {
  specialization: ISpecialization;

  hideDialog: () => void;
};

const SpecializationParentCategoryForm = ({ specialization, hideDialog }: CurrencyFormProps) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const [uploadingState, setUploadingState] = useState<0 | 1 | 2>(0);
  const [imageUrl, setImageUrl] = useState<string>();
  const [showError, setShowError] = useState<boolean>(false);
  const fileInputRef = useRef<FileUpload>(null);

  
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { isLoading },
    setValue
  } = useForm<ISpecialization>({
    defaultValues: specialization
  });

  useEffect(() => {
    reset({ ...specialization });
  }, [specialization]);

  const callServerAction = (data: ISpecialization) => {
    if (specialization?.id) {
      return updateSpecialisation(data);
    } else {
      return createSpecialisation(data);
    }
  };

  const onSelectImage = async (event: FileUploadSelectEvent) => {
    
    if (event.files.length > 0) {
      event.files.forEach((image) => {
        setUploadingState(1);
        uploadProductImage(image.name, image.type)
          .then(async (resp) => {
            // The server rejects unsupported file types; surface that instead of
            // destructuring an error object into undefined ids.
            if ('error' in resp) {
              setUploadingState(0);
              return;
            }
            const { id, fileUrl, presignedUrl } = resp;
            const requestOptions = {
              method: 'PUT',
              body: image
            };
            const res = await fetch(presignedUrl!, requestOptions);
            console.log(res, presignedUrl, id);
            if (res.ok) {
              setValue('mediaId', id!);
              setImageUrl(fileUrl);
              setShowError(false)
              fileInputRef.current?.clear();
            }
          })
          .catch(() => {
            fileInputRef.current?.clear();
          });
      });
    }
  };

  const submitForm = (data: ISpecialization) => {
    console.log(data);
    if(!imageUrl){
      setShowError(true)
      console.log("image required")
      
      return
    }
    return callServerAction(data)
      .then((resp) => {
        // if (resp.error) {
        //   showToast('error', 'Error', resp.error);
        // }
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
        console.log("error",err);
      })
      .finally(() => {});
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
        <input type="hidden" name="id" value={specialization?.id!} />
        {specialization.media && specialization.media.fileUrl && !imageUrl && <Image src={specialization.media.fileUrl} alt="Image" className="relative" width="100" height="auto" preview />}
        {imageUrl && <Image src={imageUrl} alt="Image" className="relative" width="100" height="auto" preview />}
       
        <div className="field mb-2">
          <FileUpload
            ref={fileInputRef}
            mode="basic"
            accept="image/*"
            // maxFileSize={1000000}
            onSelect={onSelectImage}
            onError={(e) => {
              console.log(e);
              // showToast('error', 'Error',);
            }}
          />
           {showError && <small className = "p-error" >Please upload the image</small>}
        </div>
        <div className="field">
          <label htmlFor="name">Specialization Parent Category</label>
          <Controller
            name="name"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Specialization Parent Category is required.'
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
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div>
          <div className="field">
            <Controller
              name="active"
              control={control}
              render={({ field }) => {
                return (
                  <div className="flex gap-2">
                    <Checkbox
                      inputId="active"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(!!e.checked)}
                    />

                    <label htmlFor="active">Active</label>
                  </div>
                );
              }}
            />
          </div>
        </div>

        <div className="flex flex-row gap-4">
          <Button label="Cancel" type="reset" icon="pi pi-times" severity="danger" onClick={hideDialog} />
          <SubmitButton label="Save" icon="pi pi-check" />
        </div>
      </form>
    </>
  );
};

export default SpecializationParentCategoryForm;
