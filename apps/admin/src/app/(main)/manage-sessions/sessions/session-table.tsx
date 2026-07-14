'use client';

import { ISessionCategory } from '@/src/_models/session-category.model';
import { ISession } from '@/src/_models/session.model';
import { SessionStatus } from '@repo/database';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import React, { useRef, useState } from 'react';
import { deleteSession } from './session-actions';
import SessionForm from './session-form';
import TableToolbar from '@/src/_components/shared/TableToolbar';

type SessionTableProps = {
  sessions: ISession[];
  categories: ISessionCategory[];
};

const SessionTable = ({ sessions, categories }: SessionTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sessionDialog, setSessionDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ISession | null>(null);

  // Assuming default status DRAFT, default date now, etc.
  const emptySession: ISession = {
    title: '',
    slug: '',
    startAt: new Date(),
    endAt: new Date(),
    price: 0,
    status: SessionStatus.DRAFT,
    categoryId: ''
  };

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [deleteSessionDialog, setDeleteSessionDialog] = useState<boolean>(false);

  const [session, setSession] = useState<ISession>(emptySession);
  const dt = useRef<DataTable<any>>(null);
  const toast = useRef<Toast>(null);

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

  const hideDeleteSessionDialog = () => {
    setDeleteSessionDialog(false);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const hideDialog = () => {
    setSessionDialog(false);
  };

  const openNew = () => {
    setSession({ ...emptySession });
    setSessionDialog(true);
  };



  const editSession = (session: ISession) => {
    setSession({ ...session });
    setSessionDialog(true);
  };

  const confirmDeleteSession = (session: ISession) => {
    setSelectedSession(session);
    setDeleteSessionDialog(true);
  };

  const registrationCountTemplate = (rowData: any) => {
    const count = rowData.registrations?.length || 0;
    return (
      <div className="flex align-items-center gap-2">
        <Tag value={count} severity={count > 0 ? 'info' : undefined} />
        {count > 0 && <Button label="View" icon="pi pi-eye" size="small" severity="info" text onClick={() => (window.location.href = `/admin/manage-sessions/registrations?sessionId=${rowData.id}`)} />}
      </div>
    );
  };

  const actionBodyTemplate = (rowData: ISession) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editSession(rowData)} />
        <Button icon="pi pi-trash" rounded severity="danger" className="mr-2" onClick={() => confirmDeleteSession(rowData)} />
      </>
    );
  };

  const deleteSelectedSession = () => {
    if (!selectedSession?.id) {
      return;
    }
    deleteSession([selectedSession.id])
      .then(() => {
        setDeleteSessionDialog(false);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Session Deleted', life: 3000 });
      })
      .catch((e) => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Deletion Failed', life: 3000 });
      });
  };

  const deleteSessionDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" text onClick={hideDeleteSessionDialog} />
      <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteSelectedSession} />
    </React.Fragment>
  );

  const statusBodyTemplate = (rowData: ISession) => {
    return <Tag severity={rowData.status === SessionStatus.PUBLISHED ? 'success' : 'warning'} value={rowData.status} />;
  };

  const priceBodyTemplate = (rowData: ISession) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(rowData.price);
  };

  const dateBodyTemplate = (rowData: ISession) => {
    if (!rowData.startAt) return '';
    return new Date(rowData.startAt).toLocaleString();
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="grid crud-demo">
        <div className="col-12">
          <div className="card">
            <TableToolbar
              newLabel="New Session"
              onNew={openNew}
              onExport={exportCSV}
              searchValue={globalFilter}
              onSearchChange={onGlobalFilterChange}
              searchPlaceholder="Search sessions..."
            />
            <DataTable
              stripedRows
              ref={dt}
              value={sessions}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              className="datatable-responsive"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} sessions"
              filters={filters}
              globalFilterFields={['title', 'slug', 'status']}
              emptyMessage="No sessions found."
              exportFilename="Sessions"
            >
              <Column field="title" header="Title" sortable headerStyle={{ minWidth: '15rem' }}></Column>
              <Column field="slug" header="Slug" sortable headerStyle={{ minWidth: '15rem' }}></Column>
              <Column field="price" header="Price" body={priceBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
              <Column field="startAt" header="Start Time" body={dateBodyTemplate} sortable headerStyle={{ minWidth: '15rem' }}></Column>
              <Column field="status" header="Status" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
              <Column header="Registrations" body={registrationCountTemplate} headerStyle={{ minWidth: '12rem' }}></Column>
              <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
            </DataTable>

            <Dialog header="Session Details" modal className="p-fluid" visible={sessionDialog} style={{ width: '50vw' }} onHide={hideDialog}>
              <SessionForm session={session} hideDialog={hideDialog} categories={categories} />
            </Dialog>

            <Dialog visible={deleteSessionDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteSessionDialogFooter} onHide={hideDeleteSessionDialog}>
              <div className="confirmation-content">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                <span>Are you sure you want to delete this session?</span>
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionTable;
