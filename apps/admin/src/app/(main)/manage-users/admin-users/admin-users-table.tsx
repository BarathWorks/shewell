'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import React, { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from 'react';
import { Demo } from '@/types';
import { Tag } from 'primereact/tag';
import AdminUserForm from '@/src/app/(main)/manage-users/admin-users/admin-user-form';
import { FilterMatchMode } from 'primereact/api';
import { ADMIN_ROLES, type IAdminUser } from '@/src/_models/admin-user.model';

const AdminUsersTable = ({ adminUsers }: { adminUsers: { id: string; email: string; name: string }[] }) => {
  const emptyAdminUser = { id: '', email: '', name: '', password: '', active: false };
  const [adminUserDialog, setAdminUserDialog] = useState(false);
  const [adminUser, setAdminUser] = useState<typeof emptyAdminUser>(emptyAdminUser);
  const [selectedAdminUsers, setSelectedAdminUsers] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<any>>(null);

  const openNew = () => {
    setAdminUser({ ...emptyAdminUser });
    setAdminUserDialog(true);
  };

  const hideDialog = () => {
    setAdminUserDialog(false);
  };

  const editAdminUser = (adminUser: typeof emptyAdminUser) => {
    setAdminUser({ ...adminUser });
    setAdminUserDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <div className="my-2">
          <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
        </div>
      </React.Fragment>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <React.Fragment>
        {/*<FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />*/}
        <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
      </React.Fragment>
    );
  };

  const idBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Id</span>
        {rowData.id}
      </>
    );
  };

  const nameBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.name}
      </>
    );
  };

  const emailBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Email</span>
        {rowData.email}
      </>
    );
  };

  const roleBodyTemplate = (rowData: IAdminUser) => {
    const label = ADMIN_ROLES.find((r) => r.value === rowData.role)?.label ?? rowData.role ?? '—';
    return (
      <>
        <span className="p-column-title">Role</span>
        {label}
      </>
    );
  };

  const activeBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };

  const actionBodyTemplate = (rowData: typeof emptyAdminUser) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editAdminUser(rowData)} />
      </>
    );
  };

  const onGlobalFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters: any = { ...filters };

    _filters.global.value = value;

    setFilters(_filters);
    setGlobalFilter(value);
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Manage Admin Users</h5>
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." />
      </span>
    </div>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

          <DataTable
            stripedRows
            ref={dt}
            value={adminUsers}
            selection={selectedAdminUsers}
            onSelectionChange={(e) => setSelectedAdminUsers(e.value as any)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            // globalFilter={globalFilter}
            filters={filters}
            globalFilterFields={['id', 'name', 'email']}
            emptyMessage="No products found."
            header={header}
            exportFilename="Admin Users"
          >
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="email" header="Email" sortable body={emailBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="role" header="Role" sortable body={roleBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <Dialog visible={adminUserDialog} style={{ width: '450px' }} header="Admin User Details" modal className="p-fluid" onHide={hideDialog}>
            <AdminUserForm adminUser={adminUser} hideDialog={hideDialog} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersTable;
