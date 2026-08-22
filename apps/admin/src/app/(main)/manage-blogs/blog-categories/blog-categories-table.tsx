'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import React, { ChangeEvent, useRef, useState } from 'react';
import { Tag } from 'primereact/tag';
import BlogCategoryForm from '@/src/app/(main)/manage-blogs/blog-categories/blog-category-form';
import { FilterMatchMode } from 'primereact/api';
import { IBlogCategory, IBlogCategoryForm } from '@/src/_models/blog-category.model';
import { format } from 'date-fns';
import { deleteBlogCategories } from './blog-category-actions';

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
  const leftToolbarTemplate = () => {
    return (
      <React.Fragment>
        <div className="my-2">
          <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
          <Button label="Delete" icon="pi pi-trash" severity="danger" className=" mr-2" onClick={confirmDelete} disabled={!selectedCategories || !selectedCategories.length} />
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
          <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

          <DataTable
            ref={dt}
            value={blogCategories}
            selection={selectedCategories}
            onSelectionChange={(e) => setSelectedCategories(e.value as any)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
            filters={filters}
            globalFilterFields={['id', 'name']}
            emptyMessage="No blog categories found."
            header={header}
            exportFilename="Blog Categories"
          >
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="name" header="Name" sortable body={nameBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="slug" header="Slug" sortable body={slugBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="createdAt" header="Created At" sortable body={createdAtBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="updatedAt" header="Updated At" sortable body={updatedAtBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '8rem' }} frozen={true}></Column>
          </DataTable>

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
