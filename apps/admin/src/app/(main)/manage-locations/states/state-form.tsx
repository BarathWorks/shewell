'use client';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import SubmitButton from '@/src/_components/shared/submit-button';
import React, { useEffect } from 'react';
import useToastContext from '@/src/_hooks/useToast';
import { ICountrySelect } from '@/src/_models/country.model';
import { IStateForm } from '@/src/_models/state.model';
import { createState, updateState } from '@/src/app/(main)/manage-locations/states/state-actions';
import { Dropdown } from 'primereact/dropdown';

type StateFormProps = {
  state: IStateForm;
  countries: ICountrySelect[];
  hideDialog: () => void;
};

const StateForm = ({ state, countries, hideDialog }: StateFormProps) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const {
    control,
    handleSubmit,
    reset
  } = useForm<IStateForm>({
    defaultValues: state
  });

  useEffect(() => {
    reset({ ...state });
  }, [state, reset]);

  const callServerAction = (data: IStateForm) => {
    return state?.id ? updateState(data) : createState(data);
  };

  const submitForm = (data: IStateForm) => {
    return callServerAction(data)
      .then((resp) => {
        if (resp.error) {
          showToast('error', 'Error', resp.error);
          return;
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
      });
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
      <input type="hidden" name="id" value={state?.id ?? ''} />
      <div className="field">
        <label htmlFor="name">Name</label>
        <Controller
          name="name"
          control={control}
          rules={{ required: { value: true, message: 'Name is required.' } }}
          render={({ field, fieldState }) => (
            <>
              <InputText id="name" className={classNames({ 'p-invalid': fieldState.error })} {...field} />
              {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
            </>
          )}
        />
      </div>
      <div className="field">
        <label htmlFor="stateCode">State Code</label>
        <Controller
          name="stateCode"
          control={control}
          rules={{ required: { value: true, message: 'State Code is required.' } }}
          render={({ field, fieldState }) => (
            <>
              <InputText id="stateCode" className={classNames({ 'p-invalid': fieldState.error })} {...field} />
              {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
            </>
          )}
        />
      </div>
      <div className="field">
        <label htmlFor="countryId">Country</label>
        <Controller
          name="countryId"
          control={control}
          rules={{ required: { value: true, message: 'Country is required.' } }}
          render={({ field, fieldState }) => (
            <>
              <Dropdown
                id="countryId"
                filter
                options={countries}
                optionLabel="name"
                optionValue="id"
                placeholder="Select a country"
                className={classNames({ 'p-invalid': fieldState.error })}
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
                onBlur={field.onBlur}
              />
              {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
            </>
          )}
        />
      </div>
      <div className="flex flex-row gap-4">
        <Button label="Cancel" type="reset" icon="pi pi-times" severity="danger" onClick={hideDialog} />
        <SubmitButton label="Save" icon="pi pi-check" />
      </div>
    </form>
  );
};

export default StateForm;
