import React, { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import SettingsIcon from '@mui/icons-material/Settings';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import "./EditableList.css";
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';

function EditableList() {
    const auth = useAuth();
    const userName = auth.user?.profile?.name || auth.user?.profile?.email || 'User';
    const [inputValue, setInputValue] = useState('');
    const [items, setItems] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [csvWeddingName, setCsvWeddingName] = useState('');
    const [csvFile, setCsvFile] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const storedItems = JSON.parse(localStorage.getItem('weddingItems')) || [];
        setItems(storedItems);
    }, []);
    
    const handleAddClick = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !trimmed.includes(' ')) {
            if (editingIndex !== null) {
                const newItems = [...items];
                newItems[editingIndex] = trimmed;
                setItems(newItems);
                localStorage.setItem('weddingItems', JSON.stringify(newItems));
                setEditingIndex(null);
            } else {
                if (!items.includes(trimmed)) {
                    const newItems = [...items, trimmed];
                    setItems(newItems);
                    localStorage.setItem('weddingItems', JSON.stringify(newItems));
                } else {
                    alert('Wedding name already exists!');
                }
            }
            setInputValue('');
        } else {
            alert('Please enter a valid wedding name (no spaces allowed)');
        }
    };

    const handleEditClick = (index) => {
        setInputValue(items[index]);
        setEditingIndex(index);
    };

    const handleDeleteClick = (weddingName) => {
        const isConfirmed = window.confirm(`Are you sure you want to delete "${weddingName}"?`);
        if (!isConfirmed) return;
        
        const newItems = items.filter(item => item !== weddingName);
        setItems(newItems);
        localStorage.setItem('weddingItems', JSON.stringify(newItems));
        
        // Remove the wedding arrangement data from localStorage
        const arrangementKey = `weddingArrangement-${weddingName}`;
        localStorage.removeItem(arrangementKey);
    };

    const handleRedirect = (name) => {
        navigate(`/wedding/${name}`);
    };

    const handleJSONImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                // Validate JSON structure
                if (!jsonData.weddingName) {
                    alert('Invalid JSON format. Missing wedding name.');
                    return;
                }

                const weddingName = jsonData.weddingName;
                
                // Check if wedding already exists
                if (items.includes(weddingName)) {
                    const overwrite = window.confirm(`Wedding "${weddingName}" already exists. Do you want to overwrite it?`);
                    if (!overwrite) {
                        return;
                    }
                } else {
                    // Add to wedding list if it doesn't exist
                    const newItems = [...items, weddingName];
                    setItems(newItems);
                    localStorage.setItem('weddingItems', JSON.stringify(newItems));
                }

                // Store the complete arrangement data
                const storageKey = `weddingArrangement-${weddingName}`;
                const arrangementData = {
                    savedGuestList: jsonData.guestList || [],
                    savedTables: jsonData.tables ? jsonData.tables.map(table => table.guests || []) : [],
                };
                localStorage.setItem(storageKey, JSON.stringify(arrangementData));

                alert(`Wedding "${weddingName}" imported successfully!`);
                
                // Navigate to the imported wedding
                navigate(`/wedding/${weddingName}`);

            } catch (error) {
                alert('Error parsing JSON file. Please ensure it\'s a valid wedding arrangement file.');
                console.error('JSON parse error:', error);
            }
        };
        reader.readAsText(file);
        
        // Reset the input so the same file can be imported again
        event.target.value = '';
    };

    const handleCSVImportClick = () => {
        setCsvModalOpen(true);
    };

    const handleCSVFileSelect = (event) => {
        const file = event.target.files[0];
        setCsvFile(file);
        // Reset the input so the same file can be selected again
        event.target.value = '';
    };

    const processCsvFile = (file) => {
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
                    }).filter(guest => guest.firstName && guest.lastName);
                    
                    console.log('Processed guests:', guests);
                    resolve(guests);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    };

    const handleCSVImport = async () => {
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
            const guests = await processCsvFile(csvFile);
            
            if (guests.length === 0) {
                alert('No valid guests found in CSV. Please check the format:\nfirstName,lastName,group,id');
                return;
            }
            
            // Check if wedding already exists
            if (items.includes(trimmedName)) {
                const overwrite = window.confirm(`Wedding "${trimmedName}" already exists. Do you want to overwrite it?`);
                if (!overwrite) {
                    return;
                }
            } else {
                // Add to wedding list if it doesn't exist
                const newItems = [...items, trimmedName];
                setItems(newItems);
                localStorage.setItem('weddingItems', JSON.stringify(newItems));
            }
            
            // Store the arrangement data with imported guests
            const storageKey = `weddingArrangement-${trimmedName}`;
            const arrangementData = {
                savedGuestList: guests,
                savedTables: [],
                savedTableAliases: {},
                savedTableSizes: {},
                savedTableNumbers: {}
            };
            localStorage.setItem(storageKey, JSON.stringify(arrangementData));
            
            alert(`Wedding "${trimmedName}" created with ${guests.length} guests imported successfully!`);
            
            // Reset modal state
            setCsvModalOpen(false);
            setCsvWeddingName('');
            setCsvFile(null);
            
            // Navigate to the new wedding
            navigate(`/wedding/${trimmedName}`);
            
        } catch (error) {
            console.error('Error processing CSV:', error);
            alert('Error processing CSV file. Please check the format.');
        }
    };

    const handleCSVModalClose = () => {
        setCsvModalOpen(false);
        setCsvWeddingName('');
        setCsvFile(null);
    };

    return (
        <div>
            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f5f5', padding: '10px 20px', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Hi {userName}!</div>
                <button onClick={() => auth.signoutRedirect()} style={{ padding: '8px 16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Log out</button>
            </div>
            <div className="inputWrapper">
                <TextField
                    id="standard-basic"
                    variant="standard"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter wedding name"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleAddClick();
                        }
                    }}
                />
                <Button variant="contained" onClick={handleAddClick}>
                    {editingIndex !== null ? 'Update' : 'Add'}
                </Button>
            </div>
            
            <div style={{ margin: '1rem 2rem' }}>
                <input
                    type="file"
                    accept=".json"
                    onChange={handleJSONImport}
                    style={{ display: 'none' }}
                    id="json-import-input"
                />
                <label htmlFor="json-import-input">
                    <Button variant="outlined" component="span" style={{ marginRight: '1rem' }}>
                        Import JSON File
                    </Button>
                </label>
                
                <Button variant="outlined" onClick={handleCSVImportClick}>
                    Import from CSV
                </Button>
            </div>

            <List className='list'>
                {items.map((item, index) => (
                    <ListItem key={index} className="listItem">
                        <ListItemText primary={item} className='listItemText' />
                        <div className="buttonGroup">
                            <Button onClick={() => handleRedirect(item)}>Open</Button>
                            <Button onClick={() => handleEditClick(index)}>Edit</Button>
                            <Button onClick={() => handleDeleteClick(item)}>Delete</Button>
                        </div>
                    </ListItem>
                ))}
            </List>
            <div className="footer">
                <p>How use it?</p>
                <p>1. Add a wedding name without spaces.</p>
                <p>2. Click "Open" to start arranging guests.</p>
                <p>3. Add guest with "Add Guests" button.</p>
                <p>4. Or import the guest via CSV file, you can find an example clicking in the <SettingsIcon style={{ fontSize: '16px', verticalAlign: 'middle', color: '#666' }} /> button.</p>
                <p>5. Share the arrangement exporting it to JSON file, you can find it in the <SettingsIcon style={{ fontSize: '16px', verticalAlign: 'middle', color: '#666' }} /> button.</p>
                <br></br>
                <p>If you already have a JSON file, just click in the "Import JSON file" button!</p>
            </div>
            
            {/* CSV Import Modal */}
            <Modal
                open={csvModalOpen}
                onClose={handleCSVModalClose}
                aria-labelledby="csv-import-modal-title"
                aria-describedby="csv-import-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="csv-import-modal-title" variant="h6" component="h2">
                        Import Wedding from CSV
                    </Typography>
                    <Typography id="csv-import-modal-description" sx={{ mt: 2, mb: 2 }}>
                        Enter a wedding name and select a CSV file with guest data.
                    </Typography>
                    
                    <TextField
                        fullWidth
                        label="Wedding Name"
                        value={csvWeddingName}
                        onChange={(e) => setCsvWeddingName(e.target.value)}
                        placeholder="Enter wedding name (no spaces)"
                        sx={{ mb: 2 }}
                    />
                    
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVFileSelect}
                        style={{ display: 'none' }}
                        id="csv-file-input"
                    />
                    <label htmlFor="csv-file-input">
                        <Button variant="outlined" component="span" fullWidth sx={{ mb: 2 }}>
                            {csvFile ? csvFile.name : 'Select CSV File'}
                        </Button>
                    </label>
                    
                    <Typography variant="caption" display="block" sx={{ mb: 2, color: 'text.secondary' }}>
                        CSV format: firstName,lastName,group,id
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={handleCSVModalClose}>
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            onClick={handleCSVImport}
                            disabled={!csvWeddingName.trim() || !csvFile}
                        >
                            Import
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}

export default EditableList;
