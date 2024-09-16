import React from 'react';
import './App.css';
import DataTableComponent from './DataTableComponent';

const App: React.FC = () => {
    return (
        <div className="App">
            <h1>Artworks Data Table</h1>
            <DataTableComponent />
        </div>
    );
};

export default App;
