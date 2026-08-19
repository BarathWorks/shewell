import { Controller, useForm } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import SubmitButton from '@/src/_components/shared/submit-button';
import React, { useEffect, useRef, useState } from 'react';
import useToastContext from '@/src/_hooks/useToast';
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
  const fileInputRef = useRef<FileUpload>(null);
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
              fileInputRef.current?.clear();
            }
          })
          .catch((err) => {
            console.log('Error on Changing Image', err);
            fileInputRef.current?.clear();
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
        {homepageBanner.media && homepageBanner.media.fileUrl && !imageUrl && <Image src={homepageBanner.media.fileUrl} alt="Image" className="relative" width="100" height="auto" preview />}
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
