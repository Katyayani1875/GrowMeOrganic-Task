// src/components/ArtworksTable.tsx

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTableStateEvent } from 'primereact/datatable';
// --- DEFINITIVE FIX 1: Import the base type for the column header options. ---
import { Column } from 'primereact/column';
import type { ColumnHeaderOptions } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';

// --- Type Definitions ---
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

// --- The Main Component ---
const ArtworksTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // The initial state for `sortField` must be a string. An empty string is the correct value.
  const [lazyState, setLazyState] = useState<DataTableStateEvent>({
    first: 0,
    rows: 12,
    page: 0,
    sortField: '',
    sortOrder: null,
    multiSortMeta: [],
    filters: {},
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

  const onPage = (event: DataTableStateEvent) => {
    setLazyState(event);
  };

  const onSelectionChange = (e: { value: Artwork[] }) => {
    setSelectedArtworks(e.value);
  };

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

  // --- DEFINITIVE FIX 2: Use the correct function signature and a Type Assertion. ---
  const selectionHeader = (options: ColumnHeaderOptions) => {
    return (
      <div className="flex align-items-center">
        {/* We use `as any` to tell TypeScript to trust us that this property exists, overriding the faulty library type. */}
        {(options as any).headerCheckboxElement}
        <Tooltip target=".select-multiple-tooltip" />
        <Button
          type="button"
          icon="pi pi-chevron-down"
          className="p-button-text p-button-sm ml-1 select-multiple-tooltip"
          onClick={(e) => op.current?.toggle(e)}
          data-pr-tooltip="Select a specific number of rows from the start"
          data-pr-position="top"
        />
        <OverlayPanel ref={op}>
          <div className="p-2">
            <p className="mb-2">Select rows from the beginning.</p>
            <div className="p-inputgroup">
              <InputText
                placeholder="e.g., 50"
                value={selectCount}
                onChange={(e) => setSelectCount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectMultiple()}
              />
              <Button label="Submit" onClick={handleSelectMultiple} />
            </div>
          </div>
        </OverlayPanel>
      </div>
    );
  };
  
  const inscriptionsBodyTemplate = (rowData: Artwork) => {
    return <span>{rowData.inscriptions || 'N/A'}</span>;
  };
  
  const tableFooter = `Total selected artworks: ${selectedArtworks.length}`;

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
    >
      <Column selectionMode="multiple" header={selectionHeader} headerStyle={{ width: '5rem' }} />
      <Column field="title" header="Title" sortable style={{ minWidth: '20rem' }} />
      <Column field="artist_display" header="Artist" sortable style={{ minWidth: '20rem' }} />
      <Column field="place_of_origin" header="Origin" sortable />
      <Column field="date_start" header="Start Date" sortable />
      <Column field="date_end" header="End Date" sortable />
      <Column field="inscriptions" header="Inscriptions" body={inscriptionsBodyTemplate} style={{ minWidth: '15rem' }} />
    </DataTable>
  );
};

export default ArtworksTable;