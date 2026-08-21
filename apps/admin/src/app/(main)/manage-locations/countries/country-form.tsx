import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import SubmitButton from '@/src/_components/shared/submit-button';
import React, { useEffect } from 'react';
import { createCountry, updateCountry } from '@/src/app/(main)/manage-locations/countries/country-actions';
import useToastContext from '@/src/_hooks/useToast';
import { ICountry } from '@/src/_models/country.model';

type CurrencyFormProps = {
  country: ICountry;
  hideDialog: () => void;
};

const CountryForm = ({ country, hideDialog }: CurrencyFormProps) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isLoading }
  } = useForm<ICountry>({
    defaultValues: country
  });

  useEffect(() => {
    reset({ ...country });
  }, [country]);

  const callServerAction = (data: ICountry) => {
    if (country?.id) {
      return updateCountry(data);
    } else {
      return createCountry(data);
    }
  };

  const submitForm = (data: ICountry) => {
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
        <input type="hidden" name="id" value={country?.id!} />
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
                  />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>
        <div className="field"></div>
        <div className="flex flex-row gap-4">
          <Button label="Cancel" type="reset" icon="pi pi-times" severity="danger" onClick={hideDialog} />
          <SubmitButton label="Save" icon="pi pi-check" />
        </div>
      </form>
    </>
  );
};

export default CountryForm;
