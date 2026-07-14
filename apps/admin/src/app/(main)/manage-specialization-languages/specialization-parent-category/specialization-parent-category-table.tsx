'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { deleteSpecializations } from './specialization-parent-category-action';
import { IMedia } from '@/src/_models/media.model';
import SpecializationParentCategoryForm from './specialization-parent-category-form';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';


interface ISpecialization {
    id: string;
    name: string;
    active: boolean;
    media : IMedia| null,
    mediaId : string;
  }
const SpecializationParentCategoryTable = ({ specializations }: { specializations: ISpecialization[] }) => {
  const emptySpecialization: ISpecialization = { id: '', name: '', active: false, media : null, mediaId : ""};
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
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
        {rowData.name}
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

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

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

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <TableToolbar
            newLabel="New Parent Category"
            onNew={openNew}
            showDelete={true}
            onDelete={confirmDelete}
            deleteDisabled={!selectedSpecializations || !selectedSpecializations.length}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search parent categories..."
          />

          <DataTable
            stripedRows
            ref={dt}
            rowGroupMode="subheader"
            groupRowsBy="country.name"
            // rowGroupHeaderTemplate={headerTemplate}
            selectionMode="multiple"
            value={specializations}
            selection={selectedSpecializations}
            onSelectionChange={(e) => setSelectedSpecializations(e.value)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'specialization']}
            emptyMessage="No specializaitons found."
            exportFilename="Specializations"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={specializations.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="categories"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={specializationDialog} style={{ width: '50vw' }} header="Specializations" modal className="p-fluid" onHide={hideDialog}>
            {/* <StateForm state={state}  hideDialog={hideDialog} /> */}
            <SpecializationParentCategoryForm specialization={specializaton} hideDialog={hideDialog}/>
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

export default SpecializationParentCategoryTable;
