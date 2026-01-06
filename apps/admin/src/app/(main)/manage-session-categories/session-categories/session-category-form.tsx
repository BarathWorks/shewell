import SubmitButton from '@/src/_components/shared/submit-button';
import useToastContext from '@/src/_hooks/useToast';
import { ISessionCategory } from '@/src/_models/session-category.model';
import { Trimester } from '@repo/database';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Controller, useForm } from 'react-hook-form';
import { createSessionCategory, updateSessionCategory } from './session-category-actions';

type SessionCategoryFormProps = {
    hideDialog: () => void;
    sessionCategory: ISessionCategory;
};

const SessionCategoryForm = ({ hideDialog, sessionCategory }: SessionCategoryFormProps) => {
    const { showToast } = useToastContext();
    const { control, handleSubmit } = useForm<ISessionCategory>({
        defaultValues: sessionCategory
    });

    const trimesterOptions = Object.values(Trimester).map((t) => ({ label: t, value: t }));

    const callServerAction = (data: ISessionCategory) => {
        if (sessionCategory?.id) return updateSessionCategory({ ...data, id: sessionCategory.id });
        else return createSessionCategory(data);
    };

    const submitForm = (data: ISessionCategory) => {
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
            });
    };

    return (
        <>
            <form onSubmit={handleSubmit(submitForm)} noValidate={true}>
                {/* Field for name */}
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
                                        value={field.value || ''}
                                        autoFocus
                                    />
                                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                </>
                            );
                        }}
                    />
                </div>

                {/* Field for slug */}
                <div className="field">
                    <label htmlFor="slug">Slug</label>
                    <Controller
                        name="slug"
                        control={control}
                        rules={{
                            required: {
                                value: true,
                                message: 'Slug is required.'
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
                                        value={field.value || ''}
                                    />
                                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                </>
                            );
                        }}
                    />
                </div>

                {/* Field for trimester */}
                <div className="field">
                    <label htmlFor="trimester">Trimester</label>
                    <Controller
                        name="trimester"
                        control={control}
                        rules={{
                            required: {
                                value: true,
                                message: 'Trimester is required.'
                            }
                        }}
                        render={({ field, fieldState }) => {
                            return (
                                <>
                                    <Dropdown
                                        id={field.name}
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.value)}
                                        options={trimesterOptions}
                                        optionLabel="label"
                                        placeholder="Select a Trimester"
                                        className={classNames({
                                            'p-invalid': fieldState.error
                                        })}
                                    />
                                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                </>
                            );
                        }}
                    />
                </div>

                <div className="flex flex-row gap-4 mt-4">
                    <Button label="Cancel" type="button" icon="pi pi-times" severity="danger" onClick={hideDialog} />
                    <SubmitButton label="Save" icon="pi pi-check" />
                </div>
            </form>
        </>
    );
};

export default SessionCategoryForm;
