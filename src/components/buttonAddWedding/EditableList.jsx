import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import SettingsIcon from '@mui/icons-material/Settings';
import "./EditableList.css";
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';

function EditableList() {
    const [inputValue, setInputValue] = useState('');
    const [items, setItems] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
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

    return (
        <div>
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
                    <Button variant="outlined" component="span">
                        Import JSON File
                    </Button>
                </label>
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
        </div>
    );
}

export default EditableList;
