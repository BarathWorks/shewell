'use client';
import React, { ChangeEvent, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Demo } from '@/types';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import MediaForm from './media-form';
import { IMedia } from '@/src/_models/media.model';
import { Image } from 'primereact/image';
import { FilterMatchMode, FilterService } from 'primereact/api';
import filters = FilterService.filters;

type IMediaTableProps = {
  media: any[];
};

const MediaTable = ({ media: mediaTableData }: IMediaTableProps) => {
  const emptyMedia: IMedia = { id: '', fileKey: '' };
  const [mediaDialog, setMediaDialog] = useState(false);
  const [media, setMedia] = useState<IMedia>(emptyMedia);
  const [selectedMedia, setSelectedMedia] = useState<IMedia[]>([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<any>>(null);

  const openNew = () => {
    setMedia({ ...emptyMedia });
    setMediaDialog(true);
  };

  const hideDialog = () => {
    setMediaDialog(false);
  };

  const editMedia = (media: IMedia) => {
    setMedia({ ...media });
    setMediaDialog(true);
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

  const fileKeyBodyTemplate = (rowData: IMedia) => {
    const isValidFileUrl = (u?: string) => {
      return !!u && typeof u === 'string' && !u.includes('undefined.s3.undefined.amazonaws.com') && (u.startsWith('http://') || u.startsWith('https://'));
    };

   

    if (rowData.mimeType?.includes('image')) {
      return (
        <div className="flex justify-content-center relative">
          <Image src={rowData.fileUrl!} alt="Image" className="relative" width="100" height="auto" preview />
        </div>
      );
    }
    return (
      <a href={rowData.fileUrl!} target="_blank">
        Uploaded File
      </a>
    );
  };

  const actionBodyTemplate = (rowData: typeof emptyMedia) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editMedia(rowData)} />
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
      <h5 className="m-0">Manage Media</h5>
      <span className="block mt-2 md:mt-0 p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" value={globalFilter} onChange={onGlobalFilterChange} placeholder="Search..." />
      </span>
    </div>
  );

  const symbolBodyTemplate = (rowData: Demo.Product) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.symbol}
      </>
    );
  };

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

          <DataTable
            stripedRows
            ref={dt}
            value={mediaTableData}
            onSelectionChange={(e) => setSelectedMedia(e.value as any)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
            filters={filters}
            globalFilterFields={['id', 'mimeType', 'comments']}
            emptyMessage="No medias found."
            header={header}
            exportFilename="Medias"
          >
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="fileKey" header="File" sortable body={fileKeyBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="mimeType" header="Mime Type" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="comments" header="Comments" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <Dialog visible={mediaDialog} style={{ width: '50vw' }} header="Media Details" modal className="p-fluid" onHide={hideDialog}>
            <MediaForm media={media} hideDialog={hideDialog} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default MediaTable;
