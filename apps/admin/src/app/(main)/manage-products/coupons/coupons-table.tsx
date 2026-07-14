'use client';

import { ICoupon } from '@/src/_models/coupon.model';
import { Demo } from '@/types';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import React, { useRef, useState } from 'react';
import CouponForm from './coupon-form';
import { FilterMatchMode } from 'primereact/api';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

type ICouponData = {
  id: string;
  code: string;
  amount: number;
  expiresAt: Date;
  isPercent: boolean;
  active: boolean;
  newUser: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  numberOfTime: number;
  categoryIds: string[] | null;
  productIds: string[] | null;
  categories: {
    name: string;
    id: string;
    parentCategory: {
      name: string;
      id: string;
      parentCategory: {
        name: string;
        id: string;
      } | null;
    } | null;
  }[];
  products: { name: string; id: string }[];
};

type ICouponTable = {
  coupons: ICouponData[];
  selectCategories: {
    id: string;
    name: string;
    active: boolean;
    parentCategory: {
      id: string;
      name: string;
      parentCategory: {
        id: string;
        name: string;
      } | null;
    } | null;
  }[];
  selectProducts: { id: string; name: string; active: boolean }[];
};
const CouponsTable = ({ coupons, selectCategories, selectProducts }: ICouponTable) => {
  const emptyCoupon: ICoupon = {
    id: '',
    code: '',
    amount: 20,
    isPercent: true,
    description: '',
    newUser: false,
    expiresAt: new Date(),
    numberOfTime: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    productIds: null,
    products: null,
    categoryIds: null,
    categories: null,
    active: false,
    users: null,
    order: null,
    orderId: null
  };
  
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [coupon, setCoupon] = useState(emptyCoupon);
  const [couponDialog, setCouponDialog] = useState(false);
  const [expandedRows, setExpandedRows] = useState<ICoupon[]>([]);
  const [expandedRowsNextLevel, setExpandedRowsNextLevel] = useState<ICoupon[]>([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(null);

  const dt = useRef<DataTable<any>>(null);

  const openNew = () => {
    setCoupon({ ...emptyCoupon });
    setCouponDialog(true);
  };

  const hideDialog = () => {
    setCouponDialog(false);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const editCoupon = (coupon: ICoupon) => {
    setCoupon({ ...coupon });
    setCouponDialog(true);
  };



  const idBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Id</span>
        {rowData.id}
      </>
    );
  };

  const activeBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };

  const actionBodyTemplate = (rowData: ICouponData) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editCoupon(rowData)} />
      </>
    );
  };

  const isPercentBodyTemplate = (rowData: ICouponData) => {
    return rowData.isPercent ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>;
  };

  const newUserBodyTemplate = (rowData: ICouponData) => {
    return rowData.newUser ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>;
  };

  const formatDate = (value: Date) => {
    return value.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  const dateBodyTemplate = (rowData: ICouponData) => {
    return formatDate(new Date(rowData.expiresAt?.getTime()));
  };

  const allowExpansion = (rowData: any) => {
    return (rowData.categories && rowData.categories.length > 0) || (rowData.products && rowData.products.length > 0);
  };

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

  const rowExpansionTemplate = (data: { id: string; name: string; code: string; categories: any[]; products: any[] }) => {
    return (
      <>
        <div className="p-3" style={{ width: 900 }}>
          <h5>
            {' '}
            Categories under <strong className="uppercase">{data.code}</strong> Coupon{' '}
          </h5>
          <DataTable stripedRows expandedRows={expandedRowsNextLevel} onRowToggle={(e) => setExpandedRowsNextLevel(e.data as ICoupon[])} rowExpansionTemplate={rowExpansionTemplate} value={data.categories}>
            <Column expander={allowExpansion} style={{ width: '5rem' }} />
            <Column field="id" header="Id" sortable></Column>
            <Column
              field="name"
              header="Name"
              sortable
              headerStyle={{ minWidth: '15rem' }}
              body={(data) => {
                return `${data.parentCategory?.parentCategory ? data.parentCategory?.parentCategory.name + ' - ' : ''} ${data.parentCategory && data.parentCategory.name + ' - '} ${data.name}`;
              }}
            ></Column>
            {/* <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column> */}
          </DataTable>
        </div>
        <div className="p-3">
          <h5>
            Products under <strong className="uppercase">{data.code}</strong> Coupon{' '}
          </h5>
          <DataTable stripedRows expandedRows={expandedRowsNextLevel} onRowToggle={(e) => setExpandedRowsNextLevel(e.data as ICoupon[])} rowExpansionTemplate={rowExpansionTemplate} value={data.products}>
            <Column expander={allowExpansion} style={{ width: '5rem' }} />
            <Column field="id" header="Id" sortable></Column>
            <Column field="name" header="Name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            {/* <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column> */}
          </DataTable>
        </div>
      </>
    );
  };
  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <TableToolbar
            newLabel="New Coupon"
            onNew={openNew}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search coupons..."
          />

          <DataTable
            stripedRows
            ref={dt}
            value={coupons}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data as ICoupon[])}
            rowExpansionTemplate={rowExpansionTemplate}
            selection={selectedCategories}
            onSelectionChange={(e) => setSelectedCategories(e.value as any)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'code', 'description']}
            emptyMessage="No coupons found."
          >
            <Column expander={allowExpansion} style={{ width: '5rem' }} />
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="code" header="Code" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="amount" header="Amount" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="isPercent" header="Is Percent" sortable headerStyle={{ minWidth: '15rem' }} body={isPercentBodyTemplate}></Column>
            <Column field="description" header="Description" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            {/*<Column field="newUser" header="New User" sortable headerStyle={{ minWidth: '15rem' }} body={newUserBodyTemplate}></Column>*/}
            {/*<Column field="numberOfTime" header="Frequency" sortable headerStyle={{ minWidth: '15rem' }}></Column>*/}
            <Column field="expiresAt" header="Expiry Date" dataType="date" sortable headerStyle={{ minWidth: '15rem' }} body={dateBodyTemplate}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={coupons.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="coupons"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={couponDialog} style={{ width: '50vw' }} header="Coupon Details" modal className="p-fluid" onHide={hideDialog}>
            <CouponForm coupon={coupon} categories={selectCategories} products={selectProducts} hideDialog={hideDialog} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};
export default CouponsTable;
