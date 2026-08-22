'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import React, { ChangeEvent, useRef, useState } from 'react';
import StateForm from '@/src/app/(main)/manage-locations/states/state-form';
import { FilterMatchMode } from 'primereact/api';
import { deleteState } from '@/src/app/(main)/manage-locations/states/state-actions';
import { IState,} from '@/src/_models/state.model';
import SpecializationForm from './specialization-form';
import { deleteSpecializations } from './specialization-action';

interface ISpecialization {
    id: string;
    categoryId : string;
    specialization: string;
    active: boolean;
  }
  interface ICategories{
    id : string;
    name : string;
   
  }
const SpecializationTable = ({ specializations, categories }: { specializations: ISpecialization[], categories : ICategories[] }) => {
  const emptySpecialization: ISpecialization = { id: '', specialization: '', categoryId : "", active: false};
  const [specializationDialog, setSpecializationDialog] = useState(false);
  const [specializaton, setSpecialization] = useState<ISpecialization>(emptySpecialization);
  const [selectedSpecializations, setSelectedSpecializations] = useState<ISpecialization[]>([]);
  const [confirmSpecializationDeleteDialog, setConfirmSpecializationDeleteDialog] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<ISpecialization[]>>(null);

  const openNew = () => {
    setSpecialization({ ...emptySpecialization });
    setSpecializationDialog(true);
  };

  const hideDialog = () => {
    setSpecializationDialog(false);
  };

  const editSpecializaiton = (specialization: ISpecialization) => {
    setSpecialization({ ...specialization });
    setSpecializationDialog(true);
  };

  const deleteSpecializationConfirm = (specialization: ISpecialization) => {
    setSelectedSpecializations([specialization]);
    setConfirmSpecializationDeleteDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const confirmDelete = () => {
    setConfirmSpecializationDeleteDialog(true);
  };

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <div className="my-2">
          <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
          <Button label="Delete" icon="pi pi-trash" severity="danger" className=" mr-2" onClick={confirmDelete} disabled={!selectedSpecializations || !selectedSpecializations.length} />
        </div>
      </React.Fragment>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <React.Fragment>
        {/*<FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />*/}
        <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
      </React.Fragment>
    );
  };

  const idBodyTemplate = (rowData: ISpecialization) => {
    return (
      <>
        <span className="p-column-title">Id</span>
        {rowData.id}
      </>
    );
  };

  const nameBodyTemplate = (rowData: ISpecialization) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.specialization}
      </>
    );
  };

  const actionBodyTemplate = (rowData: ISpecialization) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editSpecializaiton(rowData)} />
        <Button icon="pi pi-trash" rounded severity="danger" className="mr-2" onClick={() => deleteSpecializationConfirm(rowData)} />
      </>
    );
  };

  const onGlobalFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters: any = { ...filters };

    _filters.global.value = value;

    setFilters(_filters);
    setGlobalFilter(value);
  };

  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." />
      </span>
    </div>
  );

  const hideConfirmSpecializationsDeleteDialog = () => {
    setConfirmSpecializationDeleteDialog(false);
  };

  const deleteSelectedStates = () => {
    if (!selectedSpecializations) {
      return;
    }
    deleteSpecializations(selectedSpecializations.map((c) => c.id!))
      .then(() => {setConfirmSpecializationDeleteDialog(false)})
      .catch(() => {});
  };

  const confirmStatesDeleteDialogFooter = (
    <React.Fragment>
      <Button label="Delete" icon="pi pi-check" severity="danger" onClick={() => deleteSelectedStates()} />
    </React.Fragment>
  );

  // const headerTemplate = (data: IState) => {
  //   return (
  //     <div className="flex align-items-center gap-2">
  //       <span className="font-bold">{data.country.name}</span>
  //     </div>
  //   );
  // };

  console.log("specialization parent categories at specialization table", categories)
  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

          <DataTable
            ref={dt}
            rowGroupMode="subheader"
            groupRowsBy="country.name"
            // rowGroupHeaderTemplate={headerTemplate}
            selectionMode="multiple"
            value={specializations}
            selection={selectedSpecializations}
            onSelectionChange={(e) => setSelectedSpecializations(e.value)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
            filters={filters}
            globalFilterFields={['id', 'specialization']}
            emptyMessage="No specializaitons found."
            header={header}
            exportFilename="Specializations"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '8rem' }} frozen={true}></Column>
          </DataTable>

          <Dialog visible={specializationDialog} style={{ width: '50vw' }} header="Specializations" modal className="p-fluid" onHide={hideDialog}>
            {/* <StateForm state={state}  hideDialog={hideDialog} /> */}
            <SpecializationForm specialization={specializaton} hideDialog={hideDialog} categories={categories}/>
          </Dialog>
          <Dialog visible={confirmSpecializationDeleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={confirmStatesDeleteDialogFooter} onHide={hideConfirmSpecializationsDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to delete the selected specialisations ?</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default SpecializationTable;
