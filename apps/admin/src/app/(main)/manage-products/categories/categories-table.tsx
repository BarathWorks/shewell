'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import { Demo } from '@/types';
import { Tag } from 'primereact/tag';
import { ICategory } from '@/src/_models/category.model';
import CategoryForm from '@/src/app/(main)/manage-products/categories/category-form';
import { Image } from 'primereact/image';
import { FilterMatchMode } from 'primereact/api';
import { confirmDialog } from 'primereact/confirmdialog';
import useToastContext from '@/src/_hooks/useToast';
import { deleteCategory } from './category-actions';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

const CategoriesTable = ({ categories, selectCategories }: { categories: ICategory[]; selectCategories: { id: string; name: string; active: boolean; slug: string }[] }) => {
  const emptyCategory: ICategory = { id: '', name: '', active: false, parentCategoryId: null, parentCategory: null, childCategories: [], slug: '' };
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [expandedRows, setExpandedRows] = useState<ICategory[]>([]);
  const [expandedRowsNextLevel, setExpandedRowsNextLevel] = useState<ICategory[]>([]);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [category, setCategory] = useState<ICategory>(emptyCategory);
  const [selectedCategories, setSelectedCategories] = useState(null);
  const { showToast } = useToastContext();
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<any>>(null);

  const openNew = () => {
    setCategory({ ...emptyCategory });
    setCategoryDialog(true);
  };

  const hideDialog = () => {
    setCategoryDialog(false);
  };

  const editCategory = (category: ICategory) => {
    setCategory({ ...category });
    setCategoryDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
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

  // const slugBodyTemplate = (rowData: Demo.Product) => {
  //   return (
  //     <>
  //       <span className="p-column-title">Slug</span>
  //       {rowData.slug}
  //     </>
  //   );
  // };
  const reject = () => {
    console.log('rejected your request');
  };
  const accept = (categoryId:string) => {
    return deleteCategory(categoryId)
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
  const deleteRecord=(category: ICategory)=>{
    confirmDialog({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => accept(category.id!),
      reject
    });
  }
  const actionBodyTemplate = (rowData: typeof emptyCategory) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editCategory(rowData)} />
        <Button icon="pi pi-trash" rounded severity="danger"  className="mr-2" onClick={()=>deleteRecord(rowData)}></Button>
      </>
    );
  };

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

  const activeBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };

  const allowExpansion = (rowData: any) => {
    return rowData.childCategories && rowData.childCategories.length > 0;
  };

  const onRowExpand = (event: any) => {
    // toast.current.show({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
  };

  const onRowCollapse = (event: any) => {
    // toast.current.show({ severity: 'success', summary: 'Product Collapsed', detail: event.data.name, life: 3000 });
  };

  const expandAll = () => {
    let _expandedRows: any = {};

    categories.forEach((p) => (_expandedRows[`${p.id}`] = true));

    setExpandedRows(_expandedRows);
  };

  const collapseAll = () => {
    setExpandedRows([]);
  };

  const rowExpansionTemplate = (data: ICategory) => {
    return (
      <div className="p-3">
        <h5>Child Categories for {data.name}</h5>
        <DataTable stripedRows expandedRows={expandedRowsNextLevel} onRowToggle={(e) => setExpandedRowsNextLevel(e.data as ICategory[])} rowExpansionTemplate={rowExpansionTemplate} value={data.childCategories!}>
          <Column expander={allowExpansion} style={{ width: '5rem' }} />
          <Column field="id" header="Id" sortable></Column>
          <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
          {/* <Column field="media" header="Media" sortable body={fileKeyBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column> */}
          <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
          <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
        </DataTable>
      </div>
    );
  };

  const fileKeyBodyTemplate = (rowData: ICategory) => {
    if (!rowData.mediaId) {
    }
    return (
      <div className="flex justify-content-center relative">
        <Image src={rowData.media?.fileUrl} alt="Image" className="relative" width="100" height="auto" preview />
      </div>
    );
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <TableToolbar
            newLabel="New Category"
            onNew={openNew}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search categories..."
          />

          <DataTable
            stripedRows
            ref={dt}
            value={categories}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data as ICategory[])}
            onRowExpand={onRowExpand}
            onRowCollapse={onRowCollapse}
            rowExpansionTemplate={rowExpansionTemplate}
            selection={selectedCategories}
            onSelectionChange={(e) => setSelectedCategories(e.value as any)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'name']}
            emptyMessage="No categories found."
            exportFilename="Categorys"
          >
            <Column expander={allowExpansion} style={{ width: '5rem' }} />
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            {/*<Column field="slug" header="Slug" sortable body={slugBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>*/}
            {/* <Column field="media" header="Media" sortable body={fileKeyBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column> */}
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={categories.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="categories"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={categoryDialog} style={{ width: '50vw' }} header="Category Details" modal className="p-fluid" onHide={hideDialog}>
            <CategoryForm category={category} categories={selectCategories} hideDialog={hideDialog} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CategoriesTable;
