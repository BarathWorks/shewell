'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import { Demo } from '@/types';
import { Tag } from 'primereact/tag';
import BlogForm from '@/src/app/(main)/manage-blogs/blogs/blog-form';
import { FilterMatchMode } from 'primereact/api';
import { IBlog, IBlogForm } from '@/src/_models/blog.model';
import { IBlogCategorySelect } from '@/src/_models/blog-category.model';
import { format } from 'date-fns';
import { deleteBlogs } from './blog-actions';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

const BlogsTable = ({ blogs, blogCategories }: { blogs: IBlog[]; blogCategories: IBlogCategorySelect[] }) => {
  const emptyBlog: IBlogForm = { id: '', title: '', slug: '', author: '', body: '', categoryId: '', active: false, media: null, mediaId: '', popularBlog: false, seoTitle: '', seoDescription: '', seoKeywords: [], shortDescription : "" };
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
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

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

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
          <TableToolbar
            newLabel="New Blog"
            onNew={openNew}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search blogs..."
          />

          <DataTable
            stripedRows
            ref={dt}
            value={blogs}
            selection={selectedBlogs}
            onSelectionChange={(e) => setSelectedBlogs(e.value as any)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'name']}
            emptyMessage="No blog found."
            exportFilename="Blogs"
          >
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="title" header="Title" sortable body={titleBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="author" header="Author" sortable body={authorBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="slug" header="Slug" sortable body={slugBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="createdAt" header="Created At" sortable body={createdAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="updatedAt" header="Updated" sortable body={updatedAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={blogs.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="blogs"
            rowsPerPageOptions={[5, 10, 25]}
          />

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
