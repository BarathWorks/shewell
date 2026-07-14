'use client';

import { IRegistration } from '@/src/_models/registration.model';
import { PaymentStatus } from '@repo/database';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { useState } from 'react';
import { updateRegistrationPaymentStatus } from './registration-actions';
import useToastContext from '@/src/_hooks/useToast';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

interface RegistrationTableProps {
  registrations: IRegistration[];
}

const RegistrationTable = ({ registrations }: RegistrationTableProps) => {
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState<string | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const paymentStatusOptions = Object.values(PaymentStatus).map((status) => ({
    label: status,
    value: status
  }));

  const getStatusSeverity = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'success';
      case PaymentStatus.PENDING:
        return 'warning';
      case PaymentStatus.FAILED:
        return 'danger';
      case PaymentStatus.REFUNDED:
        return 'info';
      default:
        return undefined;
    }
  };

  const handleStatusChange = async (registrationId: string, newStatus: PaymentStatus) => {
    setLoading(registrationId);
    try {
      const result = await updateRegistrationPaymentStatus(registrationId, newStatus);
      if (result.error) {
        showToast('error', 'Error', result.error);
      } else {
        showToast('success', 'Success', result.message || 'Status updated');
        window.location.reload();
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to update status');
    } finally {
      setLoading(null);
    }
  };

  const userTemplate = (rowData: IRegistration) => {
    return (
      <div>
        <div className="font-semibold">{rowData.user?.name}</div>
        <div className="text-sm text-gray-600">{rowData.user?.email}</div>
      </div>
    );
  };

  const sessionTemplate = (rowData: IRegistration) => {
    return (
      <div>
        <div className="font-semibold">{rowData.session?.title}</div>
        <div className="text-sm text-gray-600">{new Date(rowData.session?.startAt || '').toLocaleString()}</div>
      </div>
    );
  };

  const priceTemplate = (rowData: IRegistration) => {
    return <div className="font-semibold">₹{rowData.session?.price?.toLocaleString('en-IN')}</div>;
  };

  const statusTemplate = (rowData: IRegistration) => {
    return <Tag value={rowData.paymentStatus} severity={getStatusSeverity(rowData.paymentStatus)} />;
  };

  const dateTemplate = (rowData: IRegistration) => {
    return new Date(rowData.createdAt).toLocaleString('en-IN');
  };

  const actionTemplate = (rowData: IRegistration) => {
    return (
      <div className="flex gap-2 align-items-center">
        <Dropdown value={rowData.paymentStatus} options={paymentStatusOptions} onChange={(e) => handleStatusChange(rowData.id, e.value)} placeholder="Update Status" className="w-full md:w-14rem" disabled={loading === rowData.id} />
        {loading === rowData.id && <i className="pi pi-spin pi-spinner" />}
      </div>
    );
  };

  return (
    <div className="card">
      <DataTable
        value={registrations}
        first={first}
        rows={rows}
        dataKey="id"
        filterDisplay="menu"
        emptyMessage="No registrations found."
      >
        <Column field="user" header="User" body={userTemplate} sortable style={{ minWidth: '12rem' }} />
        <Column field="session" header="Session" body={sessionTemplate} sortable style={{ minWidth: '14rem' }} />
        <Column field="session.price" header="Price" body={priceTemplate} sortable style={{ minWidth: '8rem' }} />
        <Column field="paymentStatus" header="Payment Status" body={statusTemplate} sortable style={{ minWidth: '10rem' }} />
        <Column field="createdAt" header="Registered At" body={dateTemplate} sortable style={{ minWidth: '12rem' }} />
        <Column header="Actions" body={actionTemplate} exportable={false} style={{ minWidth: '12rem' }} />
      </DataTable>

      <CustomPaginator
        first={first}
        rows={rows}
        totalRecords={registrations.length}
        onPageChange={(event) => setFirst(event.first)}
        onRowsChange={(event) => setRows(event.rows)}
        entityName="registrations"
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </div>
  );
};

export default RegistrationTable;
