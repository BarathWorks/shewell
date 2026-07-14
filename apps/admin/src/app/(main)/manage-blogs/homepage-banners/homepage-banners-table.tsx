'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import React, { useRef, useState } from 'react';
import { Demo } from '@/types';
import { Tag } from 'primereact/tag';
import HomepageBannerForm from '@/src/app/(main)/manage-blogs/homepage-banners/homepage-banner-form';
import { FilterMatchMode } from 'primereact/api';
import { format } from 'date-fns';
import { IHomepageBanner, IHomepageBannerForm } from '@/src/_models/homepage-banner.model';
import { Image } from 'primereact/image';
import { HomeBannerType } from '@repo/database';
import { deleteHomePageBanners } from './homepage-banner-actions';
import TableToolbar from '@/src/_components/shared/TableToolbar';
import { CustomPaginator } from '@/src/_components/shared/CustomPaginator';

const HomepageBannersTable = ({ homepageBanners }: { homepageBanners: IHomepageBanner[] }) => {
  const emptyHomepageBanner: IHomepageBannerForm = { id: '', order: 0, url: '', active: false, media: null, mediaId: '', usedFor : HomeBannerType.HomeBannerClient };
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [homepageBannerDialog, setHomepageBannerDialog] = useState(false);
  const [homepageBanner, setHomepageBanner] = useState<IHomepageBannerForm>(emptyHomepageBanner);
  const [selectedHomepageBanners, setSelectedHomepageBanners] = useState<IHomepageBannerForm[] | null>(null);
  const [confirmHomePageBannerDeleteDialog, setConfirmHomePageBannerDeleteDialog] = useState<boolean>(false);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const dt = useRef<DataTable<any>>(null);

  const openNew = () => {
    setHomepageBanner({ ...emptyHomepageBanner });
    setHomepageBannerDialog(true);
  };

  const hideDialog = () => {
    setHomepageBannerDialog(false);
  };

  const editHomepageBanner = (homepageBanner: IHomepageBannerForm) => {
    setHomepageBanner({ ...homepageBanner });
    setHomepageBannerDialog(true);
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };



  const idBodyTemplate = (rowData: IHomepageBannerForm) => {
    return (
      <>
        <span className="p-column-title">Id</span>
        {rowData.id}
      </>
    );
  };

  const orderBodyTemplate = (rowData: IHomepageBannerForm) => {
    return (
      <>
        <span className="p-column-title">Order</span>
        {rowData.order}
      </>
    );
  };
  const deleteHomePageConfirm = (homePageBanner: IHomepageBannerForm) => {
    setSelectedHomepageBanners([homePageBanner]);
    setConfirmHomePageBannerDeleteDialog(true);
  };
  const actionBodyTemplate = (rowData: typeof emptyHomepageBanner) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editHomepageBanner(rowData)} />
        <Button icon="pi pi-trash" rounded severity="danger" className="mr-2" onClick={() => deleteHomePageConfirm(rowData)} />
      </>
    );
  };

  const onGlobalFilterChange = (value: string) => {
    let _filters: any = { ...filters };
    _filters.global.value = value;
    setFilters(_filters);
    setGlobalFilter(value);
  };

  const activeBodyTemplate = (rowData: IHomepageBanner) => {
    return (
      <>
        <span className="p-column-title">Active</span>
        {rowData.active ? <Tag severity="success">Yes</Tag> : <Tag severity="danger">No</Tag>}
      </>
    );
  };

  const fileKeyBodyTemplate = (rowData: IHomepageBanner) => {
    if (!rowData.media?.fileUrl) {
      return;
    }
    if (rowData.media.mimeType?.includes('image')) {
      return (
        <div className="flex justify-content-center relative">
          <Image src={rowData.media.fileUrl} alt="Image" className="relative" width="100" height="auto" preview />
        </div>
      );
    }
    return (
      <a href={rowData.media.fileUrl} target="_blank">
        Uploaded File
      </a>
    );
  };

  const createdAtBodyTemplate = (rowData: IHomepageBanner) => {
    return (
      <>
        <span className="p-column-title">Created At</span>
        {rowData.createdAt && format(rowData.createdAt, 'd MMM yyyy hh:mm aaa')}
      </>
    );
  };

  const updatedAtBodyTemplate = (rowData: IHomepageBanner) => {
    return (
      <>
        <span className="p-column-title">Updated At</span>
        {rowData.updatedAt && format(rowData.updatedAt, 'd MMM yyyy hh:mm aaa')}
      </>
    );
  };

  const hideConfirmHomePageBannersDeleteDialog = () => {
    setConfirmHomePageBannerDeleteDialog(false);
  };

  const deleteSelectedHomePageBanners = () => {
    if (!selectedHomepageBanners) {
      return;
    }
    deleteHomePageBanners(selectedHomepageBanners.map((c) => c.id!))
      .then(() => {setConfirmHomePageBannerDeleteDialog(false)})
      .catch(() => {});
  };
  const confirmHomePageBannerDeleteDialogFooter = (
    <React.Fragment>
      <Button label="Delete" icon="pi pi-check" severity="danger" onClick={() => deleteSelectedHomePageBanners()} />
    </React.Fragment>
  );

  return (
    <div className="grid crud-demo">
      <div className="col-12">
        <div className="card">
          <TableToolbar
            newLabel="New Banner"
            onNew={openNew}
            onExport={exportCSV}
            searchValue={globalFilter}
            onSearchChange={onGlobalFilterChange}
            searchPlaceholder="Search banners..."
          />

          <DataTable
            stripedRows
            ref={dt}
            value={homepageBanners}
            selection={selectedHomepageBanners}
            onSelectionChange={(e) => setSelectedHomepageBanners(e.value as any)}
            dataKey="id"
            first={first}
            rows={rows}
            className="datatable-responsive"
            filters={filters}
            globalFilterFields={['id', 'name']}
            emptyMessage="No homepageBanner found."
            exportFilename="HomepageBanners"
          >
            <Column field="id" header="Id" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="fileKey" header="Image" sortable body={fileKeyBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="order" header="Order" sortable body={orderBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="active" header="Active" sortable body={activeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="createdAt" header="Created At" sortable body={createdAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column field="updatedAt" header="Updated" sortable body={updatedAtBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
            <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} frozen={true}></Column>
          </DataTable>

          <CustomPaginator
            first={first}
            rows={rows}
            totalRecords={homepageBanners.length}
            onPageChange={(event) => setFirst(event.first)}
            onRowsChange={(event) => {
              setRows(event.rows);
              setFirst(0);
            }}
            entityName="banners"
            rowsPerPageOptions={[5, 10, 25]}
          />

          <Dialog visible={homepageBannerDialog} style={{ width: '50vw' }} header="HomepageBanner Category Details" modal className="p-fluid" onHide={hideDialog}>
            <HomepageBannerForm homepageBanner={homepageBanner} hideDialog={hideDialog} />
          </Dialog>

          <Dialog visible={confirmHomePageBannerDeleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={confirmHomePageBannerDeleteDialogFooter} onHide={hideConfirmHomePageBannersDeleteDialog}>
            <div className="confirmation-content">
              <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
              <span>Are you sure you want to delete the selected home page banner ?</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default HomepageBannersTable;
