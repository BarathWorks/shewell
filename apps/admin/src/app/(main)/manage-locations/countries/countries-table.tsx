'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import React, { ChangeEvent, useRef, useState } from 'react';
import CountryForm from '@/src/app/(main)/manage-locations/countries/country-form';
import { FilterMatchMode } from 'primereact/api';
import { ICountry } from '@/src/_models/country.model';
import { Tag } from 'primereact/tag';
import { updateCountriesStatus } from '@/src/app/(main)/manage-locations/countries/country-actions';

const CountriesTable = ({ countries }: { countries: ICountry[] }) => {
  const emptyCountry: ICountry = { id: '', name: '', active: false, iso3: '', iso2: '', phoneCode: '', currency: '', currencyName: '', currencySymbol: '' };
  const [countryDialog, setCountryDialog] = useState(false);
  const [country, setCountry] = useState<ICountry>(emptyCountry);
  const [selectedCountries, setSelectedCountries] = useState<ICountry[]>([]);
  const [confirmCountryActiveDialog, setConfirmCountryActiveDialog] = useState<boolean>(false);
  const [confirmCountryDeActiveDialog, setConfirmCountryDeActiveDialog] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<ICountry[]>>(null);

  const openNew = () => {
    setCountry({ ...emptyCountry });
    setCountryDialog(true);
  };

  const hideDialog = () => {
    setCountryDialog(false);
  };

  const editCountry = (country: ICountry) => {
    setCountry({ ...country });
    setCountryDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const confirmMakeActive = () => {
    setConfirmCountryActiveDialog(true);
  };

  const confirmMakeDeactive = () => {
    setConfirmCountryDeActiveDialog(true);
  };

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <div className="my-2">
          <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
          <Button label="Activate" icon="pi pi-check" severity="success" className=" mr-2" onClick={confirmMakeActive} disabled={!selectedCountries || !selectedCountries.length} />
          <Button label="Deactivate" icon="pi pi-times" severity="danger" className=" mr-2" onClick={confirmMakeDeactive} disabled={!selectedCountries || !selectedCountries.length} />
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

  const idBodyTemplate = (rowData: ICountry) => {
    return (
      <>
        <span className="p-column-title">Id</span>
        {rowData.id}
      </>
    );
  };

  const nameBodyTemplate = (rowData: ICountry) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.name}
      </>
    );
  };

  const activeBodyTemplate = (rowData: ICountry) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };

  const actionBodyTemplate = (rowData: typeof emptyCountry) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editCountry(rowData)} />
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

  const hideConfirmCountriesActiveDialog = () => {
    setConfirmCountryActiveDialog(false);
  };

  const changeSelectedProductsStatus = (active: boolean) => {
    if (!selectedCountries) {
      return;
    }
    updateCountriesStatus({ countryIds: selectedCountries.map((c) => c.id!), active })
      .then(() => {})
      .catch(() => {});
  };

  const confirmCountriesActiveDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" outlined onClick={hideConfirmCountriesActiveDialog} />
      <Button label="Yes" icon="pi pi-check" severity="danger" onClick={() => changeSelectedProductsStatus(true)} />
    </React.Fragment>
  );

  const hideConfirmCountriesDeActiveDialog = () => {
    setConfirmCountryDeActiveDialog(false);
  };

  const confirmCountriesDeActiveDialogFooter = (
    <React.Fragment>
      <Button label="No" icon="pi pi-times" outlined onClick={hideConfirmCountriesDeActiveDialog} />
      <Button label="Yes" icon="pi pi-check" severity="danger" onClick={() => changeSelectedProductsStatus(false)} />
    </React.Fragment>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

          <DataTable
            ref={dt}
            selectionMode="multiple"
            value={countries}
            selection={selectedCountries}
            onSelectionChange={(e) => setSelectedCountries(e.value)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
            filters={filters}
            globalFilterFields={['id', 'name', 'slug']}
            emptyMessage="No countries found."
            header={header}
            exportFilename="Countries"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '8rem' }} frozen={true}></Column>
          </DataTable>

          <Dialog visible={countryDialog} style={{ width: '50vw' }} header="Country Details" modal className="p-fluid" onHide={hideDialog}>
            <CountryForm country={country} hideDialog={hideDialog} />
          </Dialog>
          <Dialog visible={confirmCountryActiveDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={confirmCountriesActiveDialogFooter} onHide={hideConfirmCountriesActiveDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to make the selected countries active ?</span>
            </div>
          </Dialog>
          <Dialog visible={confirmCountryDeActiveDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={confirmCountriesActiveDialogFooter} onHide={hideConfirmCountriesDeActiveDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to make the selected countries active ?</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CountriesTable;
