'use client';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { ChangeEvent, useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';

import InventoryFormAvailable from './inventory-form-available';
import InventoryFormOnHand from './inventory-form-onHand';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

export type IInventoryData = {
  id: string;
  name: string;
  sku: string | null;
  product: {
    id: string;
    name: string;
  } | null;
  productVariantInventory: {
    id: string;
    incoming: number;
    available: number;
    unavailable: number;
    onHand: number;
    commited: number;
    productVariantId: string;
    productVariantInventoryUpdates: {
      id: string;
      quantity: number;
      reason: string;
      updateById: string;
      productVariantInventoryId: string;
      updateType: string;
    }[];
  } | null;
};
const InventoryTable = ({ inventoryData }: { inventoryData: IInventoryData[] }) => {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const op1 = useRef<OverlayPanel>(null);
  const op2 = useRef<OverlayPanel>(null);
  const [selectedRowForAvailable, setSelectedRowForAvailable] = useState<IInventoryData | null>(null);
  const [selectedRowForOnHand, setSelectedRowForOnHand] = useState<IInventoryData | null>(null);

  const dt = useRef<DataTable<any>>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const onGlobalFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters: any = { ...filters };

    _filters.global.value = value;

    setFilters(_filters);
    setGlobalFilter(value);
  };

  const productBodyTemplate = (rowData: IInventoryData) => {
    return (
      <>
        <span className="p-column-title">Product</span>
        <div className="font-bold text-lg">{rowData.product?.name}</div>
        <div className="text-sm ">{rowData.name}</div>
      </>
    );
  };

  const skuBodyTemplate = (rowData: IInventoryData) => {
    return (
      <>
        <div>{rowData.sku || 'No SKU'}</div>
      </>
    );
  };
  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
      <h5 className="m-0">Inventory</h5>
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." />
      </span>
    </div>
  );

  const unavailableBodyTemplate = (rowData: IInventoryData) => {
    return (
      <>
        <div>{rowData.productVariantInventory?.unavailable || 0}</div>
      </>
    );
  };

  const commitedBodyTemplate = (rowData: IInventoryData) => {
    return (
      <>
        <div>{rowData.productVariantInventory?.commited || 0}</div>
      </>
    );
  };

  const availableBodyTemplate = (rowData: IInventoryData) => {
    return (
      <>
        <Button
          label={rowData.productVariantInventory?.available?.toString() || '0'}
          onClick={(e) => {
            setSelectedRowForAvailable(rowData);
            op1.current?.toggle(e);
          }}
        />
      </>
    );
  };

  const onHandBodyTemplate = (rowData: IInventoryData) => {
    return (
      <>
        <Button
          label={rowData.productVariantInventory?.onHand?.toString() || '0'}
          onClick={(e) => {
            setSelectedRowForOnHand(rowData);
            op2.current?.toggle(e);
          }}
        />
      </>
    );
  };

  return (
    <>
      <div className="grid crud-demo">
        <div className="col-12">
          <DataTable
            stripedRows
            ref={dt}
            value={inventoryData}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            emptyMessage="No inventories found."
            header={header}
            filters={filters}
            sortField="createdAt"
            globalFilterFields={['product.name', 'available', 'sku']}
            exportFilename="Inventories"
          >
            {/* <Column field="id" header="Id" sortable headerStyle={{ minWidth: '15rem' }}></Column> */}
            <Column header="Product" body={productBodyTemplate} sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="sku" header="SKU" body={skuBodyTemplate} filterMenuStyle={{ width: '14rem' }} sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="unavailable" body={unavailableBodyTemplate} header="Unavailable" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="commited" body={commitedBodyTemplate} header="Committed" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="available" body={availableBodyTemplate} header="Available" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="onHand" body={onHandBodyTemplate} header="on Hand" sortable headerStyle={{ minWidth: '15rem' }}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={inventoryData.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="inventory items"
            rowsPerPageOptions={[5, 10, 25]}
          />

          {selectedRowForAvailable && (
            <OverlayPanel ref={op1} showCloseIcon>
              <InventoryFormAvailable selectedRow={selectedRowForAvailable} />
            </OverlayPanel>
          )}

          {selectedRowForOnHand && (
            <OverlayPanel ref={op2} showCloseIcon>
              <InventoryFormOnHand selectedRow={selectedRowForOnHand} />
            </OverlayPanel>
          )}
        </div>
      </div>
    </>
  );
};

export default InventoryTable;
