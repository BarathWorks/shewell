'use client';
import React, { useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Demo } from '@/types';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import MediaForm from './media-form';
import { IMedia } from '@/src/_models/media.model';
import { Image } from 'primereact/image';
import { FilterMatchMode, FilterService } from 'primereact/api';
import filters = FilterService.filters;
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

type IMediaTableProps = {
  media: any[];
};

const MediaTable = ({ media: mediaTableData }: IMediaTableProps) => {
  const emptyMedia: IMedia = { id: '', fileKey: '' };
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
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

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

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
          <TableToolbar
            newLabel="New Media"
            onNew={openNew}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search media..."
          />

          <DataTable
            stripedRows
            ref={dt}
            value={mediaTableData}
            onSelectionChange={(e) => setSelectedMedia(e.value as any)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'mimeType', 'comments']}
            emptyMessage="No medias found."
            exportFilename="Medias"
          >
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="fileKey" header="File" sortable body={fileKeyBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="mimeType" header="Mime Type" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="comments" header="Comments" sortable headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={mediaTableData.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="media files"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={mediaDialog} style={{ width: '50vw' }} header="Media Details" modal className="p-fluid" onHide={hideDialog}>
            <MediaForm media={media} hideDialog={hideDialog} />
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default MediaTable;
