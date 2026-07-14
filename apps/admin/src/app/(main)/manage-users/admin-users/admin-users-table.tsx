'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import { Demo } from '@/types';
import { Tag } from 'primereact/tag';
import AdminUserForm from '@/src/app/(main)/manage-users/admin-users/admin-user-form';
import { FilterMatchMode } from 'primereact/api';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

const AdminUsersTable = ({ adminUsers }: { adminUsers: { id: string; email: string; name: string }[] }) => {
  const emptyAdminUser = { id: '', email: '', name: '', password: '', active: false };
  const [adminUserDialog, setAdminUserDialog] = useState(false);
  const [adminUser, setAdminUser] = useState<typeof emptyAdminUser>(emptyAdminUser);
  const [selectedAdminUsers, setSelectedAdminUsers] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
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

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <TableToolbar
            newLabel="New Admin User"
            onNew={openNew}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search admin users..."
          />

          <DataTable
            stripedRows
            ref={dt}
            value={adminUsers}
            selection={selectedAdminUsers}
            onSelectionChange={(e) => setSelectedAdminUsers(e.value as any)}
            dataKey="id"
            rows={rows}
            first={first}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'name', 'email']}
            emptyMessage="No admin users found."
            exportFilename="Admin Users"
          >
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="email" header="Email" sortable body={emailBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={adminUsers.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="admin users"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={adminUserDialog} style={{ width: '450px' }} header="Admin User Details" modal className="p-fluid" onHide={hideDialog}>
            <AdminUserForm adminUser={adminUser} hideDialog={hideDialog} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersTable;
