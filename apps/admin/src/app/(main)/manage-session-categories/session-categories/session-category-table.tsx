'use client';

import { ISessionCategory } from '@/src/_models/session-category.model';
import { Trimester } from '@repo/database';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useRef, useState } from 'react';
import { deleteSessionCategory } from './session-category-actions';
import SessionCategoryForm from './session-category-form';
import TableToolbar from '@/src/_components/shared/TableToolbar';

type SessionCategoryTableProps = {
    sessionCategories: ISessionCategory[];
};

const SessionCategoryTable = ({ sessionCategories }: SessionCategoryTableProps) => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [sessionCategoryDialog, setSessionCategoryDialog] = useState(false);
    const [selectedSessionCategory, setSelectedSessionCategory] = useState<ISessionCategory | null>(null);
    const emptySessionCategory: ISessionCategory = { name: '', slug: '', trimester: Trimester.FIRST };
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [deleteSessionCategoryDialog, setDeleteSessionCategoryDialog] = useState<boolean>(false);

    const [sessionCategory, setSessionCategory] = useState<ISessionCategory>(emptySessionCategory);
    const dt = useRef<DataTable<any>>(null);
    const toast = useRef<Toast>(null);

    const onGlobalFilterChange = (value: string) => {
        let _filters: any = { ...filters };
        _filters.global.value = value;
        setFilters(_filters);
        setGlobalFilter(value);
    };

    const hideDeleteSessionCategoryDialog = () => {
        setDeleteSessionCategoryDialog(false);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const hideDialog = () => {
        setSessionCategoryDialog(false);
    };

    const openNew = () => {
        setSessionCategory({ ...emptySessionCategory });
        setSessionCategoryDialog(true);
    };



    const editSessionCategory = (sessionCategory: ISessionCategory) => {
        setSessionCategory({ ...sessionCategory });
        setSessionCategoryDialog(true);
    };

    const confirmDeleteSessionCategory = (sessionCategory: ISessionCategory) => {
        setSelectedSessionCategory(sessionCategory);
        setDeleteSessionCategoryDialog(true);
    };

    const actionBodyTemplate = (rowData: ISessionCategory) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editSessionCategory(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" className="mr-2" onClick={() => confirmDeleteSessionCategory(rowData)} />
            </>
        );
    };

    const deleteSelectedSessionCategory = () => {
        if (!selectedSessionCategory?.id) {
            return;
        }
        deleteSessionCategory([selectedSessionCategory.id])
            .then(() => {
                setDeleteSessionCategoryDialog(false);
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Session Category Deleted', life: 3000 });
            })
            .catch((e) => {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Deletion Failed', life: 3000 });
            });
    };

    const deleteSessionCategoryDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" severity="secondary" onClick={hideDeleteSessionCategoryDialog} />
            <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedSessionCategory} />
        </React.Fragment>
    );

    return (
        <>
            <Toast ref={toast} />
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <TableToolbar
                            newLabel="New Session Category"
                            onNew={openNew}
                            onExport={exportCSV}
                            searchValue={globalFilter}
                            onSearchChange={onGlobalFilterChange}
                            searchPlaceholder="Search session categories..."
                        />
                        <DataTable
                            stripedRows
                            ref={dt}
                            value={sessionCategories}
                            dataKey="id"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
                            filters={filters}
                            globalFilterFields={['name', 'slug']}
                            emptyMessage="No session categories found."
                            exportFilename="SessionCategories"
                        >
                            <Column field="name" header="Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="slug" header="Slug" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="trimester" header="Trimester" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
                        </DataTable>

                        <Dialog header="Session Category Details" modal className="p-fluid" visible={sessionCategoryDialog} style={{ width: '50vw' }} onHide={hideDialog}>
                            <SessionCategoryForm sessionCategory={sessionCategory} hideDialog={hideDialog} />
                        </Dialog>

                        <Dialog visible={deleteSessionCategoryDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteSessionCategoryDialogFooter} onHide={hideDeleteSessionCategoryDialog}>
                            <div className="confirmation-content">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                <span>Are you sure you want to delete this session category?</span>
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SessionCategoryTable;
