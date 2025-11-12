import React, { useRef } from 'react';
import Button from '@mui/material/Button'; // Import Material-UI Button
import './SeatingCanvas.css'; // Import your CSS file for styling
import { generateUniqueGuestId } from '../utils/guests';

function CSVImporter({ onImport, existingGuests = [], existingTables = [] }) {
    const fileInputRef = useRef();

    // Reserve a new GUID that doesn't collide with existing ones
    const reserveGuid = (existingIds) => {
        const id = generateUniqueGuestId(existingIds);
        existingIds.add(id);
        return id;
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Robust decoding for CSV files with various encodings (UTF-8, Windows-1252/Latin-1)
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const buffer = e.target.result;
                let csvData = '';
                if (typeof TextDecoder !== 'undefined') {
                    const bytes = new Uint8Array(buffer);
                    const encodings = ['utf-8', 'windows-1252', 'iso-8859-1'];
                    let best = { text: '', replacements: Number.MAX_SAFE_INTEGER, encoding: 'utf-8' };
                    for (const enc of encodings) {
                        try {
                            const decoder = new TextDecoder(enc, { fatal: false });
                            let text = decoder.decode(bytes);
                            // Strip BOM if present
                            if (text.charCodeAt(0) === 0xFEFF) {
                                text = text.slice(1);
                            }
                            const replacements = (text.match(/\uFFFD/g) || []).length;
                            if (replacements < best.replacements) {
                                best = { text, replacements, encoding: enc };
                            }
                        } catch (err) {
                            // Skip unsupported encodings
                        }
                    }
                    csvData = best.text;
                    console.log('CSV decoded using', best.encoding);
                } else {
                    // Fallback for very old environments
                    const readerText = new FileReader();
                    readerText.onload = ev => {
                        csvData = ev.target.result || '';
                    };
                    readerText.readAsText(file, 'utf-8');
                }

                console.log('Raw CSV data:', csvData); // Debug log
                
                const rows = csvData.split('\n')
                    .map(row => row.split(','))
                    .filter(row => row.length >= 2 && row[0].trim() && row[1].trim()); // More flexible filtering
                
                console.log('Parsed rows:', rows); // Debug log
                
                // Track existing IDs to avoid any collisions
                const existingIds = new Set([...existingGuests, ...existingTables.flat()].map(g => String(g.id)));
                
                // First pass: Create a map to identify original guests and their +1, +2, etc.
                const guestMap = new Map(); // key: `${first}-${last}` -> guest object with GUID id
                const plusOneGuests = [];
                
                rows.forEach((row, index) => {
                    const firstName = row[0] ? row[0].trim() : '';
                    const lastName = row[1] ? row[1].trim() : '';
                    const group = row[2] ? row[2].trim() : 'Ungrouped';
                    // ID in CSV is ignored for uniqueness; we generate GUIDs consistently
                    const providedId = null;
                    
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
                        const guestId = reserveGuid(existingIds);
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
                        const plusOneId = reserveGuid(existingIds);
                        processedGuests.push({
                            firstName: plusOneGuest.firstName,
                            lastName: plusOneGuest.lastName,
                            group: plusOneGuest.group,
                            originalGuestId: originalGuest.id,
                            plusOneSequence: plusOneGuest.plusNumber,
                            id: plusOneId
                        });
                    } else {
                        // Original guest not found, treat as standalone guest
                        console.warn(`Original guest not found for +${plusOneGuest.plusNumber} guest:`, plusOneGuest);
                        const standaloneId = reserveGuid(existingIds);
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
        // Read as ArrayBuffer to allow manual decoding with TextDecoder
        reader.readAsArrayBuffer(file);
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
