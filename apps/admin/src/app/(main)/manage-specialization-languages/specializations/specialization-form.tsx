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
import { createSpecialisation, updateSpecialisation } from './specialization-action';
import { Checkbox } from 'primereact/checkbox';
interface ISpecialization {
  id: string;
  categoryId : string;
  specialization: string;
  active: boolean;
}
type CurrencyFormProps = {
  specialization: ISpecialization;
  categories: { id: string; name: string }[];
  hideDialog: () => void;
};

const SpecializationForm = ({ specialization, hideDialog, categories }: CurrencyFormProps) => {
  const router = useRouter();
  const { showToast } = useToastContext();
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

  console.log("specialization parent categories specialization form", categories)

  const submitForm = (data: ISpecialization) => {
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
        <input type="hidden" name="id" value={specialization?.id!} />
        <div className="field">
          <label htmlFor="categoryId">Category</label>
          <Controller
            name="categoryId"
            control={control}
            // rules={{
            //   required: {
            //     value: true,
            //     message: 'Category is required.'
            //   }
            // }}
            render={({ field, fieldState }) => {
              return (
                <>
                  <Dropdown {...field} options={categories} optionLabel="name" optionValue="id" placeholder="Select category" filter className="w-full" />
                  {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                </>
              );
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="name">Name</label>
          <Controller
            name="specialization"
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

export default SpecializationForm;
