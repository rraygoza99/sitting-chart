import React, { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
// Removed SettingsIcon, Modal, and Box imports as CSV/JSON UI was removed
import Typography from '@mui/material/Typography';
import "./EditableList.css";
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';

function EditableList() {
    const auth = useAuth();
    const userName = auth.user?.profile?.username || auth.user?.profile?.email || 'User';
    const [inputValue, setInputValue] = useState('');
    const [items, setItems] = useState([]);
    // editingIndex removed — edit flow is no longer supported
    // CSV/JSON import UI removed; related state removed
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // API endpoint for S3 operations
    const S3_API_BASE = "https://q5c7u5zmzc4l7r4warc6oslx4e0bgoqd.lambda-url.us-east-2.on.aws/api/s3";
    
    // Load wedding list from S3 (in useEffect below)
    
    useEffect(() => {
        const loadWeddingsFromServer = async () => {
            setLoading(true);
            try {
                // If backend supports server-side filtering, pass the owner email as a query param
                const ownerId = auth.user?.profile?.email || null;
                const listUrl = ownerId ? `${S3_API_BASE}/list?ownerMail=${encodeURIComponent(ownerId)}` : `${S3_API_BASE}/list`;
                const response = await fetch(listUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                let filtered = data.filter(fileObj => fileObj.fileName && fileObj.fileName.endsWith('.json'));

                // If server provides owner metadata, limit to files owned by the current user
                if (ownerId && filtered.some(f => f.owner || f['x-amz-meta-owner'])) {
                    filtered = filtered.filter(f => (f.owner === ownerId) || (f['x-amz-meta-owner'] === ownerId));
                }

                const weddingNames = filtered.map(fileObj => fileObj.fileName.replace('.json', ''));

                setItems(weddingNames);
            } catch (error) {
                console.error('Error loading weddings from server:', error);
                // Fallback to localStorage if server is unavailable
                const storedItems = JSON.parse(localStorage.getItem('weddingItems')) || [];
                setItems(storedItems);
                alert('Could not connect to server. Using local data.');
            } finally {
                setLoading(false);
            }
        };

        loadWeddingsFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.user]);
    
    // Save wedding to S3 (include owner metadata if available)
    const saveWeddingToServer = async (weddingName, weddingData) => {
        try {
            // Attach owner identifier if available
            const ownerId = auth.user?.profile?.email || null;

            // Create a JSON blob and send as multipart/form-data so the backend can handle file uploads
            const jsonBlob = new Blob([JSON.stringify(weddingData)], { type: 'application/json' });
            const formData = new FormData();
            formData.append('file', jsonBlob, `${weddingName}.json`);
            // Also include the fileName explicitly in case backend expects it as a field
            formData.append('fileName', `${weddingName}.json`);

            // include owner fields for backend compatibility
            if (ownerId) {
                formData.append('owner', ownerId);
                formData.append('x-amz-meta-owner', ownerId);
                // Provide a metadata JSON payload the backend can use to set S3 object metadata
                formData.append('metadata', JSON.stringify({ 'x-amz-meta-owner': ownerId }));
            }

            const headers = {};
            if (ownerId) headers['ownerMail'] = ownerId;

            const response = await fetch(`${S3_API_BASE}/upload`, {
                method: 'POST',
                headers,
                body: formData // let browser set Content-Type including boundary
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error saving wedding to server:', error);
            return false;
        }
    };
    
    // Delete wedding from S3
    const deleteWeddingFromServer = async (weddingName) => {
        try {
            const ownerId = auth.user?.profile?.email || null;
            const payload = { fileName: `${weddingName}.json` };
            if (ownerId) {
                payload.owner = ownerId;
                payload['x-amz-meta-owner'] = ownerId;
            }

            const response = await fetch(`${S3_API_BASE}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting wedding from server:', error);
            return false;
        }
    };
    
    const handleAddClick = async () => {
        const ownerId = auth.user?.profile?.email || null;
        const trimmed = inputValue.trim();
        if (trimmed && !trimmed.includes(' ')) {
            setLoading(true);

            if (items.includes(trimmed)) {
                alert('Wedding name already exists!');
                setLoading(false);
                return;
            }

            // Create empty wedding data
            const emptyWeddingData = {
                weddingName: trimmed,
                exportDate: new Date().toISOString(),
                totalGuests: 0,
                totalTables: 0,
                guestList: [],
                tables: [],
                tableAliases: {},
                tableSizes: {},
                tableNumbers: {},
                metadata: {
                    viewMode: "list",
                    isGrouped: true,
                    version: "1.0",
                    // include owner email in the file metadata for clarity
                    'x-amz-meta-owner': ownerId
                }
            };

            const success = await saveWeddingToServer(trimmed, emptyWeddingData);
            if (success) {
                const newItems = [...items, trimmed];
                setItems(newItems);
                // Also update localStorage as backup
                localStorage.setItem('weddingItems', JSON.stringify(newItems));
            } else {
                alert('Failed to save wedding to server. Please try again.');
            }

            setLoading(false);
            setInputValue('');
        } else {
            alert('Please enter a valid wedding name (no spaces allowed)');
        }
    };

    const handleDeleteClick = async (weddingName) => {
        const isConfirmed = window.confirm(`Are you sure you want to delete "${weddingName}"?`);
        if (!isConfirmed) return;
        
        setLoading(true);
        
        const success = await deleteWeddingFromServer(weddingName);
        if (success) {
            const newItems = items.filter(item => item !== weddingName);
            setItems(newItems);
            // Also update localStorage as backup
            localStorage.setItem('weddingItems', JSON.stringify(newItems));
            
            // Remove the wedding arrangement data from localStorage
            const arrangementKey = `weddingArrangement-${weddingName}`;
            localStorage.removeItem(arrangementKey);
        } else {
            alert('Failed to delete wedding from server. Please try again.');
        }
        
        setLoading(false);
    };

    const handleRedirect = (name) => {
        navigate(`/wedding/${name}`);
    };

    // JSON import and CSV import trigger controls were removed from this page.

    // CSV import helpers removed with the CSV import UI
    /* const processCsvFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csvData = e.target.result;
                    console.log('Raw CSV data:', csvData);
                    
                    const rows = csvData.split('\n')
                        .map(row => row.split(','))
                        .filter(row => row.length >= 2 && row[0].trim() && row[1].trim());
                    
                    console.log('Parsed rows:', rows);
                    
                    // Calculate starting ID (since this is a new wedding, start from 1)
                    let nextId = 1;
                    
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
                    
                    const guests = processedGuests.filter(guest => guest.firstName && guest.lastName);
                    
                    // Count original guests vs +1 guests for better feedback
                    const originalGuests = guests.filter(guest => !guest.originalGuestId);
                    const additionalGuests = guests.filter(guest => guest.originalGuestId);
                    
                    console.log(`Import summary: ${originalGuests.length} original guests, ${additionalGuests.length} additional guests (+1, +2, etc.)`);
                    console.log('Processed guests:', guests);
                    resolve(guests);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }; */

    /* const handleCSVImport = async () => {
        const trimmedName = csvWeddingName.trim();
        
        if (!trimmedName) {
            alert('Please enter a wedding name.');
            return;
        }
        
        if (trimmedName.includes(' ')) {
            alert('Wedding name cannot contain spaces.');
            return;
        }
        
        if (!csvFile) {
            alert('Please select a CSV file.');
            return;
        }
        
        try {
            setLoading(true);
            const guests = await processCsvFile(csvFile);
            
            if (guests.length === 0) {
                alert('No valid guests found in CSV. Please check the format:\nfirstName,lastName,group (ID is optional)');
                setLoading(false);
                return;
            }
            
            // Check if wedding already exists
            if (items.includes(trimmedName)) {
                const overwrite = window.confirm(`Wedding "${trimmedName}" already exists. Do you want to overwrite it?`);
                if (!overwrite) {
                    setLoading(false);
                    return;
                }
            }
            
            // Prepare wedding data for server
            const weddingData = {
                weddingName: trimmedName,
                exportDate: new Date().toISOString(),
                totalGuests: guests.length,
                totalTables: 0,
                guestList: guests,
                tables: [],
                tableAliases: {},
                tableSizes: {},
                tableNumbers: {},
                metadata: {
                    viewMode: "list",
                    isGrouped: true,
                    version: "1.0"
                }
            };
            
            // Save to server
            const success = await saveWeddingToServer(trimmedName, weddingData);
            if (success) {
                // Update local wedding list if it doesn't exist
                if (!items.includes(trimmedName)) {
                    const newItems = [...items, trimmedName];
                    setItems(newItems);
                    localStorage.setItem('weddingItems', JSON.stringify(newItems));
                }
                
                // Store the arrangement data with imported guests in localStorage as backup
                const storageKey = `weddingArrangement-${trimmedName}`;
                const arrangementData = {
                    savedGuestList: guests,
                    savedTables: [],
                    savedTableAliases: {},
                    savedTableSizes: {},
                    savedTableNumbers: {}
                };
                localStorage.setItem(storageKey, JSON.stringify(arrangementData));
                
                // Count original guests vs +1 guests for better feedback
                const originalGuests = guests.filter(guest => !guest.originalGuestId);
                const additionalGuests = guests.filter(guest => guest.originalGuestId);
                
                let successMessage = `Wedding "${trimmedName}" created successfully!\n`;
                successMessage += `Imported: ${originalGuests.length} original guests`;
                if (additionalGuests.length > 0) {
                    successMessage += `, ${additionalGuests.length} additional guests (+1, +2, etc.)`;
                }
                successMessage += `\nTotal: ${guests.length} guests`;
                
                alert(successMessage);
                
                // Reset modal state
                setCsvModalOpen(false);
                setCsvWeddingName('');
                setCsvFile(null);
                
                // Navigate to the new wedding
                navigate(`/wedding/${trimmedName}`);
            } else {
                alert('Failed to save wedding to server. Please try again.');
            }
            
        } catch (error) {
            console.error('Error processing CSV:', error);
            alert('Error processing CSV file. Please check the format.');
        } finally {
            setLoading(false);
        }
    }; */

    return (
        <div>
            {/* Greeting bar */}
            <div className="greetingBar">
                Hello {userName}!
            </div>
            {loading && items.length === 0 && (
                <div style={{ textAlign: 'center', margin: '2rem', fontSize: '1.2rem', color: '#666' }}>
                    Loading weddings from server...
                </div>
            )}
            {/* Create section description */}
            <div style={{ margin: '1rem 2rem' }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Create a new wedding
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Enter a unique name (no spaces) to create a new wedding arrangement.
                </Typography>
            </div>
            
            <div className="inputWrapper">
                <TextField
                    id="standard-basic"
                    variant="standard"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter wedding name"
                    disabled={loading}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleAddClick();
                        }
                    }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleAddClick}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Add'}
                </Button>
            </div>

            {/* Available weddings title */}
            <div style={{ margin: '1rem 2rem 0.5rem' }}>
                <Typography variant="h6">
                    Available weddings
                </Typography>
            </div>

            <List className='list'>
                {items.map((item, index) => (
                    <ListItem key={index} className="listItem">
                        <ListItemText primary={item} className='listItemText' />
                        <div className="buttonGroup">
                            <Button 
                                onClick={() => handleRedirect(item)}
                                disabled={loading}
                            >
                                Open
                            </Button>
                            <Button 
                                onClick={() => handleDeleteClick(item)}
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default EditableList;
