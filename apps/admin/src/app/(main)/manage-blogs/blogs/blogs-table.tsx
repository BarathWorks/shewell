'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import React, { ChangeEvent, useRef, useState } from 'react';
import { Demo } from '@/types';
import { Tag } from 'primereact/tag';
import BlogForm from '@/src/app/(main)/manage-blogs/blogs/blog-form';
import { FilterMatchMode } from 'primereact/api';
import { IBlog, IBlogForm } from '@/src/_models/blog.model';
import { IBlogCategory, IBlogCategorySelect } from '@/src/_models/blog-category.model';
import { format } from 'date-fns';
import { deleteBlogs } from './blog-actions';

const BlogsTable = ({ blogs, blogCategories }: { blogs: IBlog[]; blogCategories: IBlogCategorySelect[] }) => {
  const emptyBlog: IBlogForm = { id: '', title: '', slug: '', author: '', body: '', categoryId: '', active: false, media: null, mediaId: '', popularBlog: false, seoTitle: '', seoDescription: '', seoKeywords: [], shortDescription : "" };
  const [blogDialog, setBlogDialog] = useState(false);
  const [blog, setBlog] = useState<IBlogForm>(emptyBlog);
  const [selectedBlogs, setSelectedBlogs] = useState<IBlogForm[] | null>(null);
  const [confirmBlogDeleteDialog, setConfirmBlogDeleteDialog] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<any>>(null);

  const openNew = () => {
    setBlog({ ...emptyBlog });
    setBlogDialog(true);
  };

  const hideDialog = () => {
    setBlogDialog(false);
  };

  const editBlog = (blog: IBlogForm) => {
    setBlog({ ...blog });
    setBlogDialog(true);
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

  const titleBodyTemplate = (rowData: IBlog) => {
    return (
      <>
        <span className="p-column-title">Title</span>
        {rowData.title}
      </>
    );
  };

  const authorBodyTemplate = (rowData: IBlog) => {
    return (
      <>
        <span className="p-column-title">Author</span>
        {rowData.author}
      </>
    );
  };

  const slugBodyTemplate = (rowData: IBlog) => {
    return (
      <>
        <span className="p-column-title">Slug</span>
        {rowData.slug}
      </>
    );
  };

  const deleteBlogConfirm = (blog : IBlogForm) => {
    setSelectedBlogs([blog]);
    setConfirmBlogDeleteDialog(true);
  };
  const actionBodyTemplate = (rowData: typeof emptyBlog) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editBlog(rowData)} />
        <Button icon="pi pi-trash" rounded severity="danger" className="mr-2" onClick={() => deleteBlogConfirm(rowData)} />
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

  const activeBodyTemplate = (rowData: IBlog) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };

  const createdAtBodyTemplate = (rowData: IBlog) => {
    return (
      <>
        <span className="p-column-title">Created At</span>
        {rowData.createdAt && format(rowData.createdAt, 'd MMM yyyy hh:mm aaa')}
      </>
    );
  };

  const updatedAtBodyTemplate = (rowData: IBlog) => {
    return (
      <>
        <span className="p-column-title">Updated At</span>
        {rowData.updatedAt && format(rowData.updatedAt, 'd MMM yyyy hh:mm aaa')}
      </>
    );
  };

  const deleteSelectedBlogs = () => {
    if (!selectedBlogs) {
      return;
    }
    deleteBlogs(selectedBlogs.map((c) => c.id!))
      .then(() => {setConfirmBlogDeleteDialog(false)})
      .catch(() => {});
  };
  const hideConfirmBlogsDeleteDialog = () => {
    setConfirmBlogDeleteDialog(false);
  };
  const confirmBlogDeleteDialogFooter = (
    <React.Fragment>
      <Button label="Delete" icon="pi pi-check" severity="danger" onClick={() => deleteSelectedBlogs()} />
    </React.Fragment>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

          <DataTable
            ref={dt}
            value={blogs}
            selection={selectedBlogs}
            onSelectionChange={(e) => setSelectedBlogs(e.value as any)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
            filters={filters}
            globalFilterFields={['id', 'name']}
            emptyMessage="No blog found."
            header={header}
            exportFilename="Blogs"
          >
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="title" header="Title" sortable body={titleBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="author" header="Author" sortable body={authorBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="slug" header="Slug" sortable body={slugBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="createdAt" header="Created At" sortable body={createdAtBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column field="updatedAt" header="Updated" sortable body={updatedAtBodyTemplate} headerStyle={{ minWidth: '9rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '8rem' }} frozen={true}></Column>
          </DataTable>

          <Dialog visible={blogDialog} style={{ width: '50vw' }} header="Blog Category Details" modal className="p-fluid" onHide={hideDialog}>
            <BlogForm blog={blog} blogCategories={blogCategories} hideDialog={hideDialog} />
          </Dialog>

          <Dialog visible={confirmBlogDeleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={confirmBlogDeleteDialogFooter} onHide={hideConfirmBlogsDeleteDialog}>
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

export default BlogsTable;
