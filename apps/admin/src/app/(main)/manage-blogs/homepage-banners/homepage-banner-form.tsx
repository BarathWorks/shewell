import { Controller, useForm } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import SubmitButton from '@/src/_components/shared/submit-button';
import React, { useEffect, useRef, useState } from 'react';
import useToastContext from '@/src/_hooks/useToast';
import { ICategory } from '@/src/_models/category.model';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import { Image } from 'primereact/image';
import uploadProductImage from '@/src/app/(main)/upload-image-actions';
import { slugifyName } from '@/src/lib/utils';
import { IBlogCategory, IBlogCategorySelect } from '@/src/_models/blog-category.model';
import { IBlogForm } from '@/src/_models/blog.model';
import { createBlog, updateBlog } from '@/src/app/(main)/manage-blogs/blogs/blog-actions';
import { Editor } from 'primereact/editor';
import { IHomepageBanner, IHomepageBannerForm } from '@/src/_models/homepage-banner.model';
import { InputNumber } from 'primereact/inputnumber';
import { createHomePageBanner, updateHomepageBanner } from '@/src/app/(main)/manage-blogs/homepage-banners/homepage-banner-actions';
import { HomeBannerType } from '@repo/database';

interface IHomeBannerOptions{
  name : string;
  value : HomeBannerType
}
type BlogCategoryFormProps = {
  homepageBanner: IHomepageBannerForm;
  hideDialog: () => void;
};

const HomepageBannerForm = ({ homepageBanner, hideDialog }: BlogCategoryFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingState, setUploadingState] = useState<0 | 1 | 2>(0);
  const [imageUrl, setImageUrl] = useState<string>();
  const { showToast } = useToastContext();
  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { isLoading }
  } = useForm<IHomepageBannerForm>({
    defaultValues: homepageBanner
  });

  useEffect(() => {
    reset({ ...homepageBanner });
  }, [homepageBanner]);

  const callServerAction = (data: IHomepageBannerForm) => {
    if (homepageBanner?.id) {
      return updateHomepageBanner(data);
    } else {
      return createHomePageBanner(data);
    }
  };

  const submitForm = (data: IHomepageBannerForm) => {
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
  };

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
            console.log('mediaId on selecting Image', res, presignedUrl, id);
            if (res.ok) {
              setValue('mediaId', id!);
              console.log('mediaId on select image', id);
              setImageUrl(fileUrl);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }
          })
          .catch((err) => {
            console.log('Error on Changing Image', err);
            if (fileInputRef.current) fileInputRef.current.value = '';
          });
      });
    }
  };

  const homeBannerOptions : IHomeBannerOptions[] = [
    { name: 'Home Banner for Client', value: HomeBannerType.HomeBannerClient },
    { name: 'Home Banner for Doctor', value: HomeBannerType.HomeBannerDoctor }
  ];

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
        <input type="hidden" name="id" value={homepageBanner?.id} />
        <div className="field mb-4">
          <label className="text-[13px] font-semibold text-on-surface-variant mb-1.5 block">Banner Image</label>
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
          {imageUrl || (homepageBanner.media && homepageBanner.media.fileUrl) ? (
            <div className="relative group w-full max-w-[320px] h-[160px] rounded-xl overflow-hidden border border-outline-variant/60">
              <img src={imageUrl || homepageBanner.media.fileUrl} className="w-full h-full object-cover" alt="Banner preview" />
              <button 
                type="button"
                onClick={() => {
                  setImageUrl('');
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
              className="w-full max-w-[320px] h-[160px] flex flex-col items-center justify-center gap-1.5 border border-dashed border-outline-variant/60 rounded-xl hover:bg-surface/50 hover:border-brand/40 transition-all text-on-surface-variant bg-white"
            >
              <span className="material-symbols-outlined text-[24px]">add_photo_alternate</span>
              <span className="text-[12px] font-medium">Choose Image</span>
            </button>
          )}
        </div>
        <div className="field">
          <label htmlFor="name">Order</label>
          <Controller
            name="order"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Order is required.'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <InputNumber
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                    {...field}
                    onChange={(e) => field.onChange(e.value)}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="url">Url</label>
          <Controller
            name="url"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Url is required.'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <InputText
                    type="text"
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
          <Controller
            name="usedFor"
            control={control}
            render={({ field }) => {
              return (
                <div>
                  <Dropdown value={field.value} onChange={field.onChange} options={homeBannerOptions} optionLabel="name" placeholder="Select an option" optionValue="value" className="w-full " />
                </div>
              );
            }}
          />
        </div>

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

export default HomepageBannerForm;
