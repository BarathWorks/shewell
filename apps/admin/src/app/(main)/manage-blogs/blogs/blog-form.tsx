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
import { InputTextarea } from 'primereact/inputtextarea';
import { Chips } from 'primereact/chips';
import uploadBlogImage from '../../upload-blog-image-action';

type BlogCategoryFormProps = {
  blog: IBlogForm;
  blogCategories: IBlogCategorySelect[];
  hideDialog: () => void;
};

const BlogForm = ({ blog, blogCategories, hideDialog }: BlogCategoryFormProps) => {
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
  } = useForm<IBlogForm>({
    defaultValues: blog
  });

  useEffect(() => {
    reset({ ...blog });
  }, [blog]);

  const callServerAction = (data: IBlogForm) => {
    if (blog?.id) {
      console.log('we are updating the blog', blog.id);
      console.log('updating the blog with this id having data is', data);
      return updateBlog(data);
    } else {
      console.log('blog created', data);
      return createBlog(data);
    }
  };

  const submitForm = (data: IBlogForm) => {
    console.log('blog data is', data);
    return callServerAction(data)
      .then((resp) => {
        if (resp?.error) {
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
            console.log("blog mediaId",res, presignedUrl, id, fileUrl);
            if (res.ok) {
              setValue('mediaId', id!);
              setImageUrl(fileUrl);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }
          })
          .catch(() => {
            if (fileInputRef.current) fileInputRef.current.value = '';
          });
      });
    }
  };

  // const onSelectImage = async (event: FileUploadSelectEvent) => {
  //   if (event.files.length > 0) {
  //     event.files.forEach((image) => {
  //       setUploadingState(1);
  //       uploadBlogImage(blog.id!, `blogs/${blog.id}`, image.name, image.type)
  //         .then(async (resp) => {
  //           const { id, fileUrl, presignedUrl } = resp;
  //           const requestOptions = {
  //             method: 'PUT',
  //             body: image
  //           };
  //           const res = await fetch(presignedUrl!, requestOptions);
  //           console.log(res, presignedUrl, id);
  //           if (res.ok) {
  //             setValue('mediaId', id!);
  //             setImageUrl(fileUrl!);
  //             fileInputRef.current?.clear();
  //           }
  //         })
  //         .catch((error) => {
  //           fileInputRef.current?.clear();
  //           console.log('error while uploading image', error);
  //         });
  //     });
  //   }
  // };

  // const onSelectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!event.target.files) {
  //     return;
  //   }
  //   if (event.target.files.length! > 0) {
  //     for (const image of event.target.files) {
  //       setUploadingState(1);
  //       const arrayOfKeys = image.name.split(".");
  //       uploadProfessionalUserImage(
  //         professionalUserId,
  //         `professionalUser/${professionalUserId}/profile.${arrayOfKeys[arrayOfKeys.length - 1]}`,
  //         image.name,
  //         image.type,
  //       )
  //         .then(async (resp) => {
  //           const { id, fileUrl, presignedUrl } = resp;
  //           const requestOptions = {
  //             method: "PUT",
  //             body: image,
  //           };
  //           const res = await fetch(presignedUrl!, requestOptions);
  //           console.log(res, presignedUrl, id);
  //           if (res.ok) {
  //             setValue("mediaId", id!);
  //             setImageUrl(fileUrl!);
  //             fileInputRef.current?.value;
  //           }
  //         })
  //         .catch((error) => {
  //           fileInputRef.current?.value;
  //           console.log("error while uploading image", error);
  //         });
  //     }
  //   }
  // };
  const generateSlug = () => {
    const title = getValues('title');
    setValue('slug', slugifyName(title));
  };

  console.log("BlogId on blog Form",blog.id)
  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
        <input type="hidden" name="id" value={blog?.id} />
        <div className="field mb-4">
          <label className="text-[13px] font-semibold text-on-surface-variant mb-1.5 block">Blog Cover Image</label>
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
          {imageUrl || (blog.media && blog.media.fileUrl) ? (
            <div className="relative group w-full max-w-[320px] h-[160px] rounded-xl overflow-hidden border border-outline-variant/60">
              <img src={imageUrl || blog.media.fileUrl} className="w-full h-full object-cover" alt="Blog cover" />
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
          <label htmlFor="name">Blog Category</label>
          <Controller
            name="categoryId"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Blog Category is required.'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <Dropdown
                    filter
                    options={blogCategories}
                    optionLabel="name"
                    optionValue="id"
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

        <div className="field">
          <label htmlFor="name">Title</label>
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
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="name">Author</label>
          <Controller
            name="author"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Author is required.'
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

        <div className="field">
          <label htmlFor="slug">
            Slug &nbsp;
            <a className="cursor-pointer" onClick={() => generateSlug()}>
              Generate Slug
            </a>
          </label>
          <Controller
            name="slug"
            control={control}
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

        <div className="field">
          <label htmlFor="shortDescription">Short Description</label>
          <Controller
            name="shortDescription"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Short Description is required.'
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

        <div className="field">
          <label htmlFor="body">Body</label>
          <Controller
            name="body"
            control={control}
            render={({ field, fieldState }) => {
              return (
                <>
                  <Editor
                    id={field.name}
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                    {...field}
                    value={field.value}
                    onTextChange={(e) => field.onChange(e.htmlValue)}
                    style={{ height: '320px' }}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="seoTitle">SEO Title</label>
          <Controller
            name="seoTitle"
            control={control}
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
          <label htmlFor="seoDescription">SEO Description</label>
          <Controller
            name="seoDescription"
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
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="seoKeywords">SEO Keywords</label>
          <Controller
            name="seoKeywords"
            control={control}
            render={({ field, fieldState }) => {
              return (
                <>
                  <Chips
                    className={classNames({
                      'p-invalid': fieldState.error
                    })}
                    {...field}
                    value={field.value || []}
                    separator=","
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div className="flex flex-row gap-2">
          <div className="field">
            <Controller
              name="active"
              control={control}
              render={({ field }) => {
                return (
                  <div className="flex gap-2">
                    <Checkbox checked={field.value} {...field} onChange={(v) => setValue('active', v.checked!)} />

                    <label htmlFor="active">Active</label>
                  </div>
                );
              }}
            />
          </div>

          <div className="field">
            <Controller
              name="popularBlog"
              control={control}
              render={({ field }) => {
                return (
                  <div className="flex gap-2">
                    <Checkbox checked={field.value!} {...field} onChange={(v) => setValue('popularBlog', v.checked!)} />

                    <label htmlFor="popularBlog">Popular Blog</label>
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

export default BlogForm;
