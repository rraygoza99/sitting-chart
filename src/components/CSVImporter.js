import React from 'react';
import Button from '@mui/material/Button'; // Import Material-UI Button

function CSVImporter({ onImport }) {
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvData = e.target.result;
            const rows = csvData.split('\n').map(row => row.split(','));
            const guests = rows
                .filter(row => row.length >= 4 && row[0].trim() && row[1].trim() && row[3].trim()) // Ensure valid rows with firstName, lastName, group, and ID
                .map(([firstName, lastName, group, id]) => ({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    group: group ? group.trim() : '',
                    id: id.trim(), // Import ID column
                }));
            onImport(guests);
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ marginBottom: '10px' }}>
            <input
                type="file"
                accept=".csv"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={() => document.getElementById('fileInput').click()}
            >
                Import CSV
            </Button>
        </div>
    );
}

export default CSVImporter;
