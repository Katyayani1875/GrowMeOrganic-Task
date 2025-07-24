import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column, type ColumnPassThroughMethodOptions } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tooltip } from 'primereact/tooltip';
import type { DataTableStateEvent } from 'primereact/datatable';
import './ArtworksTable.css';


interface Artwork {
  id: number;
  title: string;
  artist_display: string;
  place_of_origin: string;
  inscriptions: string | null;
  date_start: number;
  date_end: number;
}

interface ApiResponse { 
  pagination: { 
    total: number; 
    limit: number; 
    offset: number; 
    total_pages: number; 
    current_page: number; 
  }; 
  data: Artwork[]; 
}

const ArtworksTable: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyState, setLazyState] = useState<DataTableStateEvent>({ 
      first: 0, 
      rows: 12, 
      page: 0, 
      sortField: '', 
      sortOrder: null, 
      multiSortMeta: [], 
      filters: {} 
    });
    const [selected, setSelected] = useState<Artwork[]>([]);
    const op = useRef<OverlayPanel>(null);
    const [selectCount, setSelectCount] = useState('');
  
    useEffect(() => {
      const fetchArtworks = async () => {
        setLoading(true);
        const page = lazyState.page! + 1;
        const limit = lazyState.rows!;
        const fields = 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end';
        const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}&fields=${fields}`;
        
        try {
          const res = await fetch(url);
          const result: ApiResponse = await res.json();
          setArtworks(result.data || []);
          setTotalRecords(result.pagination.total);
        } catch (err) { 
          console.error("Failed to fetch artworks:", err); 
          setArtworks([]); 
        } finally { 
          setLoading(false); 
        }
      };
      
      fetchArtworks();
    }, [lazyState]);
  
    const handleSelectMultiple = async () => {
      const count = parseInt(selectCount, 10);
      if (isNaN(count) || count <= 0) return;

      op.current?.hide();
      setLoading(true);
      
      try {
        const rowsPerPage = 100;
        const pagesToFetch = Math.ceil(count / rowsPerPage);
        const promises = Array.from({ length: pagesToFetch }, (_, i) => {
            const page = i + 1;
            const fields = 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end';
            const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}&fields=${fields}`;
            return fetch(url).then(res => res.json());
        });
        
        const results = await Promise.all(promises);
        const allFetchedArtworks = results.flatMap(result => result.data || []);
        setSelected(allFetchedArtworks.slice(0, count));
      } catch (error) { 
        console.error("Failed to fetch multiple pages for selection:", error); 
      } finally { 
        setLoading(false); 
        setSelectCount(''); 
      }
    };
  
    const TruncatedCell = ({ text }: { text: string | null }) => {
      if (!text) return <span className="text-slate-400">—</span>;
      return (
        <div title={text}>
          <p className="font-medium text-slate-800">{text.split(',')[0]}</p>
          {text.includes(',') && <p className="text-sm text-slate-500">{text.split(',').slice(1).join(',')}</p>}
        </div>
      );
    };
    
    const DateCell = ({ date }: { date: number | null }) => {
      return <span className="font-mono text-slate-600">{date || '—'}</span>;
    };
  
    const headerCellClassName = 'px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider text-left border-b-2 border-slate-200 bg-slate-50/70 sticky top-0';
    const bodyCellClassName = 'px-6 py-5 text-slate-700 align-top border-b border-slate-100';
  
    const sortableColumnPT = {
      sortIcon: ({ context }: ColumnPassThroughMethodOptions) => ({
        className: context.sorted ? 'text-brand-blue-500' : 'text-slate-300'
      })
    };

    return (
        <div className="w-full overflow-x-auto scrollbar-webkit rounded-lg ring-1 ring-slate-200">
            <DataTable
                value={artworks}
                lazy
                paginator
                first={lazyState.first}
                rows={lazyState.rows}
                totalRecords={totalRecords}
                onPage={(e) => setLazyState(e)}
                loading={loading}
                loadingIcon={<ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="4" animationDuration=".5s"/>}
                dataKey="id"
                selection={selected}
                onSelectionChange={(e) => setSelected(e.value)}
                selectionMode="multiple"
                rowsPerPageOptions={[12, 25, 50, 100]}
                footer={<div className="text-right font-medium text-slate-600">Total selected: <span className="text-brand-blue-600 font-bold">{selected.length}</span></div>}
                rowClassName={(data) => `transition-colors duration-300 ease-in-out ${selected.some(art => art.id === data.id) ? 'bg-brand-blue-50' : 'odd:bg-white even:bg-slate-50/70'} hover:!bg-brand-blue-50/60`}
                pt={{
                    root: { className: 'rounded-lg' },
                    header: { className: 'bg-transparent' },
                    loadingOverlay: { className: 'bg-white/60 backdrop-blur-sm' },
                    paginator: {
                        root: { className: 'bg-white border-t border-slate-200 px-4 py-3 flex items-center' },
                        pages: { className: 'flex items-center' },
                        firstPageButton: { className: 'p-button-text' },
                        prevPageButton: { className: 'p-button-text' },
                        nextPageButton: { className: 'p-button-text' },
                        lastPageButton: { className: 'p-button-text' },
                        RPPDropdown: { 
                            root: { className: 'p-button-text border border-slate-300 rounded-md px-1' },
                            input: { className: 'px-2' },
                        },
                    },
                }}
            >
                <Column 
                    selectionMode="multiple" 
                    header={(options) => (
                      <>
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
                      </>
                    )} 
                    headerClassName={headerCellClassName}
                    bodyClassName={bodyCellClassName} 
                    style={{ width: '5%' }}
                    pt={{ headerContent: { className: 'flex items-center justify-center flex-row-reverse' }}}
                />
                <Column field="title" header="Title" sortable style={{ width: '25%' }} headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} pt={sortableColumnPT} body={(rowData) => <TruncatedCell text={rowData.title} />} />
                <Column field="artist_display" header="Artist" sortable style={{ width: '25%' }} headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} pt={sortableColumnPT} body={(rowData) => <TruncatedCell text={rowData.artist_display} />} />
                <Column field="place_of_origin" header="Origin" sortable style={{ width: '15%' }} headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} pt={sortableColumnPT} body={(rowData) => <TruncatedCell text={rowData.place_of_origin} />} />
                <Column field="date_start" header="Start Date" sortable style={{ width: '10%' }} headerClassName={`${headerCellClassName} !text-right`} bodyClassName={`${bodyCellClassName} !text-right`} pt={sortableColumnPT} body={(rowData) => <DateCell date={rowData.date_start} />} />
                <Column field="date_end" header="End Date" sortable style={{ width: '10%' }} headerClassName={`${headerCellClassName} !text-right`} bodyClassName={`${bodyCellClassName} !text-right`} pt={sortableColumnPT} body={(rowData) => <DateCell date={rowData.date_end} />} />
                <Column field="inscriptions" header="Inscriptions" style={{ width: '10%' }} headerClassName={headerCellClassName} bodyClassName={bodyCellClassName} body={(rowData) => <TruncatedCell text={rowData.inscriptions} />} />
            </DataTable>
        </div>
    );
};

export default ArtworksTable;