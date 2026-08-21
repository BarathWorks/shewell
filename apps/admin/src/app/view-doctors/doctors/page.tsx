'use client';

// Force dynamic rendering - disable static caching


import { env } from '@/env';
import { apiClient } from '@/src/trpc/react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';

interface IRecentAppointments {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  createdAt: Date;
  phoneNumber: string;
  userName: string;
  isapproved: boolean;
  gender: string | null;
  displayQualification: {
    specialization: string;
  } | null;
  address: {
    country: {
      name: string;
    } | null;
    state: {
      name: string;
    } | null;
    city: string;
    completeAddress: string;
    pincode: string;
  } | null;
  identity: {
    panNumber: string | null;
    aadhaarNumber: string | null;
    licenseNumber: string | null;
    isVerified: boolean;
  } | null;
  degrees: {
    degree: string;
    collegeName: string;
    completionDate: Date;
  }[];
  experiences: {
    startingYear: string;
    endingYear: string;
    department: string;
    position: string;
    location: string;
  }[];
}

const Doctors = () => {
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    firstName: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    lastName: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'displayQualification.specialization': { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };

    // @ts-ignore
    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };
  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
        <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
      </div>
    );
  };
  const { data } = apiClient.totalOnlineAppointments.totalOnlineAppointments.useQuery();
  const doctorNameTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <Link target="_blank" href={`${env.NEXT_PUBLIC_USER}/counselling/${row.userName}`} className="text-sm">
          {row.firstName} {row.lastName}
        </Link>
      </>
    );
  };
  const doctorEmailTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <div className="text-sm">{row.email}</div>
      </>
    );
  };
  const doctorPhoneNumberTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <div className="text-sm">{row.phoneNumber}</div>
      </>
    );
  };
  const doctorDateOfJoiningTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <div className="text-sm">{format(row.createdAt, 'dd-MM-yyyy')}</div>
      </>
    );
  };
  const doctorDateSpecialityTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <div className="text-sm">{row.displayQualification?.specialization}</div>
      </>
    );
  };
  const header = renderHeader();
  const utils = apiClient.useUtils();
  const updateMutation = apiClient.proffessionalUpdateRouter.proffessionalUpdate.useMutation({
    onSuccess: () => {
      utils.totalOnlineAppointments.totalOnlineAppointments.invalidate();
    }
  });
  
  const doctorStatusTemplate = (row: IRecentAppointments) => {
    return (
      <>
        <div className="text-sm">{row.isapproved ? "Approved" : "Not Approved"}</div>
      </>
    );
  }

  const doctorAddressTemplate = (row: IRecentAppointments) => {
    if (!row.address) {
      return <div className="text-sm text-red-500">Not provided</div>;
    }
    return (
      <div className="text-sm">
        <div><strong>Country:</strong> {row.address.country?.name || 'N/A'}</div>
        <div><strong>State:</strong> {row.address.state?.name || 'N/A'}</div>
        <div><strong>City:</strong> {row.address.city}</div>
        <div><strong>Pincode:</strong> {row.address.pincode}</div>
        <div className="text-xs text-gray-600">{row.address.completeAddress}</div>
      </div>
    );
  }

  const doctorIdentityTemplate = (row: IRecentAppointments) => {
    if (!row.identity) {
      return <div className="text-sm text-red-500">Not provided</div>;
    }
    return (
      <div className="text-sm">
        <div><strong>PAN:</strong> {row.identity.panNumber || 'Not provided'}</div>
        <div><strong>Aadhaar:</strong> {row.identity.aadhaarNumber ? `**** **** ${row.identity.aadhaarNumber.slice(-4)}` : 'Not provided'}</div>
        <div><strong>License:</strong> {row.identity.licenseNumber || 'Not provided'}</div>
        <div className={`text-xs ${row.identity.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
          {row.identity.isVerified ? '✓ Verified' : '⚠ Not verified'}
        </div>
      </div>
    );
  }

  const doctorEducationTemplate = (row: IRecentAppointments) => {
    if (!row.degrees || row.degrees.length === 0) {
      return <div className="text-sm text-red-500">Not provided</div>;
    }
    return (
      <div className="text-sm">
        {row.degrees.map((degree, index) => (
          <div key={index} className="mb-2">
            <div><strong>{degree.degree}</strong></div>
            <div className="text-xs">{degree.collegeName}</div>
            <div className="text-xs text-gray-600">{degree.completionDate ? format(new Date(degree.completionDate), 'MMM yyyy') : 'N/A'}</div>
          </div>
        ))}
      </div>
    );
  }

  const doctorExperienceTemplate = (row: IRecentAppointments) => {
    if (!row.experiences || row.experiences.length === 0) {
      return <div className="text-sm text-red-500">Not provided</div>;
    }
    return (
      <div className="text-sm">
        {row.experiences.map((exp, index) => (
          <div key={index} className="mb-2">
            <div><strong>{exp.position}</strong> - {exp.department}</div>
            <div className="text-xs">{exp.location}</div>
            <div className="text-xs text-gray-600">{exp.startingYear} - {exp.endingYear}</div>
          </div>
        ))}
      </div>
    );
  }
  
  const doctorActionsTemplate = (row: IRecentAppointments) => {
    function handleDeactivate(): void {
      updateMutation.mutate({
        id: row.id,
        isapproved: false
      });
    }

    function handleApprove(): void {
      // Check if all required information is provided
      const missingInfo = [];
      if (!row.address) missingInfo.push('Address');
      if (!row.identity || (!row.identity.panNumber && !row.identity.aadhaarNumber)) missingInfo.push('Identity Documents');
      if (!row.degrees || row.degrees.length === 0) missingInfo.push('Education');
      if (!row.experiences || row.experiences.length === 0) missingInfo.push('Experience');
      
      if (missingInfo.length > 0 && !row.isapproved) {
        const confirmApproval = window.confirm(
          `Warning: The following information is missing:\n- ${missingInfo.join('\n- ')}\n\nDo you still want to approve this doctor?`
        );
        if (!confirmApproval) return;
      }
      
      updateMutation.mutate({
        id: row.id,
        isapproved: true
      });
    }

    // Check if profile is complete
    const isProfileComplete = row.address && row.identity && 
      (row.identity.panNumber || row.identity.aadhaarNumber) &&
      row.degrees && row.degrees.length > 0 &&
      row.experiences && row.experiences.length > 0;

    return (
      <div className="flex flex-col gap-2">
        {!isProfileComplete && !row.isapproved && (
          <span className="text-xs text-orange-600 font-semibold">⚠ Incomplete Profile</span>
        )}
        <button 
          className={`${row.isapproved ? "bg-red-500 text-white" : "bg-green-500 text-white"} border-none hover:bg-blue-700 p-2 rounded-full`} 
          onClick={row.isapproved ? handleDeactivate : handleApprove}
        >
          {row.isapproved ? "Deactivate" : "Approve"}
        </button>
      </div>
    );
  };
  return (
    <>
      <div className="card">
        <div>
          <h5>View Doctor Details - Verification Required</h5>
          <p className="text-sm text-gray-600 mb-3">Review all doctor information including address, identity documents, education, and experience before approval</p>
        </div>
        <DataTable 
          value={data?.professionalUsers} 
          filters={filters} 
          globalFilterFields={['firstName', 'lastName', 'email', 'displayQualification.specialization']} 
          paginator 
          rows={6} 
          header={header}
          scrollable
          scrollHeight="600px"
        >
          <Column field="professionalUser" header="Doctor Name" body={doctorNameTemplate} frozen style={{minWidth: '180px'}}></Column>
          <Column field="professionalUser" header="Email" body={doctorEmailTemplate} style={{minWidth: '200px'}}></Column>
          <Column field="professionalUser" header="Phone" body={doctorPhoneNumberTemplate} style={{minWidth: '130px'}}></Column>
          <Column field="professionalUser" header="Speciality" body={doctorDateSpecialityTemplate} style={{minWidth: '150px'}}></Column>
          <Column field="address" header="Address Details" body={doctorAddressTemplate} style={{minWidth: '250px'}}></Column>
          <Column field="identity" header="Identity Verification" body={doctorIdentityTemplate} style={{minWidth: '200px'}}></Column>
          <Column field="degrees" header="Education" body={doctorEducationTemplate} style={{minWidth: '250px'}}></Column>
          <Column field="experiences" header="Experience" body={doctorExperienceTemplate} style={{minWidth: '250px'}}></Column>
          <Column field="professionalUser" header="Joining Date" body={doctorDateOfJoiningTemplate} style={{minWidth: '120px'}}></Column>
          <Column field="status" header="Status" body={doctorStatusTemplate} style={{minWidth: '120px'}}></Column>
          <Column field="actions" header="Actions" body={doctorActionsTemplate} frozen alignFrozen="right" style={{minWidth: '120px'}}></Column>
        </DataTable>
      </div>
    </>
  );
};
export default Doctors;
