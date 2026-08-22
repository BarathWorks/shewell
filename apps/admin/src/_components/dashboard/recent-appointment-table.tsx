'use client';
import { apiClient } from '@/src/trpc/react';
import { format } from 'date-fns';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import useDashboardRange from '@/src/_hooks/useDashboardRange';

/**
 * Recent appointments.
 *
 * Three fixes beyond the restyle:
 *
 *  - `additionalPatients` is `AdditionalPatient[]` in the schema, but this file
 *    typed it as a single object and rendered `additionalPatients.firstName` /
 *    `.email`. Both are `undefined` on an array, so every row printed two blank
 *    lines under the patient's details. It maps the list now.
 *  - The range came from `new Date(searchParams.get('startDate') ?? '')`, which is
 *    an Invalid Date whenever the URL has no dates — i.e. on first load. See
 *    `useDashboardRange`.
 *  - Price was `(row.priceInCents / 100).toString()` — a bare number with no
 *    currency, so ₹1,200 rendered as "1200".
 *
 * The `console.log` of the entire response on every render is also gone.
 */

interface IRecentAppointments {
  id: string;
  patient: {
    firstName: string;
    email: string;
    additionalPatients: {
      firstName: string;
      email: string;
    }[];
  };
  professionalUser: {
    firstName: string;
    email: string;
    displayQualification?: { specialization: string | null } | null;
  };
  startingTime: Date;
  endingTime: Date;
  priceInCents: number;
  planName?: string | null;
}

const currency = (cents: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(cents / 100);

const RecentAppointmentTable = () => {
  const { startDate, endDate } = useDashboardRange();

  const { data, isLoading } = apiClient.noOfOnlineAppointments.noOfOnlineAppointments.useQuery({
    startDate,
    endDate
  });

  const doctorBodyTemplate = (row: IRecentAppointments) => (
    <div className="flex flex-column gap-1">
      <span className="font-medium text-900">{row.professionalUser.firstName}</span>
      <span className="text-xs text-500">{row.professionalUser.email}</span>
      {row.professionalUser.displayQualification?.specialization ? (
        <span className="text-xs" style={{ color: 'var(--sw-brand-700)' }}>
          {row.professionalUser.displayQualification.specialization}
        </span>
      ) : null}
    </div>
  );

  const patientNameTemplate = (row: IRecentAppointments) => (
    <div className="flex flex-column gap-1">
      <span className="font-medium text-900">{row.patient.firstName}</span>
      <span className="text-xs text-500">{row.patient.email}</span>

      {/* A booking can carry additional patients; this is a list, not one record. */}
      {row.patient.additionalPatients?.length ? (
        <span className="text-xs text-500">
          + {row.patient.additionalPatients.map((p) => p.firstName).join(', ')}
        </span>
      ) : null}
    </div>
  );

  const appointmentDateTemplate = (row: IRecentAppointments) => (
    <div className="flex flex-column gap-1">
      <span className="font-medium text-900">
        {format(new Date(row.startingTime), 'd MMM yyyy')}
      </span>
      <span className="text-xs text-500">
        {format(new Date(row.startingTime), 'h:mm a')} –{' '}
        {format(new Date(row.endingTime), 'h:mm a')}
      </span>
    </div>
  );

  const planTemplate = (row: IRecentAppointments) =>
    row.planName ? (
      <span className="sw-pill sw-pill-neutral">{row.planName}</span>
    ) : (
      <span className="text-500">—</span>
    );

  const priceTemplate = (row: IRecentAppointments) => (
    <span className="font-semibold text-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {currency(row.priceInCents)}
    </span>
  );

  const rows = data?.appointmentDataForTable ?? [];

  return (
    <div className="sw-card">
      <div className="sw-card-header">
        <div>
          <h2 className="sw-card-title">Recent appointments</h2>
          <p className="sw-footnote mt-1">
            The 100 most recent bookings in the selected range.
          </p>
        </div>
      </div>

      <div className="sw-card-body" style={{ padding: 0 }}>
        {!isLoading && rows.length === 0 ? (
          <div className="sw-empty">
            <p className="sw-empty-title">No appointments in this range</p>
            <p className="sw-empty-hint">
              Widen the date range above, or check back once bookings come in.
            </p>
          </div>
        ) : (
          <DataTable
            stripedRows
            loading={isLoading}
            value={rows}
            rows={10}
            paginator
            scrollable
            scrollHeight="520px"
            emptyMessage="No appointments in this range"
          >
            <Column field="professionalUser" header="Practitioner" body={doctorBodyTemplate} style={{ minWidth: '14rem' }} />
            <Column field="patient" header="Patient" body={patientNameTemplate} style={{ minWidth: '14rem' }} />
            <Column field="startingTime" header="When" body={appointmentDateTemplate} style={{ minWidth: '12rem' }} />
            <Column field="planName" header="Plan" body={planTemplate} style={{ minWidth: '8rem' }} />
            <Column field="priceInCents" header="Price" body={priceTemplate} style={{ minWidth: '7rem' }} />
          </DataTable>
        )}
      </div>
    </div>
  );
};

export default RecentAppointmentTable;
