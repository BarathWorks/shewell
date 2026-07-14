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
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { apiClient as api } from '@/src/trpc/react';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

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

  // Pagination state
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

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
      <div className="card mb-4">
        <h5 className="m-0 text-md font-bold text-900 mb-3" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Bank Details</h5>
        {!hasBankDetails ? (
          <Message severity="warn" text="No bank details found for this doctor." className="w-full" />
        ) : (
          <div className="grid">
            {d.bankAccountHolderName && (
              <div className="col-12 md:col-4 py-2">
                <label className="text-xs text-500 block uppercase font-bold mb-1" style={{ letterSpacing: '0.02em' }}>Account Holder</label>
                <span className="font-semibold text-900">{d.bankAccountHolderName}</span>
              </div>
            )}
            {d.bankAccountNumber && (
              <div className="col-12 md:col-4 py-2">
                <label className="text-xs text-500 block uppercase font-bold mb-1" style={{ letterSpacing: '0.02em' }}>Account Number</label>
                <span className="font-semibold text-900">{d.bankAccountNumber}</span>
              </div>
            )}
            {d.bankName && (
              <div className="col-12 md:col-4 py-2">
                <label className="text-xs text-500 block uppercase font-bold mb-1" style={{ letterSpacing: '0.02em' }}>Bank Name</label>
                <span className="font-semibold text-900">{d.bankName}</span>
              </div>
            )}
            {d.bankBranch && (
              <div className="col-12 md:col-4 py-2">
                <label className="text-xs text-500 block uppercase font-bold mb-1" style={{ letterSpacing: '0.02em' }}>Branch</label>
                <span className="font-semibold text-900">{d.bankBranch}</span>
              </div>
            )}
            {d.bankIfscCode && (
              <div className="col-12 md:col-4 py-2">
                <label className="text-xs text-500 block uppercase font-bold mb-1" style={{ letterSpacing: '0.02em' }}>IFSC Code</label>
                <span className="font-semibold text-900 font-data-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{d.bankIfscCode}</span>
              </div>
            )}
            {d.bankUpiId && (
              <div className="col-12 md:col-4 py-2">
                <label className="text-xs text-500 block uppercase font-bold mb-1" style={{ letterSpacing: '0.02em' }}>UPI ID</label>
                <span className="font-semibold text-900">{d.bankUpiId}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Earnings summary section
  const renderEarningsSummary = () => {
    if (!doctorDetails?.earnings) return null;
    const e = doctorDetails.earnings;

    return (
      <div className="card mb-4">
        <h5 className="m-0 text-md font-bold text-900 mb-3" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Earnings Summary</h5>
        <div className="grid mb-3">
          <div className="col-12 md:col-6 lg:col-3">
            <div className="p-3 text-center border-round" style={{ backgroundColor: '#eff4ff', border: '1px solid var(--surface-border)' }}>
              <div className="text-xs text-600 font-bold uppercase mb-2" style={{ letterSpacing: '0.02em' }}>Total Appointments</div>
              <div className="text-xl font-bold text-900" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>{e.totalAppointments}</div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="p-3 text-center border-round" style={{ backgroundColor: '#eff4ff', border: '1px solid var(--surface-border)' }}>
              <div className="text-xs text-600 font-bold uppercase mb-2" style={{ letterSpacing: '0.02em' }}>Doctor Earnings</div>
              <div className="text-xl font-bold text-900" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>{formatCurrency(e.doctorEarningsInCents)}</div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="p-3 text-center border-round" style={{ backgroundColor: '#eff4ff', border: '1px solid var(--surface-border)' }}>
              <div className="text-xs text-600 font-bold uppercase mb-2" style={{ letterSpacing: '0.02em' }}>Paid Out</div>
              <div className="text-xl font-bold text-900" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>{formatCurrency(e.paidOutInCents)}</div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="p-3 text-center border-round" style={{ backgroundColor: '#eff4ff', border: '1px solid var(--surface-border)' }}>
              <div className="text-xs text-600 font-bold uppercase mb-2" style={{ letterSpacing: '0.02em' }}>Available Balance</div>
              <div className="text-xl font-bold text-primary" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>{formatCurrency(e.availableBalanceInCents)}</div>
            </div>
          </div>
        </div>

        <Divider />

        <div className="flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="flex gap-4">
            <span className="text-sm text-500 font-medium">Total Revenue: <strong className="text-900">{formatCurrency(e.totalRevenueInCents)}</strong></span>
            <span className="text-sm text-500 font-medium">Platform Share: <strong className="text-900">{formatCurrency(e.platformEarningsInCents)}</strong></span>
          </div>
          <Button label="Initiate Payout" icon="pi pi-wallet" style={{ backgroundColor: '#00898f', border: 'none', borderRadius: '6px' }} disabled={e.availableBalanceInCents <= 0} onClick={() => setShowPayoutDialog(true)} />
        </div>
      </div>
    );
  };

  // Doctor selection tab
  const renderDoctorSelection = () => (
    <div className="flex flex-column gap-3">
      {/* Search */}
      <div className="flex gap-3 align-items-center mb-2">
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
        first={first}
        rows={rows}
        className="p-datatable-sm datatable-responsive"
        rowClassName={() => 'cursor-pointer'}
      >
        <Column
          header="Doctor"
          body={(rowData: any) => {
            const firstInitial = (rowData.firstName || '')[0] || '';
            const lastInitial = (rowData.lastName || '')[0] || '';
            const initials = (firstInitial + lastInitial).toUpperCase() || 'D';
            return (
              <div className="flex align-items-center gap-3">
                <div className="flex align-items-center justify-content-center border-round-3xl text-primary font-bold text-xs" style={{ width: '2.25rem', height: '2.25rem', backgroundColor: 'rgba(0, 137, 143, 0.08)' }}>
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-900">
                    {rowData.firstName} {rowData.lastName || ''}
                  </div>
                  <div className="text-sm text-500">{rowData.email}</div>
                </div>
              </div>
            );
          }}
        />
        <Column
          header="Available Balance"
          body={(rowData: any) => <span className={`font-bold text-md ${rowData.availableBalanceInCents > 0 ? 'text-primary' : 'text-400'}`}>{formatCurrency(rowData.availableBalanceInCents)}</span>}
          sortable
          sortField="availableBalanceInCents"
        />
        <Column header="Total Earned" body={(rowData: any) => <span className="text-600 font-medium">{formatCurrency(rowData.totalEarningsInCents)}</span>} />
        <Column header="Total Paid" body={(rowData: any) => <span className="text-600 font-medium">{formatCurrency(rowData.totalPaidOutInCents)}</span>} />
        <Column
          header="Bank Status"
          body={(rowData: any) => {
            const hasBankDetails = rowData.bankAccountNumber || rowData.bankUpiId;
            return hasBankDetails ? <Tag severity="success" value="Verified" icon="pi pi-check" /> : <Tag severity="warning" value="Missing" icon="pi pi-exclamation-triangle" />;
          }}
        />
      </DataTable>

      <CustomPaginator
        first={first}
        rows={rows}
        totalRecords={doctors?.length || 0}
        onPageChange={(event) => setFirst(event.first)}
        onRowsChange={(event) => {
          setRows(event.rows);
          setFirst(0);
        }}
        entityName="payouts"
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Selected doctor details */}
      {selectedDoctorId && (
        <div className="mt-4">
          <Divider />
          <h4 className="text-xl font-bold text-900 mb-4 flex align-items-center gap-2" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
            <i className="pi pi-user text-primary" />
            {doctorDetails?.doctor ? `Dr. ${doctorDetails.doctor.firstName} ${doctorDetails.doctor.lastName || ''}` : 'Loading...'}
          </h4>

          {detailsLoading ? (
            <div className="flex justify-content-center py-8">
              <i className="pi pi-spinner pi-spin text-4xl text-gray-400" />
            </div>
          ) : (
            <div className="flex flex-column gap-3">
              {renderBankDetails()}
              {renderEarningsSummary()}

              {/* Payout History for this doctor */}
              {doctorDetails?.payoutHistory && doctorDetails.payoutHistory.length > 0 && (
                <div className="card">
                  <h5 className="m-0 text-md font-bold text-900 mb-3" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Payout History</h5>
                  <DataTable value={doctorDetails.payoutHistory} emptyMessage="No payouts yet" className="p-datatable-sm">
                    <Column field="amountInCents" header="Amount" body={(rowData: any) => <span className="font-semibold text-900">{formatCurrency(rowData.amountInCents)}</span>} />
                    <Column field="status" header="Status" body={statusTemplate} />
                    <Column header="Initiated By" body={(rowData: any) => <span className="text-600 text-sm">{rowData.initiatedByAdmin?.name ?? '—'}</span>} />
                    <Column field="paidAt" header="Paid At" body={(rowData: any) => (rowData.paidAt ? <span className="text-600 text-sm">{formatDate(rowData.paidAt)}</span> : '—')} sortable />
                    <Column field="transactionRef" header="Txn Ref" body={(rowData: any) => <span className="text-500 text-sm font-data-mono">{rowData.transactionRef || '—'}</span>} />
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
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // All payouts tab
  const renderAllPayouts = () => (
    <DataTable value={allPayoutsData?.payouts || []} loading={allPayoutsLoading} emptyMessage="No payout records found" paginator rows={10} rowsPerPageOptions={[10, 25, 50]} className="p-datatable-sm datatable-responsive">
      <Column
        header="Doctor"
        body={(rowData: any) => (
          <div>
            <div className="font-semibold text-900">
              {rowData.doctor?.firstName} {rowData.doctor?.lastName || ''}
            </div>
            <div className="text-sm text-500">{rowData.doctor?.email}</div>
          </div>
        )}
      />
      <Column field="amountInCents" header="Amount" body={(rowData: any) => <span className="font-semibold text-900">{formatCurrency(rowData.amountInCents)}</span>} sortable />
      <Column field="status" header="Status" body={statusTemplate} sortable />
      <Column header="Admin" body={(rowData: any) => <span className="text-600 text-sm">{rowData.initiatedByAdmin?.name ?? '—'}</span>} />
      <Column field="paidAt" header="Paid At" body={(rowData: any) => (rowData.paidAt ? <span className="text-600 text-sm">{formatDate(rowData.paidAt)}</span> : '—')} sortable />
      <Column field="transactionRef" header="Txn Ref" body={(rowData: any) => <span className="text-500 text-sm font-data-mono">{rowData.transactionRef || '—'}</span>} />
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
            <Button label="Confirm & Pay" icon="pi pi-wallet" style={{ backgroundColor: '#00898f', border: 'none' }} onClick={handleInitiatePayout} loading={initiatePayoutMutation.isPending} disabled={!payoutAmount || payoutAmount <= 0 || payoutAmount > maxAmount} />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <Message severity="info" text={`Available balance: ${formatCurrency(availableBalance)}`} className="w-full" />

          <div>
            <label className="block text-sm font-medium text-700 mb-1">Payout Amount (₹)</label>
            <InputNumber value={payoutAmount} onValueChange={(e) => setPayoutAmount(e.value ?? null)} mode="currency" currency="INR" locale="en-IN" min={1} max={maxAmount} className="w-full" placeholder="Enter amount" />
            {payoutAmount && payoutAmount > maxAmount && <small className="text-red-500 mt-1 block">Amount exceeds available balance of {formatCurrency(availableBalance)}</small>}
          </div>

          <div>
            <label className="block text-sm font-medium text-700 mb-1">Transaction Reference (optional)</label>
            <InputText value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} className="w-full" placeholder="e.g. NEFT/IMPS reference number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-700 mb-1">Notes (optional)</label>
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
          <div className="card p-4">{renderDoctorSelection()}</div>
        </TabPanel>

        {/* All Payouts Tab */}
        <TabPanel header="All Payouts" leftIcon="pi pi-list mr-2">
          <div className="card p-0">{renderAllPayouts()}</div>
        </TabPanel>
      </TabView>
    </>
  );
};

export default PayoutsTable;
