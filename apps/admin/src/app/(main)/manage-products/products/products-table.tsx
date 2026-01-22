'use client';

import React, { ChangeEvent, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Demo } from '@/types';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ICurrency, IMediaOnProducts, IProduct, IProductForm } from '@/src/_models/product.model';
import { Toolbar } from 'primereact/toolbar';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import ProductForm from '@/src/app/(main)/manage-products/products/product-form';
import { IBrand } from '@/src/_models/brand.model';
import ProductImageSelectionDialog from '@/src/app/(main)/manage-products/products/product-image-selection-dialog';
import { FilterMatchMode } from 'primereact/api';
import { ICategory } from '@/src/_models/category.model';
import { confirmDialog } from 'primereact/confirmdialog';
import useToastContext from '@/src/_hooks/useToast';
import { deleteProduct } from './product-actions';
import { Image } from 'primereact/image';

type IProductsTable = {
  products: IProduct[];
  selectCategories: { id: string; name: string; active: boolean; childCategories: { id: string; name: string }[] }[];
  // currencies: ICurrency[];
  // brands: Pick<IBrand, 'id' | 'name'>[];
  mediaOnProducts: IMediaOnProducts[];
};

const ProductsTable = ({ products, selectCategories, mediaOnProducts }: IProductsTable) => {
  const emptyProduct: IProductForm = {
    id: '',
    name: '',
    slug: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
    description: '',
    active: false,
    bestSeller: false,
    categoryId: '',
    shortDescription: '',
    // productBenefits: [],
    // productStats: [],
    faq: [],
    productVariants: [],
    productBenefits : [],
    media: []
  };
  const [productDialog, setProductDialog] = useState(false);
  const [imageSelectionDialog, setImageSelectionDialog] = useState(false);
  const [expandedRows, setExpandedRows] = useState<IProduct[]>([]);
  const [product, setProduct] = useState<IProductForm>(emptyProduct);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const { showToast } = useToastContext();
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<any>>(null);

  const openNew = () => {
    setProduct({ ...emptyProduct });
    setProductDialog(true);
  };

  const hideDialog = () => {
    setProductDialog(false);
  };

  const hideImagesDialog = () => {
    setImageSelectionDialog(false);
  };

  const editProduct = (product: IProduct) => {
    setProduct({ ...product });
    setProductDialog(true);
  };

  const selectImagesForProduct = (product: IProduct) => {
    setProduct({ ...product });
    setImageSelectionDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <div className="my-2">
          <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
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

  const idBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Id</span>
        {rowData.id}
      </>
    );
  };

  const nameBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.name}
      </>
    );
  };
  const reject = () => {
    console.log('rejected your request');
  };
  const accept = (productId: string) => {
    return deleteProduct(productId)
      .then((resp) => {
        if (resp.message) {
          showToast('success', 'Successful', resp.message);
        }
        if (resp.error) {
          showToast('error', 'Error', resp.error);
        }
      })
      .catch((err) => {
        showToast('error', 'Error', err.message);
      });
  };
  const deleteRecord = (product: IProduct) => {
    confirmDialog({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => accept(product.id),
      reject
    });
  };
  const actionBodyTemplate = (rowData: IProduct) => {
    return (
      <>
        <Button icon="pi pi-images" rounded severity="info" className="mr-2" onClick={() => selectImagesForProduct(rowData)} />
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editProduct(rowData)} />
        <Button icon="pi pi-trash" rounded severity="danger" className="mr-2" onClick={() => deleteRecord(rowData)}></Button>
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
      <h5 className="m-0">Manage Products</h5>
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." />
      </span>
    </div>
  );

  const activeBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };

  const bestsellerBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.bestSeller ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };

  const mediaBodyTemplate = (rowData: IProduct) => {
    const firstImage = rowData.media?.[0];
    if (!firstImage?.media?.fileUrl) {
      return <span className="text-gray-400">No image</span>;
    }
    return (
      <Image
        src={firstImage.media.fileUrl}
        alt="Product thumbnail"
        width="50"
        height="50"
        imageStyle={{ objectFit: 'cover', borderRadius: '4px' }}
        preview
      />
    );
  };

  const rowExpansionTemplate = (data: IProduct) => {
    return (
      <div className="pl-6">
        {/*<h5>Product variants for {data.name}</h5>*/}
        <DataTable stripedRows value={data.productVariants!}>
          <Column field="id" header="Variant Id" sortable></Column>
          <Column field="name" header="Variant" sortable body={nameBodyTemplate}></Column>
          <Column field="priceInCents" header="Price (₹)" sortable body={(data) => data.priceInCents && data.priceInCents / 100}></Column>
          <Column field="discount" header="Discount" sortable body={(data) => (data.discountInCents ? data.discountInCents / 100 : `${data.discountInPercentage} %`)}></Column>
          <Column field="discountEndDate" header="Discount End Date" sortable body={(data) => data.discountEndDate?.toString()}></Column>
          {/*<Column field="media" header="Media" sortable body={fileKeyBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>*/}
          {/*<Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>*/}
          {/*<Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>*/}
        </DataTable>
      </div>
    );
  };

  const allowExpansion = (rowData: IProduct) => {
    return rowData.productVariants && rowData.productVariants.length > 0;
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

          <DataTable
            stripedRows
            ref={dt}
            value={products}
            dataKey="id"
            paginator
            rows={10}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data as IProduct[])}
            rowExpansionTemplate={rowExpansionTemplate}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            filters={filters}
            globalFilterFields={['id', 'name', 'category.name', 'brand.name', 'slug']}
            emptyMessage="No products found."
            header={header}
            exportFilename="Products"
          >
            <Column expander={allowExpansion} style={{ width: '5rem' }} />
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="category.name" header="Category" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="brand.name" header="Brand" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="slug" header="Slug" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="bestseller" header="Bestseller" sortable body={bestsellerBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column header="Image" body={mediaBodyTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
            <Column header="Actions" body={actionBodyTemplate} headerStyle={{ minWidth: '15rem' }} frozen alignFrozen="right"></Column>
          </DataTable>

          <ProductForm product={product} productDialog={productDialog} categories={selectCategories} hideDialog={hideDialog} />
          <ProductImageSelectionDialog product={product} mediaOnProducts={mediaOnProducts} productImageSelectionDialog={imageSelectionDialog} hideDialog={hideImagesDialog} />
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;
