import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { ColumnHeaderOptions } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import type { PaginatorPassThroughMethodOptions } from 'primereact/paginator';
import './ArtworksTable.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string | null;
  date_start: number;
  date_end: number;
}
interface Pagination { 
  total: number; 
  limit: number; 
  offset: number; 
  total_pages: number; 
  current_page: number; 
}
interface ApiResponse { 
  pagination: Pagination; 
  data: Artwork[]; 
}

const ArtworksTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [lazyState, setLazyState] = useState<DataTableStateEvent>({ 
    first: 0, 
    rows: 12, 
    page: 0, 
    sortField: '', 
    sortOrder: null, 
    multiSortMeta: [], 
    filters: {} 
  });
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const op = useRef<OverlayPanel>(null);
  const [selectCount, setSelectCount] = useState<string>('');

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      const page = lazyState.page! + 1;
      const limit = lazyState.rows!;
      const fields = 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end';
      const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}&fields=${fields}`;
      try {
        const response = await fetch(url);
        const result: ApiResponse = await response.json();
        setArtworks(result.data || []);
        setTotalRecords(result.pagination.total);
      } catch (error) { 
        console.error("Failed to fetch artworks:", error); 
        setArtworks([]); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchArtworks();
  }, [lazyState]);

  const onPage = (event: DataTableStateEvent) => setLazyState(event);
  const onSelectionChange = (e: { value: Artwork[] }) => setSelectedArtworks(e.value);

  const handleSelectMultiple = async () => {
    const count = parseInt(selectCount, 10);
    if (isNaN(count) || count <= 0) return;
    op.current?.hide();
    setLoading(true);
    try {
      const rowsPerPage = 100;
      const pagesToFetch = Math.ceil(count / rowsPerPage);
      const promises: Promise<ApiResponse>[] = [];
      const fields = 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end';
      for (let i = 1; i <= pagesToFetch; i++) {
        const url = `https://api.artic.edu/api/v1/artworks?page=${i}&limit=${rowsPerPage}&fields=${fields}`;
        promises.push(fetch(url).then(res => res.json()));
      }
      const results = await Promise.all(promises);
      const allFetchedArtworks = results.flatMap(result => result.data || []);
      const artworksToSelect = allFetchedArtworks.slice(0, count);
      setSelectedArtworks(artworksToSelect);
    } catch (error) { 
      console.error("Failed to fetch multiple pages for selection:", error); 
    } finally { 
      setLoading(false); 
      setSelectCount(''); 
    }
  };

  const selectionHeader = (options: ColumnHeaderOptions) => (
    <div className="flex items-center justify-center">
      <Tooltip target=".select-multiple-tooltip" />
      <Button 
        type="button" 
        icon="pi pi-chevron-down" 
        className="p-button-text p-button-sm mr-1 select-multiple-tooltip !w-6 !h-6 !text-slate-500 hover:!bg-slate-200" 
        onClick={(e) => op.current?.toggle(e)} 
        data-pr-tooltip="Select a specific number of rows" 
        data-pr-position="top" 
      />
      {(options as any).headerCheckboxElement}
      <OverlayPanel ref={op} pt={{ content: { className: 'bg-white rounded-xl shadow-2xl p-4 ring-1 ring-black/5' } }}>
        <div className="flex flex-col space-y-3">
          <p className="font-sans-body text-sm text-slate-600">Select rows from the beginning.</p>
          <div className="flex items-center space-x-2">
            <InputText 
              placeholder="e.g., 50" 
              value={selectCount} 
              onChange={(e) => setSelectCount(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSelectMultiple()} 
              className="!p-2 !text-sm !w-24" 
            />
            <Button 
              label="Submit" 
              onClick={handleSelectMultiple} 
              className="!bg-brand-blue-600 !border-brand-blue-600 !text-white !font-semibold !px-4 !py-2 !text-sm hover:!bg-brand-blue-700" 
            />
          </div>
        </div>
      </OverlayPanel>
    </div>
  );

  const inscriptionsBodyTemplate = (rowData: Artwork) => { 
    const text = rowData.inscriptions || 'N/A'; 
    return <span className="truncate block max-w-xs" title={text}>{text}</span>; 
  };
  
  const tableFooter = (
    <div className="text-right font-medium text-slate-600 pr-4">
      Total selected artworks: <span className="text-brand-blue-600 font-bold">{selectedArtworks.length}</span>
    </div>
  );
  
  const rowClassName = (rowData: Artwork) => {
    const isSelected = selectedArtworks.some(artwork => artwork.id === rowData.id);
    return `transition-colors duration-200 ${isSelected ? 'bg-cyan-50' : 'odd:bg-white even:bg-slate-50/70'} hover:!bg-cyan-50/60`;
  };

  const headerCellClassName = 'px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider text-left border-b border-slate-200';
  const bodyCellClassName = 'px-6 py-4 text-slate-700 align-middle border-b border-slate-200';

  return (
    <DataTable
      value={artworks}
      lazy
      paginator
      first={lazyState.first}
      rows={lazyState.rows}
      totalRecords={totalRecords}
      onPage={onPage}
      loading={loading}
      dataKey="id"
      selection={selectedArtworks}
      onSelectionChange={onSelectionChange}
      selectionMode="multiple"
      rowsPerPageOptions={[12, 25, 50, 100]}
      tableStyle={{ minWidth: '75rem' }}
      footer={tableFooter}
      rowClassName={rowClassName}
      pt={{
        root: { className: 'rounded-xl overflow-hidden shadow-lg ring-1 ring-slate-900/5' },
        header: { className: 'bg-slate-50' },
        loadingOverlay: { className: 'bg-white/70 backdrop-blur-sm' },
        paginator: {
          root: { className: 'bg-white border-t border-slate-200 px-4 py-2.5 flex items-center gap-2 !gap-0' },
          pages: { className: 'flex items-center' },
          firstPageButton: { className: 'relative inline-flex items-center px-2 py-1.5 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 text-sm rounded-md' },
          prevPageButton: { className: 'relative inline-flex items-center px-2 py-1.5 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 text-sm rounded-md' },
          nextPageButton: { className: 'relative inline-flex items-center px-2 py-1.5 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 text-sm rounded-md' },
          lastPageButton: { className: 'relative inline-flex items-center px-2 py-1.5 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 text-sm rounded-md' },
          pageButton: (options: PaginatorPassThroughMethodOptions) => ({
            className: `relative inline-flex items-center px-1 py-1.5 text-sm font-medium rounded-md ${
              options.context.active 
                ? 'bg-cyan-100 text-cyan-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`
          }),
          RPPDropdown: {
            root: { className: 'relative flex items-center justify-center border rounded-lg bg-white shadow-smtext-sm font-medium border border-gray-300 rounded-md py-1 bg-white hover:bg-gray-50' },
            input: { className: 'px-3 text-gray-700' },
            trigger: { className: 'pr-2 text-gray-500' }
          },
        },
      }}
    >
      <Column 
        selectionMode="multiple" 
        header={selectionHeader} 
        headerClassName={headerCellClassName} 
        bodyClassName={bodyCellClassName} 
        style={{ width: '6rem' }}
      />
      <Column field="title" header="Title" sortable style={{ minWidth: '20rem' }} headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} />
      <Column field="artist_display" header="Artist" sortable style={{ minWidth: '20rem' }} headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} />
      <Column field="place_of_origin" header="Origin" sortable headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} />
      <Column field="date_start" header="Start Date" sortable headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} />
      <Column field="date_end" header="End Date" sortable headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} />
      <Column field="inscriptions" header="Inscriptions" body={inscriptionsBodyTemplate} style={{ minWidth: '15rem' }} headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} />
    </DataTable>
  );
};

export default ArtworksTable;