import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import './DataTableComponent.css';

interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

const DataTableComponent: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [rowsToSelect, setRowsToSelect] = useState<number>(0);
    const overlayPanel = useRef<OverlayPanel>(null);

    const fetchArtworks = async (page: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page + 1}&limit=12`);
            const data = response.data;

            setArtworks(data.data);
            setTotalRecords(data.pagination.total);
        } catch (error) {
            console.error('Error fetching data', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchArtworks(page);
    }, [page]);

    const onRowSelect = (e: any, artworkId: number) => {
        const updatedSelection = e.checked
            ? [...selectedArtworks, artworks.find((artwork) => artwork.id === artworkId)!]
            : selectedArtworks.filter((artwork) => artwork.id !== artworkId);

        setSelectedArtworks(updatedSelection);
    };

    const onPageChange = (event: any) => {
        setPage(event.page);
        setSelectAll(false);
    };

    const onSelectAllChange = (e: any) => {
        const isSelected = e.checked;
        setSelectAll(isSelected);

        const updatedSelection = isSelected ? [...selectedArtworks, ...artworks] : selectedArtworks.filter((artwork) => !artworks.includes(artwork));

        setSelectedArtworks(updatedSelection);
    };

    const onChevronClick = (event: any) => {
        overlayPanel.current?.toggle(event);
    };

    const handleRowNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsToSelect(parseInt(e.target.value));
    };

    const handleSubmitRows = async () => {
        let currentSelection = [...selectedArtworks];
        let rowsToSelectCount = rowsToSelect;
        let currentPage = page;

        while (rowsToSelectCount > 0) {
            await fetchArtworks(currentPage);

            const remainingArtworksOnPage = artworks.filter(
                (artwork) => !currentSelection.some((selected) => selected.id === artwork.id)
            );

            const rowsToSelectOnCurrentPage = Math.min(rowsToSelectCount, remainingArtworksOnPage.length);

            currentSelection = [
                ...currentSelection,
                ...remainingArtworksOnPage.slice(0, rowsToSelectOnCurrentPage),
            ];

            rowsToSelectCount -= rowsToSelectOnCurrentPage;

            if (rowsToSelectCount > 0) {
                currentPage++;
            }
        }

        setSelectedArtworks(currentSelection);
        overlayPanel.current?.hide();
    };

    const rowSelectionTemplate = (rowData: Artwork) => {
        return (
            <Checkbox
                checked={!!selectedArtworks.find((artwork) => artwork.id === rowData.id)}
                onChange={(e) => onRowSelect(e, rowData.id)}
            />
        );
    };

    return (
        <div className="card">
            <DataTable
                value={artworks}
                paginator
                rows={12}
                totalRecords={totalRecords}
                lazy
                first={page * 12}
                onPage={onPageChange}
                loading={loading}
                selection={selectedArtworks}
                onSelectionChange={(e) => setSelectedArtworks(e.value)}
                selectionMode="multiple"
                dataKey="id"
            >
                <Column
                    field="title"
                    header={
                        <div className="custom-header">
                            <span>Title</span>
                            <Button 
                                icon="pi pi-chevron-down" 
                                onClick={onChevronClick} 
                                className="p-button-rounded p-button-text chevron-btn"
                                style={{ color: 'white', marginLeft: '8px' }}
                            />
                        </div>
                    }
                    sortable
                />
                <Column field="place_of_origin" header="Place of Origin" sortable />
                <Column field="artist_display" header="Artist" sortable />
                <Column field="inscriptions" header="Inscriptions" sortable />
                <Column field="date_start" header="Start Date" sortable />
                <Column field="date_end" header="End Date" sortable />

                <Column
                    header={
                        <Checkbox 
                            checked={selectAll} 
                            onChange={onSelectAllChange} 
                        />
                    }
                    body={rowSelectionTemplate}
                    headerStyle={{ width: '3rem' }}
                />
            </DataTable>

            <OverlayPanel ref={overlayPanel} style={{ width: '300px' }}>
                <div>
                    <h4>Select Rows</h4>
                    <input type="number" value={rowsToSelect} onChange={handleRowNumberChange} placeholder="Enter number of rows" />
                    <Button label="Submit" onClick={handleSubmitRows} />
                </div>
            </OverlayPanel>
        </div>
    );
};

export default DataTableComponent;
