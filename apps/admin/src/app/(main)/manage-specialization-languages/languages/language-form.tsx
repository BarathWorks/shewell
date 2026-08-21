import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import SubmitButton from '@/src/_components/shared/submit-button';
import React, { useEffect } from 'react';
import useToastContext from '@/src/_hooks/useToast';
import { ICountrySelect } from '@/src/_models/country.model';
import { IState } from '@/src/_models/state.model';
import { createState, updateState } from '@/src/app/(main)/manage-locations/states/state-actions';
import { Dropdown } from 'primereact/dropdown';

import { Checkbox } from 'primereact/checkbox';
import { createLanguages, updateLanguages } from './language-action';
interface ILanguage {
  id: string;
  language: string;
  active: boolean;
}
type CurrencyFormProps = {
  language: ILanguage;

  hideDialog: () => void;
};

const LanguageForm = ({ language, hideDialog }: CurrencyFormProps) => {
  const router = useRouter();
  const { showToast } = useToastContext();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isLoading },
    setValue
  } = useForm<ILanguage>({
    defaultValues: language
  });

  useEffect(() => {
    reset({ ...language });
  }, [language]);

  const callServerAction = (data: ILanguage) => {
    if (language?.id) {
      return updateLanguages(data);
    } else {
      return createLanguages(data);
    }
  };

  const submitForm = (data: ILanguage) => {
    console.log(data);
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
        console.log(err);
      })
      .finally(() => {});
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
        <input type="hidden" name="id" value={language?.id!} />
        <div className="field">
          <label htmlFor="language">Language</label>
          <Controller
            name="language"
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Language is required.'
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

export default LanguageForm;
