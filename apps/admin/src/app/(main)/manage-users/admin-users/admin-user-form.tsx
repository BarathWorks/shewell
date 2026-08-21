import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import SubmitButton from '@/src/_components/shared/submit-button';
import React, { useEffect, useRef } from 'react';
import { createAdminUser, updateAdminUser } from '@/src/app/(main)/manage-users/admin-users/admin-user-actions';
import useToastContext from '@/src/_hooks/useToast';
import { IAdminUser } from '@/src/_models/admin-user.model';
import { ADMIN_ROLES } from '@/src/_models/admin-user.model';

type AdminUserFormProps = {
  adminUser: IAdminUser;
  hideDialog: () => void;
};

const AdminUserForm = ({ adminUser, hideDialog }: AdminUserFormProps) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isLoading }
  } = useForm<IAdminUser>({
    defaultValues: adminUser
  });

  useEffect(() => {
    reset({ ...adminUser });
  }, [adminUser]);

  const callServerAction = (data: IAdminUser) => {
    if (adminUser?.id) {
      return updateAdminUser(data);
    } else {
      return createAdminUser(data);
    }
  };

  const submitForm = (data: IAdminUser) => {
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

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
        <input type="hidden" name="id" value={adminUser?.id} />
        <div className="field">
          <label htmlFor="name">Name (Required*)</label>
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
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email (Required*)</label>
          <Controller
            name="email"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Email is required.'
              },
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address. E.g. example@email.com'
              }
            }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <InputText
                    type="email"
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
          <label htmlFor="role">Role (Required*)</label>
          <Controller
            name="role"
            control={control}
            rules={{ required: { value: true, message: 'Role is required.' } }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <Dropdown
                    id="role"
                    value={field.value}
                    options={ADMIN_ROLES}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select a role"
                    className={classNames({ 'p-invalid': fieldState.error })}
                    onChange={(e) => {
                      setValue('role', e.value);
                      field.onChange(e.value);
                    }}
                    itemTemplate={(option) => (
                      <div>
                        <div>{option.label}</div>
                        <small className="text-500">{option.description}</small>
                      </div>
                    )}
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
            render={({ field, fieldState }) => {
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
        {!adminUser?.id && (
          <div className="field">
            <label htmlFor="password">Password (Required*)</label>
            <Controller
              name="password"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Password is required.'
                },
                minLength: {
                  value: 12,
                  message: 'Password should be minimum 8 characters'
                }
              }}
              render={({ field, fieldState }) => {
                return (
                  <>
                    <Password feedback={false} placeholder="Password" toggleMask className="w-full" inputClassName="w-full p-3" {...field}></Password>
                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                  </>
                );
              }}
            />
          </div>
        )}

        <div className="flex flex-row gap-4">
          <Button label="Cancel" type="reset" icon="pi pi-times" severity="danger" onClick={hideDialog} />
          <SubmitButton label="Save" icon="pi pi-check" />
        </div>
      </form>
    </>
  );
};

export default AdminUserForm;
