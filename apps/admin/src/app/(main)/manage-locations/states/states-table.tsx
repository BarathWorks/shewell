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
import { IState, IStateForm } from '@/src/_models/state.model';
import { ICountrySelect } from '@/src/_models/country.model';
import useToastContext from '@/src/_hooks/useToast';

const StatesTable = ({ states, countries }: { states: IState[]; countries: ICountrySelect[] }) => {
  const emptyState: IStateForm = { id: '', name: '', stateCode: '', countryId: '' };
  const { showToast } = useToastContext();
  const [stateDialog, setStateDialog] = useState(false);
  const [state, setState] = useState<IStateForm>(emptyState);
  const [selectedStates, setSelectedStates] = useState<IState[]>([]);
  const [confirmStateDeleteDialog, setConfirmStateDeleteDialog] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<IState[]>>(null);

  const openNew = () => {
    setState({ ...emptyState });
    setStateDialog(true);
  };

  const hideDialog = () => {
    setStateDialog(false);
  };

  const editState = (row: IState) => {
    // `country` is display-only and is not part of the form payload.
    const { country, ...formValues } = row;
    setState({ ...formValues });
    setStateDialog(true);
  };

  const deleteStateConfirm = (row: IState) => {
    setSelectedStates([row]);
    setConfirmStateDeleteDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const confirmDelete = () => {
    setConfirmStateDeleteDialog(true);
  };

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <div className="my-2">
          <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
          <Button label="Delete" icon="pi pi-trash" severity="danger" className=" mr-2" onClick={confirmDelete} disabled={!selectedStates || !selectedStates.length} />
        </div>
      </React.Fragment>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
      </React.Fragment>
    );
  };

  const nameBodyTemplate = (rowData: IState) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.name}
      </>
    );
  };

  const stateCodeBodyTemplate = (rowData: IState) => {
    return (
      <>
        <span className="p-column-title">State Code</span>
        {rowData.stateCode}
      </>
    );
  };

  const actionBodyTemplate = (rowData: IState) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editState(rowData)} />
        <Button icon="pi pi-trash" rounded severity="danger" className="mr-2" onClick={() => deleteStateConfirm(rowData)} />
      </>
    );
  };

  const onGlobalFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters: any = { ...filters };

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

  const hideConfirmStatesDeleteDialog = () => {
    setConfirmStateDeleteDialog(false);
  };

  const deleteSelectedStates = () => {
    if (!selectedStates.length) {
      return;
    }
    // The result was previously discarded, so a refused delete looked exactly like
    // a successful one.
    deleteState(selectedStates.map((c) => c.id!))
      .then((resp) => {
        if (resp?.error) {
          showToast('error', 'Error', resp.error);
          return;
        }
        showToast('success', 'Successful', resp?.message ?? 'State(s) deleted');
        setSelectedStates([]);
      })
      .catch((err) => showToast('error', 'Error', err.message))
      .finally(() => setConfirmStateDeleteDialog(false));
  };

  const confirmStatesDeleteDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" severity="secondary" onClick={hideConfirmStatesDeleteDialog} />
      <Button label="Delete" icon="pi pi-check" severity="danger" onClick={() => deleteSelectedStates()} />
    </React.Fragment>
  );

  const headerTemplate = (data: IState) => {
    return (
      <div className="flex align-items-center gap-2">
        <span className="font-bold">{data.country?.name}</span>
      </div>
    );
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

          <DataTable
            ref={dt}
            rowGroupMode="subheader"
            groupRowsBy="country.name"
            rowGroupHeaderTemplate={headerTemplate}
            selectionMode="multiple"
            value={states}
            selection={selectedStates}
            onSelectionChange={(e) => setSelectedStates(e.value as IState[])}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            sortField="country.name"
            sortOrder={1}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} states"
            filters={filters}
            globalFilterFields={['name', 'stateCode', 'country.name']}
            emptyMessage="No states found."
            header={header}
            exportFilename="States"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="stateCode" header="State Code" sortable body={stateCodeBodyTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '8rem' }} frozen={true}></Column>
          </DataTable>

          <Dialog visible={stateDialog} style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="State Details" modal className="p-fluid" onHide={hideDialog}>
            <StateForm state={state} countries={countries} hideDialog={hideDialog} />
          </Dialog>
          <Dialog visible={confirmStateDeleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={confirmStatesDeleteDialogFooter} onHide={hideConfirmStatesDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to delete the selected states ?</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default StatesTable;
