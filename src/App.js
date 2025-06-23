import React, { useState } from 'react';
import './App.css';
import CSVImporter from './components/CSVImporter';
import SeatingCanvas from './components/SeatingCanvas';

function App() {
    const [guests, setGuests] = useState([]);

    const handleImport = (importedGuests) => {
        setGuests((prevGuests) => {
            const existingGuestIDs = new Set(prevGuests.map(guest => guest.id));
            const filteredGuests = importedGuests.filter(
                guest => !existingGuestIDs.has(guest.id) // Avoid duplicates based on ID
            );
            return [...prevGuests, ...filteredGuests];
        });
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Wedding Seating Arrangement</h1>
                <CSVImporter onImport={handleImport} />
                <SeatingCanvas guests={guests} />
            </header>
        </div>
    );
}

export default App;
