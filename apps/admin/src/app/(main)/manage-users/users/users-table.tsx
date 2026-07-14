'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import UserForm from '@/src/app/(main)/manage-users/users/user-form';
import { IUser } from '@/src/_models/user.model';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

const UsersTable = ({ users }: { users: { id: string; email: string; firstName: string; middleName: string | null; lastName: string | null; accountType: string }[] }) => {
  const emptyUser: IUser = { id: '', email: '', firstName: '', middleName: '', lastName: '', accountType: 'normal', active: false, password: '' };
  const [userDialog, setUserDialog] = useState(false);
  const [user, setUser] = useState<typeof emptyUser>(emptyUser);
  const [selectedUsers, setSelectedUsers] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const dt = useRef<DataTable<any>>(null);

  const openNew = () => {
    setUser({ ...emptyUser });
    setUserDialog(true);
  };

  const hideDialog = () => {
    setUserDialog(false);
  };

  const editUser = (user: typeof emptyUser) => {
    setUser({ ...user });
    setUserDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };



  const idBodyTemplate = (rowData: any) => {
    return (
      <span className="font-bold text-primary font-data-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        #{rowData.id.substring(0, 6)}
      </span>
    );
  };

  const nameBodyTemplate = (rowData: any) => {
    const firstInitial = (rowData.firstName || '')[0] || '';
    const lastInitial = (rowData.lastName || '')[0] || '';
    const initials = (firstInitial + lastInitial).toUpperCase() || 'U';

    return (
      <div className="flex align-items-center gap-3">
        <div className="flex align-items-center justify-content-center border-round-3xl text-primary font-bold text-xs" style={{ width: '2.25rem', height: '2.25rem', backgroundColor: 'rgba(0, 137, 143, 0.08)' }}>
          {initials}
        </div>
        <span className="font-semibold text-900">{rowData.firstName} {rowData.middleName} {rowData.lastName}</span>
      </div>
    );
  };

  const emailBodyTemplate = (rowData: any) => {
    return (
      <span className="text-600 font-medium">{rowData.email}</span>
    );
  };

  const actionBodyTemplate = (rowData: typeof emptyUser) => {
    return (
      <div className="flex align-items-center justify-content-end w-full">
        <Button icon="pi pi-pencil" text rounded className="text-600 hover:text-primary hover:surface-100" onClick={() => editUser(rowData)} />
      </div>
    );
  };



  const activeBodyTemplate = (rowData: any) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Active</Tag> : <Tag severity="danger">Inactive</Tag>}
      </>
    );
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <TableToolbar
            newLabel="New User"
            onNew={openNew}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={(val) => {
              let _filters: any = { ...filters };
              _filters.global.value = val;
              setFilters(_filters);
              setGlobalFilter(val);
            }}
            searchPlaceholder="Search users..."
          />

          <DataTable
            stripedRows
            ref={dt}
            value={users}
            selection={selectedUsers}
            onSelectionChange={(e) => setSelectedUsers(e.value as any)}
            dataKey="id"
            rows={rows}
            first={first}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'name', 'email']}
            emptyMessage="No users found."
            exportFilename="Users"
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
            totalRecords={users.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="users"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={userDialog} style={{ width: '70vw' }} header="User Details" modal className="p-fluid" onHide={hideDialog}>
            <UserForm user={user} hideDialog={hideDialog} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
