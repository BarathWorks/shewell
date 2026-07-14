'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import LanguageForm from './language-form';
import { deleteLanguages } from './language-action';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

interface ILanguage {
    id: string;
    language: string;
    active: boolean;
  }
const LanguageTable = ({ languages }: { languages: ILanguage[] }) => {
  const emptyLanguage: ILanguage = { id: '', language: '', active: false};
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [languageDialog, setLanguageDialog] = useState(false);
  const [language, setLanguage] = useState<ILanguage>(emptyLanguage);
  const [selectedLanguages, setSelectedLanguages] = useState<ILanguage[]>([]);
  const [confirmLanguageDeleteDialog, setConfirmLanguageDeleteDialog] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<ILanguage[]>>(null);

  const openNew = () => {
    setLanguage({ ...emptyLanguage });
    setLanguageDialog(true);
  };

  const hideDialog = () => {
    setLanguageDialog(false);
  };

  const editSpecializaiton = (language: ILanguage) => {
    setLanguage({ ...language });
    setLanguageDialog(true);
  };

  const deleteSpecializationConfirm = (language: ILanguage) => {
    setSelectedLanguages([language]);
    setConfirmLanguageDeleteDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const confirmDelete = () => {
    setConfirmLanguageDeleteDialog(true);
  };



  const idBodyTemplate = (rowData: ILanguage) => {
    return (
      <>
        <span className="p-column-title">Id</span>
        {rowData.id}
      </>
    );
  };

  const nameBodyTemplate = (rowData: ILanguage) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.language}
      </>
    );
  };

  const actionBodyTemplate = (rowData: ILanguage) => {
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
    setConfirmLanguageDeleteDialog(false);
  };

  const deleteSelectedLanguages = () => {
    if (!selectedLanguages) {
      return;
    }
    deleteLanguages(selectedLanguages.map((c) => c.id!))
      .then(() => {setConfirmLanguageDeleteDialog(false)})
      .catch(() => {});
  };

  const confirmStatesDeleteDialogFooter = (
    <React.Fragment>
      <Button label="Delete" icon="pi pi-check" severity="danger" onClick={() => deleteSelectedLanguages()} />
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
            newLabel="New Language"
            onNew={openNew}
            showDelete={true}
            onDelete={confirmDelete}
            deleteDisabled={!selectedLanguages || !selectedLanguages.length}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search languages..."
          />

          <DataTable
            stripedRows
            ref={dt}
            rowGroupMode="subheader"
            groupRowsBy="country.name"
            // rowGroupHeaderTemplate={headerTemplate}
            selectionMode="multiple"
            value={languages}
            selection={selectedLanguages}
            onSelectionChange={(e) => setSelectedLanguages(e.value)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'language']}
            emptyMessage="No Languages found."
            exportFilename="Languages"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={languages.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="languages"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={languageDialog} style={{ width: '50vw' }} header="Language Details" modal className="p-fluid" onHide={hideDialog}>
         <LanguageForm language={language} hideDialog={hideDialog}/>
          </Dialog>
          <Dialog visible={confirmLanguageDeleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={confirmStatesDeleteDialogFooter} onHide={hideConfirmSpecializationsDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to delete the selected languages ?</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default LanguageTable;
