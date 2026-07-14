'use client';

// Force dynamic rendering - disable static caching


import { apiClient } from '@/src/trpc/react';
import { BookAppointmentStatus } from '@repo/database';
import { format } from 'date-fns';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Nullable } from 'primereact/ts-helpers';

interface IRecentAppointments {
  id: string;
  patient: {
    firstName: string;
    email: string;
    additionalPatients: {
      firstName: string;
      email: string;
    };
  };
  professionalUser: {
    firstName: string;
    email: string;
  };
  startingTime: Date;
  endingTime: Date;
  priceInCents: number;
  status: BookAppointmentStatus;
}

const Appointments = () => {
  const { data } = apiClient.totalOnlineAppointments.totalOnlineAppointments.useQuery();
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>([new Date(), new Date()]);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'professionalUser.firstName': { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });
  const [selectedStatus, setSelectedStatus] = useState<BookAppointmentStatus | string>(BookAppointmentStatus.PAYMENT_SUCCESSFUL);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(5);
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };

    // @ts-ignore
    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const options = [
    'All',
    BookAppointmentStatus.CANCELLED,
    BookAppointmentStatus.CANCELLED_WITH_REFUND,
    BookAppointmentStatus.COMPLETED,
    BookAppointmentStatus.PAYMENT_PENDING,
    BookAppointmentStatus.PAYMENT_SUCCESSFUL,
    BookAppointmentStatus.PAYMMENT_FAILED
  ];

  const renderHeader = () => {
    return (
      <>
        <div className="flex gap-2">
          <div>
            <Dropdown value={selectedStatus} onChange={(e: DropdownChangeEvent) => setSelectedStatus(e.value)} options={options} placeholder="Select a City" className="w-full md:w-14rem" />
          </div>
          {/* <Calendar value={dates} onChange={(e) => setDates(e.value)} selectionMode="range" readOnlyInput /> */}
          <div className="flex justify-content-end">
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Doctor " />
          </div>
        </div>
      </>
    );
  };
  const doctorDetailsTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <div className="text-sm flex flex-column gap-2">
          <div>{row.professionalUser.firstName}</div>
          <div>{row.professionalUser.email}</div>
        </div>
      </>
    );
  };
  const patientDetailsTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <div className="flex flex-column gap-2 text-sm">
          <div>{row.patient.firstName}</div>
          <div>{row.patient.email}</div>
          <div>{row.patient.additionalPatients.firstName}</div>
          <div>{row.patient.additionalPatients.email}</div>
        </div>
      </>
    );
  };
  const appointmentDetailsTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <div className="flex flex-column gap-2 text-sm">
          <span>{format(new Date(row.startingTime), 'dd/MM/yyyy')}</span>
          <span>
            {format(new Date(row.startingTime), 'hh:mm a')} - {format(new Date(row.endingTime), 'hh:mm a')}
          </span>
        </div>
      </>
    );
  };
  const statusTemplagte = (row: IRecentAppointments) => {
    return (
      <>
        <div className="text-sm">{row.status.toString().replaceAll('_', ' ').toLocaleUpperCase()}</div>
      </>
    );
  };
  const priceInTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <div className="text-sm">{row.priceInCents / 100}</div>
      </>
    );
  };
  const header = renderHeader();

  const updatedData = data?.appointmentDataForTable.filter((appointment) => {
    // Status filtering
    if (selectedStatus !== 'All') {
      return appointment.status === selectedStatus;
    }

    // No filters applied - show all
    return true;
  });
  return (
    <>
      <div className="card">
        <div>
          <h5>View Appointment Details</h5>
        </div>
        <DataTable value={updatedData} stripedRows rows={rows} first={first} filters={filters} globalFilterFields={['professionalUser.firstName', 'status']} header={header}>
          <Column field="professionalUser" header="Doctor Details" body={doctorDetailsTemplate}></Column>
          <Column field="patient" header="Patient Details" body={patientDetailsTemplate}></Column>
          <Column field="startingTime" header="Appointment Details" body={appointmentDetailsTemplate}></Column>
          <Column field="statusTemplagte" header="Status" body={statusTemplagte}></Column>
          <Column field="priceInCents" header="Price" body={priceInTemplate}></Column>
        </DataTable>

        <CustomPaginator
          first={first}
          rows={rows}
          totalRecords={updatedData?.length || 0}
          onPageChange={(event) => setFirst(event.first)}
          onRowsChange={(event) => {
            setRows(event.rows);
            setFirst(0);
          }}
          entityName="appointments"
          rowsPerPageOptions={[5, 10, 25]}
        />
      </div>
    </>
  );
};

export default Appointments;
