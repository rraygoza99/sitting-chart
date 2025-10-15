import React, { useRef } from 'react';
import Button from '@mui/material/Button'; // Import Material-UI Button
import './SeatingCanvas.css'; // Import your CSS file for styling

function CSVImporter({ onImport, existingGuests = [], existingTables = [] }) {
    const fileInputRef = useRef();

    // Helper function to get the next available guest ID
    const getNextGuestId = (startingId = 1) => {
        const allGuests = [...existingGuests, ...existingTables.flat()];
        let maxId = startingId - 1;
        
        allGuests.forEach(guest => {
            const id = guest.id;
            if (typeof id === 'string') {
                const numericPart = id.match(/(\d+)/);
                if (numericPart) {
                    const num = parseInt(numericPart[1], 10);
                    if (num > maxId) maxId = num;
                }
            } else if (typeof id === 'number') {
                if (id > maxId) maxId = id;
            }
        });
        
        return maxId + 1;
    };

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
                
                // Calculate starting ID based on existing guests
                let nextId = getNextGuestId();
                
                // First pass: Create a map to identify original guests and their +1, +2, etc.
                const guestMap = new Map();
                const plusOneGuests = [];
                
                rows.forEach((row, index) => {
                    const firstName = row[0] ? row[0].trim() : '';
                    const lastName = row[1] ? row[1].trim() : '';
                    const group = row[2] ? row[2].trim() : 'Ungrouped';
                    // ID is now optional - if provided use it, otherwise generate it
                    const providedId = row[3] ? row[3].trim() : null;
                    
                    // Check if this is a +1, +2, +3, etc. guest
                    const plusOneMatch = lastName.match(/^(.+?)\s+\+(\d+)$/);
                    
                    if (plusOneMatch) {
                        // This is a +1, +2, +3, etc. guest
                        const originalLastName = plusOneMatch[1];
                        const plusNumber = parseInt(plusOneMatch[2], 10);
                        
                        // Find the original guest by matching firstName and originalLastName
                        const originalGuestKey = `${firstName}-${originalLastName}`;
                        
                        plusOneGuests.push({
                            firstName,
                            lastName,
                            group,
                            providedId,
                            originalGuestKey,
                            plusNumber,
                            originalLastName
                        });
                    } else {
                        // This is an original guest
                        const guestKey = `${firstName}-${lastName}`;
                        const guestId = providedId || nextId++;
                        
                        guestMap.set(guestKey, {
                            firstName,
                            lastName,
                            group,
                            id: guestId
                        });
                    }
                });
                
                // Second pass: Process +1 guests and link them to original guests
                const processedGuests = Array.from(guestMap.values());
                
                plusOneGuests.forEach(plusOneGuest => {
                    const originalGuest = guestMap.get(plusOneGuest.originalGuestKey);
                    
                    if (originalGuest) {
                        // Link this +1 guest to the original guest
                        const plusOneId = plusOneGuest.providedId || `${originalGuest.id}-${plusOneGuest.plusNumber}`;
                        
                        processedGuests.push({
                            firstName: plusOneGuest.firstName,
                            lastName: plusOneGuest.lastName,
                            group: plusOneGuest.group,
                            originalGuestId: originalGuest.id,
                            id: plusOneId
                        });
                    } else {
                        // Original guest not found, treat as standalone guest
                        console.warn(`Original guest not found for +${plusOneGuest.plusNumber} guest:`, plusOneGuest);
                        const standaloneId = plusOneGuest.providedId || nextId++;
                        
                        processedGuests.push({
                            firstName: plusOneGuest.firstName,
                            lastName: plusOneGuest.lastName,
                            group: plusOneGuest.group,
                            id: standaloneId
                        });
                    }
                });
                
                const guests = processedGuests.filter(guest => guest.firstName && guest.lastName); // Filter out empty guests
                
                console.log('Processed guests:', guests); // Debug log
                
                if (guests.length === 0) {
                    alert('No valid guests found in CSV. Please check the format:\nfirstName,lastName,group (ID is optional)');
                    return;
                }
                
                // Count original guests vs +1 guests for better feedback
                const originalGuests = guests.filter(guest => !guest.originalGuestId);
                const additionalGuests = guests.filter(guest => guest.originalGuestId);
                
                console.log(`Import summary: ${originalGuests.length} original guests, ${additionalGuests.length} additional guests (+1, +2, etc.)`);
                
                onImport(guests);
            } catch (error) {
                console.error('Error processing CSV:', error);
                alert('Error processing CSV file. Please check the format.');
            }
        };
        reader.readAsText(file);
    };    return (
        <div>
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
