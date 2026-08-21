import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import SubmitButton from '@/src/_components/shared/submit-button';
import React, { useEffect } from 'react';
import { createBlogCategory, updateBlogCategory } from '@/src/app/(main)/manage-blogs/blog-categories/blog-category-actions';
import useToastContext from '@/src/_hooks/useToast';
import { slugifyName } from '@/src/lib/utils';
import { IBlogCategory, IBlogCategoryForm } from '@/src/_models/blog-category.model';
import { Chips } from 'primereact/chips';
import { InputTextarea } from 'primereact/inputtextarea';
type BlogCategoryFormProps = {
  blogCategory: IBlogCategoryForm;
  hideDialog: () => void;
};

const BlogCategoryForm = ({ blogCategory, hideDialog }: BlogCategoryFormProps) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { isLoading }
  } = useForm<IBlogCategory>({
    defaultValues: blogCategory
  });

  useEffect(() => {
    reset({ ...blogCategory });
  }, [blogCategory]);

  const callServerAction = (data: IBlogCategory) => {
    if (blogCategory?.id) {
      return updateBlogCategory(data);
    } else {
      console.log('blog Category is', data);
      return createBlogCategory(data);
    }
  };

  const submitForm = (data: IBlogCategory) => {
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
  };

  const watchedName = watch('name');
  const slug = slugifyName(watchedName);

  useEffect(() => {
    setValue('slug', slug);
  }, [watchedName]);

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
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
                    onChange={(e) => {
                      const slug = slugifyName(e.target.value);
                      setValue('slug', slug);
                      field.onChange(e.target.value);
                    }}
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>

        <div className="field">
          <label htmlFor="slug">Slug</label>
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

        {/* Meta Title */}
        {/* <div className="field">
          <label htmlFor="metaTitle">Meta Title</label>
          <Controller
            name="metaTitle"
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
        </div> */}

        {/* Meta Description */}
        {/* <div className="field">
          <label htmlFor="metaDescription">Meta Description</label>
          <Controller
            name="metaDescription"
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
        </div> */}

        {/* Meta Keywords */}
        {/* <div className="field">
          <label htmlFor="metaKeywords">Meta Keywords</label>
          <Controller
            name="metaKeywords"
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
        </div> */}

        <div className="flex flex-row gap-4">
          <Button label="Cancel" type="reset" icon="pi pi-times" severity="danger" onClick={hideDialog} />
          <SubmitButton label="Save" icon="pi pi-check" />
        </div>
      </form>
    </>
  );
};

export default BlogCategoryForm;
