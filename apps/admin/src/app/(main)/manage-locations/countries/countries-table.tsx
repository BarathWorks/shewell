'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import CountryForm from '@/src/app/(main)/manage-locations/countries/country-form';
import { FilterMatchMode } from 'primereact/api';
import { ICountry } from '@/src/_models/country.model';
import { Tag } from 'primereact/tag';
import { updateCountriesStatus } from '@/src/app/(main)/manage-locations/countries/country-actions';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

const CountriesTable = ({ countries }: { countries: ICountry[] }) => {
  const emptyCountry: ICountry = { id: '', name: '', active: false, iso3: '', iso2: '', phoneCode: '', currency: '', currencyName: '', currencySymbol: '' };
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
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

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

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
          <TableToolbar
            newLabel="New Country"
            onNew={openNew}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search countries..."
          />
          <div className="flex gap-2 mb-3">
            <Button label="Activate" icon="pi pi-check" severity="success" onClick={confirmMakeActive} disabled={!selectedCountries || !selectedCountries.length} />
            <Button label="Deactivate" icon="pi pi-times" severity="danger" onClick={confirmMakeDeactive} disabled={!selectedCountries || !selectedCountries.length} />
          </div>

          <DataTable
            stripedRows
            ref={dt}
            selectionMode="multiple"
            value={countries}
            selection={selectedCountries}
            onSelectionChange={(e) => setSelectedCountries(e.value)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'name', 'slug']}
            emptyMessage="No countries found."
            exportFilename="Countries"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={countries.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="countries"
            rowsPerPageOptions={[5, 10, 25]}
          />

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
