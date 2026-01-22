import React, { useEffect, useState } from 'react';
import { apiClient } from '@/src/trpc/react';
import { Image } from 'primereact/image';
import { IMedia } from '@/src/_models/media.model';
import { Button } from 'primereact/button';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { Sidebar } from 'primereact/sidebar';

const ImageSelector = ({ onSelectedImages, imageChooser, hide }: { onSelectedImages: (media: IMedia[]) => void; imageChooser: boolean; hide: () => void }) => {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(100);
  const [selectedImages, setSelectedImages] = useState<IMedia[]>([]);
  const [page, setPage] = useState<number>(1);
  const { data } = apiClient.mediaRouter.getAll.useQuery({
    page: page,
    limit: rows
  });

  const selectImage = (img: IMedia) => setSelectedImages([...selectedImages, img]);

  const removeSelection = (img: IMedia) => {
    const temp = selectedImages.filter((i) => i.id !== img.id);
    setSelectedImages([...temp]);
  };

  const isSelected = (img: IMedia) => selectedImages.some((i) => i.id === img.id);

  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  return (
    <Sidebar visible={imageChooser} onHide={hide} fullScreen>
      <div className="grid">
        <h2>Select Images</h2>
        <Button label="Done" onClick={() => onSelectedImages(selectedImages)} />
      </div>
      {data && (
        <>
          <Paginator first={first} rows={100} totalRecords={data.totalPages} rowsPerPageOptions={[10, 20, 30, 100]} onPageChange={onPageChange} />
          {data.data.length === 0 && <p>No images found</p>}

          <div className="grid gap-2">
            {data.data.map((img) => {
              return (
                <div className="col card" key={img.id}>
                  <Image
                    width="250"
                    height="250"
                    imageStyle={{ objectFit: 'cover' }}
                    preview
                    src={img.fileUrl!}
                    alt={img.comments!}
                    // onError={(err) => {
                    //   mediaErrorThenUploadFailed(img.id);
                    // }}
                  />
                  {isSelected(img) ? <Button label="Remove" severity="danger" className="w-full" onClick={() => removeSelection(img)} /> : <Button label="Select" className="w-full" onClick={() => selectImage(img)} />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Sidebar>
  );
};

export default ImageSelector;
