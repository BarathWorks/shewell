'use client';

import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { apiClient as api } from '@/src/trpc/react';

const PayoutsTable = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [payoutAmount, setPayoutAmount] = useState<number | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);

  // Fetch doctors with balance
  const { data: doctors, isLoading: doctorsLoading } = api.payoutAdmin.listDoctorsWithBalance.useQuery({
    search: searchQuery || undefined
  });

  // Fetch selected doctor details
  const { data: doctorDetails, isLoading: detailsLoading, refetch: refetchDetails } = api.payoutAdmin.getDoctorPayoutDetails.useQuery({ doctorId: selectedDoctorId! }, { enabled: !!selectedDoctorId });

  // Fetch all payouts (for the "All Payouts" tab)
  const { data: allPayoutsData, isLoading: allPayoutsLoading, refetch: refetchAllPayouts } = api.payoutAdmin.getAllPayouts.useQuery({ limit: 50 });

  // Mutations
  const initiatePayoutMutation = api.payoutAdmin.initiatePayout.useMutation({
    onSuccess: () => {
      setShowPayoutDialog(false);
      setPayoutAmount(null);
      setTransactionRef('');
      setPayoutNotes('');
      refetchDetails();
      refetchAllPayouts();
    }
  });

  const markFailedMutation = api.payoutAdmin.markPayoutFailed.useMutation({
    onSuccess: () => {
      refetchDetails();
      refetchAllPayouts();
    }
  });

  // Helpers
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handlers
  const handleInitiatePayout = () => {
    if (!selectedDoctorId || !payoutAmount) return;

    confirmDialog({
      message: `Are you sure you want to pay ${formatCurrency(payoutAmount * 100)} to this doctor?`,
      header: 'Confirm Payout',
      icon: 'pi pi-wallet',
      acceptClassName: 'p-button-success',
      accept: () => {
        initiatePayoutMutation.mutate({
          doctorId: selectedDoctorId,
          amountInCents: payoutAmount * 100,
          transactionRef: transactionRef || undefined,
          notes: payoutNotes || undefined
        });
      }
    });
  };

  const handleMarkFailed = (payoutId: string) => {
    confirmDialog({
      message: 'Mark this payout as failed? This will restore the balance for future payouts.',
      header: 'Mark as Failed',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => markFailedMutation.mutate({ payoutId })
    });
  };

  // Status tag template
  const statusTemplate = (rowData: any) => {
    const statusConfig: Record<string, { severity: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
      INITIATED: { severity: 'info', label: 'Initiated' },
      PROCESSING: { severity: 'warning', label: 'Processing' },
      PAID: { severity: 'success', label: 'Paid' },
      FAILED: { severity: 'danger', label: 'Failed' }
    };
    const config = statusConfig[rowData.status] || { severity: 'info', label: rowData.status };
    return <Tag severity={config.severity} value={config.label} />;
  };

  // Bank details section
  const renderBankDetails = () => {
    if (!doctorDetails?.doctor) return null;
    const d = doctorDetails.doctor;
    const hasBankDetails = d.bankAccountNumber || d.bankUpiId;

    return (
      <Card className="mb-4" title="Bank Details">
        {!hasBankDetails ? (
          <Message severity="warn" text="No bank details found for this doctor. Please ask them to update their bank details." className="w-full" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {d.bankAccountHolderName && (
              <div>
                <label className="text-sm text-gray-500 block">Account Holder</label>
                <span className="font-semibold text-gray-900">{d.bankAccountHolderName}</span>
              </div>
            )}
            {d.bankAccountNumber && (
              <div>
                <label className="text-sm text-gray-500 block">Account Number</label>
                <span className="font-semibold text-gray-900">{d.bankAccountNumber}</span>
              </div>
            )}
            {d.bankName && (
              <div>
                <label className="text-sm text-gray-500 block">Bank Name</label>
                <span className="font-semibold text-gray-900">{d.bankName}</span>
              </div>
            )}
            {d.bankBranch && (
              <div>
                <label className="text-sm text-gray-500 block">Branch</label>
                <span className="font-semibold text-gray-900">{d.bankBranch}</span>
              </div>
            )}
            {d.bankIfscCode && (
              <div>
                <label className="text-sm text-gray-500 block">IFSC Code</label>
                <span className="font-semibold text-gray-900">{d.bankIfscCode}</span>
              </div>
            )}
            {d.bankUpiId && (
              <div>
                <label className="text-sm text-gray-500 block">UPI ID</label>
                <span className="font-semibold text-gray-900">{d.bankUpiId}</span>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  // Earnings summary section
  const renderEarningsSummary = () => {
    if (!doctorDetails?.earnings) return null;
    const e = doctorDetails.earnings;

    return (
      <Card className="mb-4" title="Earnings Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-sm text-blue-600 mb-1">Total Appointments</div>
            <div className="text-2xl font-bold text-blue-900">{e.totalAppointments}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-sm text-green-600 mb-1">Doctor Earnings</div>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(e.doctorEarningsInCents)}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-sm text-orange-600 mb-1">Paid Out</div>
            <div className="text-2xl font-bold text-orange-900">{formatCurrency(e.paidOutInCents)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-sm text-purple-600 mb-1">Available Balance</div>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(e.availableBalanceInCents)}</div>
          </div>
        </div>

        <Divider />

        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500 mr-4">Total Revenue: {formatCurrency(e.totalRevenueInCents)}</span>
            <span className="text-sm text-gray-500">Platform Share: {formatCurrency(e.platformEarningsInCents)}</span>
          </div>
          <Button label="Initiate Payout" icon="pi pi-wallet" severity="success" disabled={e.availableBalanceInCents <= 0} onClick={() => setShowPayoutDialog(true)} />
        </div>
      </Card>
    );
  };

  // Doctor selection tab
  const renderDoctorSelection = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3 items-center mb-4">
        <span className="p-input-icon-left flex-1">
          <i className="pi pi-search" />
          <InputText value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search doctors by name or email..." className="w-full" />
        </span>
      </div>

      {/* Doctor list */}
      <DataTable
        value={doctors || []}
        loading={doctorsLoading}
        emptyMessage="No doctors found"
        selectionMode="single"
        selection={doctors?.find((d) => d.id === selectedDoctorId) || null}
        onSelectionChange={(e) => {
          const doc = e.value as any;
          setSelectedDoctorId(doc?.id ?? null);
        }}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        className="p-datatable-sm"
        rowClassName={() => 'cursor-pointer'}
      >
        <Column
          header="Doctor"
          body={(rowData: any) => (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">{rowData.firstName?.[0]?.toUpperCase() ?? '?'}</div>
              <div>
                <div className="font-semibold text-gray-900">
                  {rowData.firstName} {rowData.lastName || ''}
                </div>
                <div className="text-sm text-gray-500">{rowData.email}</div>
              </div>
            </div>
          )}
        />
        <Column
          header="Available Balance"
          body={(rowData: any) => <span className={`font-bold text-lg ${rowData.availableBalanceInCents > 0 ? 'text-green-600' : 'text-gray-400'}`}>{formatCurrency(rowData.availableBalanceInCents)}</span>}
          sortable
          sortField="availableBalanceInCents"
        />
        <Column header="Total Earned" body={(rowData: any) => <span className="text-gray-700">{formatCurrency(rowData.totalEarningsInCents)}</span>} />
        <Column header="Total Paid" body={(rowData: any) => <span className="text-gray-700">{formatCurrency(rowData.totalPaidOutInCents)}</span>} />
        <Column
          header="Bank Status"
          body={(rowData: any) => {
            const hasBankDetails = rowData.bankAccountNumber || rowData.bankUpiId;
            return hasBankDetails ? <Tag severity="success" value="Verified" icon="pi pi-check" /> : <Tag severity="warning" value="Missing" icon="pi pi-exclamation-triangle" />;
          }}
        />
      </DataTable>

      {/* Selected doctor details */}
      {selectedDoctorId && (
        <div className="mt-6">
          <Divider />
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i className="pi pi-user" />
            {doctorDetails?.doctor ? `${doctorDetails.doctor.firstName} ${doctorDetails.doctor.lastName || ''}` : 'Loading...'}
          </h2>

          {detailsLoading ? (
            <div className="flex justify-center py-8">
              <i className="pi pi-spinner pi-spin text-4xl text-gray-400" />
            </div>
          ) : (
            <>
              {renderBankDetails()}
              {renderEarningsSummary()}

              {/* Payout History for this doctor */}
              {doctorDetails?.payoutHistory && doctorDetails.payoutHistory.length > 0 && (
                <Card title="Payout History">
                  <DataTable value={doctorDetails.payoutHistory} emptyMessage="No payouts yet" className="p-datatable-sm">
                    <Column field="amountInCents" header="Amount" body={(rowData: any) => <span className="font-semibold text-gray-900">{formatCurrency(rowData.amountInCents)}</span>} />
                    <Column field="status" header="Status" body={statusTemplate} />
                    <Column header="Initiated By" body={(rowData: any) => <span className="text-gray-600 text-sm">{rowData.initiatedByAdmin?.name ?? '—'}</span>} />
                    <Column field="paidAt" header="Paid At" body={(rowData: any) => (rowData.paidAt ? <span className="text-gray-600 text-sm">{formatDate(rowData.paidAt)}</span> : '—')} sortable />
                    <Column field="transactionRef" header="Txn Ref" body={(rowData: any) => <span className="text-gray-500 text-sm">{rowData.transactionRef || '—'}</span>} />
                    <Column
                      header="Actions"
                      body={(rowData: any) =>
                        rowData.status === 'PAID' ? (
                          <Button size="small" severity="danger" label="Mark Failed" icon="pi pi-times" onClick={() => handleMarkFailed(rowData.id)} loading={markFailedMutation.isPending} />
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )
                      }
                    />
                  </DataTable>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  // All payouts tab
  const renderAllPayouts = () => (
    <DataTable value={allPayoutsData?.payouts || []} loading={allPayoutsLoading} emptyMessage="No payout records found" paginator rows={10} rowsPerPageOptions={[10, 25, 50]} className="p-datatable-sm">
      <Column
        header="Doctor"
        body={(rowData: any) => (
          <div>
            <div className="font-semibold text-gray-900">
              {rowData.doctor?.firstName} {rowData.doctor?.lastName || ''}
            </div>
            <div className="text-sm text-gray-500">{rowData.doctor?.email}</div>
          </div>
        )}
      />
      <Column field="amountInCents" header="Amount" body={(rowData: any) => <span className="font-semibold text-gray-900">{formatCurrency(rowData.amountInCents)}</span>} sortable />
      <Column field="status" header="Status" body={statusTemplate} sortable />
      <Column header="Admin" body={(rowData: any) => <span className="text-gray-600 text-sm">{rowData.initiatedByAdmin?.name ?? '—'}</span>} />
      <Column field="paidAt" header="Paid At" body={(rowData: any) => (rowData.paidAt ? <span className="text-gray-600 text-sm">{formatDate(rowData.paidAt)}</span> : '—')} sortable />
      <Column field="transactionRef" header="Txn Ref" body={(rowData: any) => <span className="text-gray-500 text-sm">{rowData.transactionRef || '—'}</span>} />
      <Column
        header="Actions"
        body={(rowData: any) =>
          rowData.status === 'PAID' ? (
            <Button size="small" severity="danger" label="Mark Failed" icon="pi pi-times" onClick={() => handleMarkFailed(rowData.id)} loading={markFailedMutation.isPending} />
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          )
        }
        style={{ width: '150px' }}
      />
    </DataTable>
  );

  // Payout dialog
  const renderPayoutDialog = () => {
    const availableBalance = doctorDetails?.earnings?.availableBalanceInCents ?? 0;
    const maxAmount = availableBalance / 100;

    return (
      <Dialog
        visible={showPayoutDialog}
        header="Initiate Payout"
        onHide={() => setShowPayoutDialog(false)}
        style={{ width: '480px' }}
        footer={
          <div className="flex justify-end gap-2">
            <Button label="Cancel" severity="secondary" outlined onClick={() => setShowPayoutDialog(false)} />
            <Button label="Confirm & Pay" icon="pi pi-wallet" severity="success" onClick={handleInitiatePayout} loading={initiatePayoutMutation.isPending} disabled={!payoutAmount || payoutAmount <= 0 || payoutAmount > maxAmount} />
          </div>
        }
      >
        <div className="space-y-4">
          <Message severity="info" text={`Available balance: ${formatCurrency(availableBalance)}`} className="w-full" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payout Amount (₹)</label>
            <InputNumber value={payoutAmount} onValueChange={(e) => setPayoutAmount(e.value ?? null)} mode="currency" currency="INR" locale="en-IN" min={1} max={maxAmount} className="w-full" placeholder="Enter amount" />
            {payoutAmount && payoutAmount > maxAmount && <small className="text-red-500 mt-1 block">Amount exceeds available balance of {formatCurrency(availableBalance)}</small>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference (optional)</label>
            <InputText value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} className="w-full" placeholder="e.g. NEFT/IMPS reference number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <InputTextarea value={payoutNotes} onChange={(e) => setPayoutNotes(e.target.value)} className="w-full" rows={3} placeholder="Any notes about this payout..." />
          </div>

          {initiatePayoutMutation.isError && <Message severity="error" text={initiatePayoutMutation.error.message} className="w-full" />}
        </div>
      </Dialog>
    );
  };

  return (
    <>
      <ConfirmDialog />
      {renderPayoutDialog()}

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {/* Doctor Payouts Tab */}
        <TabPanel header="Doctor Payouts" leftIcon="pi pi-wallet mr-2">
          <div className="bg-white rounded-lg border p-4">{renderDoctorSelection()}</div>
        </TabPanel>

        {/* All Payouts Tab */}
        <TabPanel header="All Payouts" leftIcon="pi pi-list mr-2">
          <div className="bg-white rounded-lg border">{renderAllPayouts()}</div>
        </TabPanel>
      </TabView>
    </>
  );
};

export default PayoutsTable;
