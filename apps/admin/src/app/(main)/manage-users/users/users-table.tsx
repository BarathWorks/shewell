'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { format } from 'date-fns';

import { IUser } from '@/src/_models/user.model';
import { deactivateUser, restoreUser } from './user-actions';

/**
 * Customer accounts — read-only, with the ability to disable and restore.
 *
 * There is no create or edit here on purpose: customers register themselves and
 * verify by OTP, and editing a patient's own details from an admin screen is not
 * something this product should offer. The previous version of this table sat on
 * top of actions whose database writes were commented out, so it reported success
 * without changing anything.
 */
const UsersTable = ({ users }: { users: IUser[] }) => {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<IUser | null>(null);
  const [busy, setBusy] = useState(false);

  const notify = (result: { message?: string; error?: string }) => {
    if (result.error) {
      toast.current?.show({ severity: 'error', summary: 'Not done', detail: result.error, life: 5000 });
    } else {
      toast.current?.show({ severity: 'success', summary: 'Done', detail: result.message, life: 3000 });
      router.refresh();
    }
  };

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const action = pending.deletedAt ? restoreUser : deactivateUser;
      notify(await action({ id: pending.id }));
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const statusBody = (row: IUser) => {
    if (row.deletedAt) return <Tag severity="danger" value="Disabled" />;
    if (!row.verifiedAt) return <Tag severity="warning" value="Unverified" />;
    return <Tag severity="success" value="Active" />;
  };

  const joinedBody = (row: IUser) => format(new Date(row.createdAt), 'd MMM yyyy');

  const actionsBody = (row: IUser) => (
    <Button
      icon={row.deletedAt ? 'pi pi-refresh' : 'pi pi-ban'}
      label={row.deletedAt ? 'Restore' : 'Disable'}
      severity={row.deletedAt ? 'secondary' : 'danger'}
      text
      size="small"
      onClick={() => setPending(row)}
    />
  );

  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search name, email or phone"
        />
      </span>
    </div>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toast ref={toast} />

          <DataTable
            value={users}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            globalFilter={search}
            globalFilterFields={['name', 'email', 'phoneNumber']}
            header={header}
            emptyMessage="No customers yet."
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} customers"
          >
            <Column field="name" header="Name" sortable headerStyle={{ minWidth: '12rem' }}></Column>
            <Column field="email" header="Email" sortable headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="phoneNumber" header="Phone" headerStyle={{ minWidth: '8rem' }}></Column>
            <Column field="registrationCount" header="Sessions" sortable headerStyle={{ minWidth: '7rem' }}></Column>
            <Column field="createdAt" header="Joined" sortable body={joinedBody} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column header="Status" body={statusBody} headerStyle={{ minWidth: '8rem' }}></Column>
            <Column body={actionsBody} headerStyle={{ minWidth: '9rem' }}></Column>
          </DataTable>

          <Dialog
            visible={!!pending}
            style={{ width: '420px' }}
            header={pending?.deletedAt ? 'Restore customer' : 'Disable customer'}
            modal
            onHide={() => setPending(null)}
            footer={
              <>
                <Button label="Cancel" icon="pi pi-times" text onClick={() => setPending(null)} disabled={busy} />
                <Button
                  label={pending?.deletedAt ? 'Restore' : 'Disable'}
                  icon="pi pi-check"
                  severity={pending?.deletedAt ? 'success' : 'danger'}
                  loading={busy}
                  onClick={confirm}
                />
              </>
            }
          >
            <p className="m-0">
              {pending?.deletedAt ? (
                <>
                  <strong>{pending?.name}</strong> will be able to sign in again.
                </>
              ) : (
                <>
                  <strong>{pending?.name}</strong> will no longer be able to sign in. Their bookings
                  and payment history are kept.
                </>
              )}
            </p>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
