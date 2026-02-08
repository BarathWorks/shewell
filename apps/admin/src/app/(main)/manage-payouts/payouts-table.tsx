'use client';

import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { apiClient as api } from '@/src/trpc/react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

const PayoutsTable = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Fetch pending payouts
  const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending } = api.payoutAdmin.getPendingPayouts.useQuery({ limit: 50 });

  // Fetch all payouts
  const { data: allData, isLoading: allLoading, refetch: refetchAll } = api.payoutAdmin.getAllPayouts.useQuery({ limit: 50 });

  // Mutations
  const approveMutation = api.payoutAdmin.approvePayout.useMutation({
    onSuccess: () => {
      refetchPending();
      refetchAll();
    }
  });

  const rejectMutation = api.payoutAdmin.rejectPayout.useMutation({
    onSuccess: () => {
      refetchPending();
      refetchAll();
    }
  });

  const markPaidMutation = api.payoutAdmin.markPaid.useMutation({
    onSuccess: () => {
      refetchAll();
    }
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = (payoutId: string) => {
    confirmDialog({
      message: 'Are you sure you want to approve this payout request?',
      header: 'Approve Payout',
      icon: 'pi pi-check-circle',
      acceptClassName: 'p-button-success',
      accept: () => approveMutation.mutate({ payoutId })
    });
  };

  const handleReject = (payoutId: string) => {
    confirmDialog({
      message: 'Are you sure you want to reject this payout request?',
      header: 'Reject Payout',
      icon: 'pi pi-times-circle',
      acceptClassName: 'p-button-danger',
      accept: () => rejectMutation.mutate({ payoutId })
    });
  };

  const handleMarkPaid = (payoutId: string) => {
    confirmDialog({
      message: 'Mark this payout as paid? This confirms the bank transfer is complete.',
      header: 'Mark as Paid',
      icon: 'pi pi-wallet',
      acceptClassName: 'p-button-info',
      accept: () => markPaidMutation.mutate({ payoutId })
    });
  };

  // Column templates
  const amountTemplate = (rowData: any) => <span className="font-semibold text-gray-900">{formatCurrency(rowData.requestedAmountInCents)}</span>;

  const doctorTemplate = (rowData: any) => <span className="text-gray-700">{rowData.doctorId.slice(0, 8)}...</span>;

  const dateTemplate = (rowData: any) => <span className="text-gray-600 text-sm">{formatDate(rowData.createdAt)}</span>;

  const statusTemplate = (rowData: any) => {
    const statusConfig: Record<string, { severity: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
      REQUESTED: { severity: 'warning', label: 'Pending' },
      APPROVED: { severity: 'info', label: 'Approved' },
      REJECTED: { severity: 'danger', label: 'Rejected' },
      PAID: { severity: 'success', label: 'Paid' }
    };
    const config = statusConfig[rowData.status] || { severity: 'info', label: rowData.status };
    return <Tag severity={config.severity} value={config.label} />;
  };

  const actionsTemplate = (rowData: any) => {
    const isProcessing = approveMutation.isPending || rejectMutation.isPending || markPaidMutation.isPending;

    switch (rowData.status) {
      case 'REQUESTED':
        return (
          <div className="flex gap-2">
            <Button size="small" severity="success" label="Approve" icon="pi pi-check" onClick={() => handleApprove(rowData.id)} loading={approveMutation.isPending} disabled={isProcessing} />
            <Button size="small" severity="danger" label="Reject" icon="pi pi-times" onClick={() => handleReject(rowData.id)} loading={rejectMutation.isPending} disabled={isProcessing} />
          </div>
        );
      case 'APPROVED':
        return <Button size="small" severity="info" label="Mark Paid" icon="pi pi-wallet" onClick={() => handleMarkPaid(rowData.id)} loading={markPaidMutation.isPending} disabled={isProcessing} />;
      default:
        return <span className="text-gray-400 text-sm">—</span>;
    }
  };

  return (
    <>
      <ConfirmDialog />

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {/* Pending Payouts Tab */}
        <TabPanel header="Pending Requests" leftIcon="pi pi-clock mr-2">
          <div className="bg-white rounded-lg border">
            <DataTable value={pendingData?.payouts || []} loading={pendingLoading} emptyMessage="No pending payout requests" paginator rows={10} rowsPerPageOptions={[10, 25, 50]} className="p-datatable-sm">
              <Column field="doctorId" header="Doctor ID" body={doctorTemplate} />
              <Column field="requestedAmountInCents" header="Amount" body={amountTemplate} />
              <Column field="createdAt" header="Requested On" body={dateTemplate} sortable />
              <Column field="status" header="Status" body={statusTemplate} />
              <Column header="Actions" body={actionsTemplate} style={{ width: '220px' }} />
            </DataTable>
          </div>
        </TabPanel>

        {/* All Payouts Tab */}
        <TabPanel header="All Payouts" leftIcon="pi pi-list mr-2">
          <div className="bg-white rounded-lg border">
            <DataTable value={allData?.payouts || []} loading={allLoading} emptyMessage="No payout records found" paginator rows={10} rowsPerPageOptions={[10, 25, 50]} className="p-datatable-sm">
              <Column field="doctorId" header="Doctor ID" body={doctorTemplate} />
              <Column field="requestedAmountInCents" header="Amount" body={amountTemplate} />
              <Column field="createdAt" header="Requested On" body={dateTemplate} sortable />
              <Column field="status" header="Status" body={statusTemplate} sortable />
              <Column header="Actions" body={actionsTemplate} style={{ width: '220px' }} />
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </>
  );
};

export default PayoutsTable;
