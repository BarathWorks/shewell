'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import { Tag } from 'primereact/tag';
import BlogCategoryForm from '@/src/app/(main)/manage-blogs/blog-categories/blog-category-form';
import { FilterMatchMode } from 'primereact/api';
import { IBlogCategory, IBlogCategoryForm } from '@/src/_models/blog-category.model';
import { format } from 'date-fns';
import { deleteBlogCategories } from './blog-category-actions';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

const BlogCategoriesTable = ({ blogCategories }: { blogCategories: IBlogCategory[] }) => {
  const emptyBlogCategory: IBlogCategoryForm = {
    id: '',
    name: '',
    slug: '',
    active: false
    // metaTitle:'',
    // metaDescription:'',
    // metaKeywords:[]
  };
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [blogCategoryDialog, setBlogCategoryDialog] = useState(false);
  const [blogCategory, setBlogCategory] = useState<IBlogCategoryForm>(emptyBlogCategory);
  const [selectedCategories, setSelectedCategories] = useState<IBlogCategoryForm[] | null>(null);
  const [confirmBlogCategoryDeleteDialog, setConfirmBlogCategoryDeleteDialog] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<any>>(null);

  const openNew = () => {
    setBlogCategory({ ...emptyBlogCategory });
    setBlogCategoryDialog(true);
  };

  const hideDialog = () => {
    setBlogCategoryDialog(false);
  };

  const editBlogCategory = (blogCategory: IBlogCategoryForm) => {
    setBlogCategory({ ...blogCategory });
    setBlogCategoryDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const confirmDelete = () => {
    setConfirmBlogCategoryDeleteDialog(true);
  };


  const idBodyTemplate = (rowData: IBlogCategory) => {
    return (
      <>
        <span className="p-column-title">Id</span>
        {rowData.id}
      </>
    );
  };

  const nameBodyTemplate = (rowData: IBlogCategory) => {
    return (
      <>
        <span className="p-column-title">Name</span>
        {rowData.name}
      </>
    );
  };

  const slugBodyTemplate = (rowData: IBlogCategory) => {
    return (
      <>
        <span className="p-column-title">Slug</span>
        {rowData.slug}
      </>
    );
  };

  const createdAtBodyTemplate = (rowData: IBlogCategory) => {
    return (
      <>
        <span className="p-column-title">Created At</span>
        {rowData.createdAt && format(rowData.createdAt, 'd MMM yyyy hh:mm aaa')}
      </>
    );
  };

  const updatedAtBodyTemplate = (rowData: IBlogCategory) => {
    return (
      <>
        <span className="p-column-title">Updated At</span>
        {rowData.updatedAt && format(rowData.updatedAt, 'd MMM yyyy hh:mm aaa')}
      </>
    );
  };
  const deleteSpecializationConfirm = (blogCategory: IBlogCategoryForm) => {
    setSelectedCategories([blogCategory]);
    setConfirmBlogCategoryDeleteDialog(true);
  };
  const actionBodyTemplate = (rowData: typeof emptyBlogCategory) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editBlogCategory(rowData)} />
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

  const activeBodyTemplate = (rowData: IBlogCategory) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };
  const hideConfirmBlogCategoriesDeleteDialog = () => {
    setConfirmBlogCategoryDeleteDialog(false);
  };

  const deleteSelectedBlogCategory = () => {
    if (!selectedCategories) {
      return;
    }
    deleteBlogCategories(selectedCategories.map((c) => c.id!))
      .then(() => {
        setConfirmBlogCategoryDeleteDialog(false);
      })
      .catch(() => {});
  };
  const confirmSpecializationDeleteDialogFooter = (
    <React.Fragment>
      <Button label="Delete" icon="pi pi-check" severity="danger" onClick={() => deleteSelectedBlogCategory()} />
    </React.Fragment>
  );
  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <TableToolbar
            newLabel="New Category"
            onNew={openNew}
            showDelete={true}
            onDelete={confirmDelete}
            deleteDisabled={!selectedCategories || !selectedCategories.length}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search blog categories..."
          />

          <DataTable
            stripedRows
            ref={dt}
            value={blogCategories}
            selection={selectedCategories}
            onSelectionChange={(e) => setSelectedCategories(e.value as any)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'name']}
            emptyMessage="No blog categories found."
            exportFilename="Blog Categories"
          >
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="slug" header="Slug" sortable body={slugBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="createdAt" header="Created At" sortable body={createdAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="updatedAt" header="Updated At" sortable body={updatedAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={blogCategories.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="categories"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={blogCategoryDialog} style={{ width: '50vw' }} header="Blog Category Details" modal className="p-fluid" onHide={hideDialog}>
            <BlogCategoryForm blogCategory={blogCategory} hideDialog={hideDialog} />
          </Dialog>

          <Dialog
            visible={confirmBlogCategoryDeleteDialog}
            style={{ width: '32rem' }}
            breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            header="Confirm"
            modal
            footer={confirmSpecializationDeleteDialogFooter}
            onHide={hideConfirmBlogCategoriesDeleteDialog}
          >
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to delete the selected blog categories ?</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default BlogCategoriesTable;
