import React, { useRef } from 'react';
import Button from '@mui/material/Button'; // Import Material-UI Button
import './SeatingCanvas.css'; // Import your CSS file for styling

function CSVImporter({ onImport }) {
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvData = e.target.result;
                console.log('Raw CSV data:', csvData); // Debug log
                
                const rows = csvData.split('\n')
                    .map(row => row.split(','))
                    .filter(row => row.length >= 2 && row[0].trim() && row[1].trim()); // More flexible filtering
                
                console.log('Parsed rows:', rows); // Debug log
                
                const guests = rows.map((row, index) => {
                    const firstName = row[0] ? row[0].trim() : '';
                    const lastName = row[1] ? row[1].trim() : '';
                    const group = row[2] ? row[2].trim() : 'Ungrouped';
                    const id = row[3] ? row[3].trim() : `csv-guest-${Date.now()}-${index}`;
                    
                    return {
                        firstName,
                        lastName,
                        group,
                        id
                    };
                }).filter(guest => guest.firstName && guest.lastName); // Filter out empty guests
                
                console.log('Processed guests:', guests); // Debug log
                
                if (guests.length === 0) {
                    alert('No valid guests found in CSV. Please check the format:\nfirstName,lastName,group,id');
                    return;
                }
                
                onImport(guests);
            } catch (error) {
                console.error('Error processing CSV:', error);
                alert('Error processing CSV file. Please check the format.');
            }
        };
        reader.readAsText(file);
    };    return (
        <div style={{ marginBottom: '10px' }}>
            <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                ref={fileInputRef}
            />
            <Button
                variant="contained"
                className='export-button'
                color="primary"
                onClick={() => fileInputRef.current?.click()}
            >
                Import CSV
            </Button>
        </div>
    );
}

export default CSVImporter;
