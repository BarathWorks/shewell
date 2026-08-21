import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
import { InputTextarea } from 'primereact/inputtextarea';
import { Chips } from 'primereact/chips';
import uploadBlogImage from '../../upload-blog-image-action';

type BlogCategoryFormProps = {
  blog: IBlogForm;
  blogCategories: IBlogCategorySelect[];
  hideDialog: () => void;
};

const BlogForm = ({ blog, blogCategories, hideDialog }: BlogCategoryFormProps) => {
  const router = useRouter();
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
            console.log("blog mediaId",res, presignedUrl, id, fileUrl);
            if (res.ok) {
              setValue('mediaId', id!);
              setImageUrl(fileUrl);
              fileInputRef.current?.clear();
            }
          })
          .catch(() => {
            fileInputRef.current?.clear();
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
        {blog.media && blog.media.fileUrl && !imageUrl && <Image src={blog.media.fileUrl} alt="Image" className="relative" width="100" height="auto" preview />}
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

          <div className="field">
            <Controller
              name="popularBlog"
              control={control}
              render={({ field }) => {
                return (
                  <div className="flex gap-2">
                    <Checkbox
                      inputId="popularBlog"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(!!e.checked)}
                    />

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
