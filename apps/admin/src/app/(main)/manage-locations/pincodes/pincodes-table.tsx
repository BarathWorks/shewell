'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';
import { deletePincode } from '@/src/app/(main)/manage-locations/pincodes/pincode-actions';
import { ICountryWithStateSelect } from '@/src/_models/country.model';
import { IPincode, IPincodeForm } from '@/src/_models/pincode.model';
import PincodeForm from '@/src/app/(main)/manage-locations/pincodes/pincode-form';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

const PincodesTable = ({ availablePincodes, countries }: { availablePincodes: IPincode[]; countries: ICountryWithStateSelect[] }) => {
  const emptyState: IPincodeForm = { id: '', pincode: '', stateId: '' };
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [pincodeDialog, setStateDialog] = useState(false);
  const [pincode, setState] = useState<IPincodeForm>(emptyState);
  const [selectedPincodes, setSelectedPincodes] = useState<IPincode[]>([]);
  const [confirmStateDeleteDialog, setConfirmStateDeleteDialog] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<IPincode[]>>(null);

  const openNew = () => {
    setState({ ...emptyState });
    setStateDialog(true);
  };

  const hideDialog = () => {
    setStateDialog(false);
  };

  const editState = (pincode: IPincode) => {
    setState({ ...pincode });
    setStateDialog(true);
  };

  const deleteStateConfirm = (pincode: IPincode) => {
    setSelectedPincodes([pincode]);
    setConfirmStateDeleteDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const confirmDelete = () => {
    setConfirmStateDeleteDialog(true);
  };


  const idBodyTemplate = (rowData: IPincode) => {
    return (
      <>
        <span className="p-column-title">Id</span>
        {rowData.id}
      </>
    );
  };

  const pincodeBodyTemplate = (rowData: IPincode) => {
    return (
      <>
        <span className="p-column-title">Pincode</span>
        {rowData.pincode}
      </>
    );
  };

  const actionBodyTemplate = (rowData: IPincode) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editState(rowData)} />
        <Button icon="pi pi-trash" rounded severity="danger" className="mr-2" onClick={() => deleteStateConfirm(rowData)} />
      </>
    );
  };

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

  const hideConfirmPincodesDeleteDialog = () => {
    setConfirmStateDeleteDialog(false);
  };

  const deleteSelectedPincodes = () => {
    if (!selectedPincodes) {
      return;
    }
    deletePincode(selectedPincodes.map((c) => c.id!))
      .then(() => {})
      .catch(() => {});
  };

  const confirmPincodesDeleteDialogFooter = (
    <React.Fragment>
      <Button label="Delete" icon="pi pi-check" severity="danger" onClick={() => deleteSelectedPincodes()} />
    </React.Fragment>
  );

  const headerTemplate = (data: IPincode) => {
    return (
      <div className="flex align-items-center gap-2">
        <span className="font-bold">
          {data.state?.country.name} - {data.state?.name}
        </span>
      </div>
    );
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <TableToolbar
            newLabel="New Pincode"
            onNew={openNew}
            showDelete={true}
            onDelete={confirmDelete}
            deleteDisabled={!selectedPincodes || !selectedPincodes.length}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search pincodes..."
          />

          <DataTable
            stripedRows
            ref={dt}
            rowGroupMode="subheader"
            groupRowsBy="state.name"
            rowGroupHeaderTemplate={headerTemplate}
            selectionMode="multiple"
            value={availablePincodes}
            selection={selectedPincodes}
            onSelectionChange={(e) => setSelectedPincodes(e.value)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'name', 'state.name', 'state.country.name']}
            emptyMessage="No pincodes found."
            exportFilename="Pincodes"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="pincode" header="Pincode" sortable body={pincodeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={availablePincodes.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="pincodes"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={pincodeDialog} style={{ width: '50vw' }} header="State Details" modal className="p-fluid" onHide={hideDialog}>
            <PincodeForm pincode={pincode} countries={countries} hideDialog={hideDialog} />
          </Dialog>
          <Dialog visible={confirmStateDeleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={confirmPincodesDeleteDialogFooter} onHide={hideConfirmPincodesDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to delete the selected pincodes ?</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PincodesTable;
