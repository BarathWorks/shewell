'use client';

import { ITestimonial } from '@/src/_models/testimonial.model';
import { Demo } from '@/types/demo';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { Image } from 'primereact/image';
import React, { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import TestimonialForm from './testimonial-form';
import { deleteTestimonials } from './testimonial-actions';
import TableToolbar from '@/src/_components/shared/TableToolbar';
type TestimonialTable = {
  testimonials: ITestimonial[];
};
const TestimonialTable = ({ testimonials }: TestimonialTable) => {
  console.log('testimonials', testimonials);
  const [globalFilter, setGlobalFilter] = useState('');
  const [testimonialDialog, setTestimonialDialog] = useState(false);
  const [selectedTestimonials, setSelectedTestimonials] =useState<ITestimonial[]| null>(null)
  const emptyTestimonial: ITestimonial = { id: '', name: '', title: '', media: null, active: false, mediaId: null, avgRating: '' };
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [confirmTestimonialDeleteDialog, setConfirmTestimonialDeleteDialog] = useState<boolean>(false)

  const [testimonial, setTestimonial] = useState<ITestimonial>(emptyTestimonial);
  const dt = useRef<DataTable<any>>(null);

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

  const hideConfirmTestimonialsDeleteDialog = () => {
    setConfirmTestimonialDeleteDialog(false);
  };
  const exportCSV = () => {
    dt.current?.exportCSV();
  };
  const hideDialog = () => {
    setTestimonialDialog(false);
  };
  const openNew = () => {
    setTestimonial({ ...emptyTestimonial });
    setTestimonialDialog(true);
    console.log('hello');
  };


  const activeBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };

  const editTestimonial = (testimonial: ITestimonial) => {
    setTestimonial({ ...testimonial });
    setTestimonialDialog(true);
  };
  const actionBodyTemplate = (rowData: typeof emptyTestimonial) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editTestimonial(rowData)} />
      </>
    );
  };

  const fileKeyBodyTemplate = (rowData: ITestimonial) => {
    if (rowData.media?.fileUrl) {
    }
    if (rowData.media?.mimeType?.includes('image')) {
      return (
        <div className="flex justify-content-center relative">
          <Image src={rowData.media.fileUrl!} alt="Image" className="relative" width="100" height="auto" preview />
        </div>
      );
    }
    return (
      <a href={rowData.media?.fileUrl!} target="_blank">
        Uploaded File
      </a>
    );
  };

  const deleteSelectedTestimonials = () => {
    if (!selectedTestimonials) {
      return;
    }
    deleteTestimonials(selectedTestimonials.map((c) => c.id!))
      .then(() => {setConfirmTestimonialDeleteDialog(false)})
      .catch(() => {});
  };

  const confirmTestimonialDeleteDialogFooter = (
    <React.Fragment>
      <Button label="Delete" icon="pi pi-check" severity="danger" onClick={() => deleteSelectedTestimonials()} />
    </React.Fragment>
  );
  return (
    <>
      <div className="grid crud-demo ">
        <div className="col-12 ">
          <div className="card ">
            <TableToolbar
              newLabel="New Testimonial"
              onNew={openNew}
              onExport={exportCSV}
              searchValue={globalFilter}
              onSearchChange={onGlobalFilterChange}
              searchPlaceholder="Search testimonials..."
            />
            <DataTable
              stripedRows
              ref={dt}
              value={testimonials}
              // onSelectionChange={(e) => setSelectedMedia(e.value as any)}
              dataKey="id"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              className="datatable-responsive"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first} to {last} of {totalRecords} testimonials"
              filters={filters}
              globalFilterFields={['id', 'name']}
              emptyMessage="No testimonials found."
              exportFilename="Testimonials"
            >
              <Column field="id" header="Id" sortable headerStyle={{ minWidth: '15rem' }}></Column>
              <Column field="name" header="name" sortable headerStyle={{ minWidth: '15rem' }}></Column>
              <Column field="fileKey" header="File" sortable body={fileKeyBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
              <Column field="avgRating" header="Ratings" sortable headerStyle={{ minWidth: '15rem' }}></Column>
              <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
              <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
            </DataTable>
            <Dialog header="Testimonials Details" modal className="p-fluid" visible={testimonialDialog} style={{ width: '50vw' }} onHide={hideDialog}>
              <TestimonialForm testimonial={testimonial} hideDialog={hideDialog} />
            </Dialog>
            <Dialog visible={confirmTestimonialDeleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={confirmTestimonialDeleteDialogFooter} onHide={hideConfirmTestimonialsDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to delete the selected testimonials ?</span>
            </div>
          </Dialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimonialTable;
