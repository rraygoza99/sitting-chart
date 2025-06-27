import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import "./EditableList.css";
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';


function EditableList() {
    const [inputEnabled, setInputEnabled] = useState(false);
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
            if (trimmed && !trimmed.includes(' ')) {                if (editingIndex !== null) {
                    const newItems = [...items];
                    newItems[editingIndex] = trimmed;
                    setItems(newItems);
                    localStorage.setItem('weddingItems', JSON.stringify(newItems));
                    setEditingIndex(null);
                } else {
                    const newItems = [...items, trimmed];
                    setItems(newItems);
                    localStorage.setItem('weddingItems', JSON.stringify(newItems));
                }
                setInputValue('');
                setInputEnabled(false);
            } else {
                alert('El nombre no debe tener espacios.');
            }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            
        }
    };    const handleDelete = (index, event) => {
        event.stopPropagation(); // Prevent event bubbling to parent ListItem
        const newItems = [...items];
        const weddingName = items[index]; // Get the wedding name before removing it
        newItems.splice(index, 1);
        setItems(newItems);
        localStorage.setItem('weddingItems', JSON.stringify(newItems));
        
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
                    throw new Error('Invalid JSON format. Missing wedding name.');
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

                alert(`Successfully imported wedding arrangement: "${weddingName}" with ${jsonData.totalGuests || 0} guests!`);
                
                // Navigate to the imported wedding
                navigate(`/wedding/${weddingName}`);

            } catch (error) {
                console.error('Error importing JSON:', error);
                alert('Error importing JSON file. Please check the file format.');
            }
        };
        reader.readAsText(file);
        
        // Reset the input so the same file can be imported again
        event.target.value = '';
    };
    

    return (
        <div>        <div className="inputWrapper">
            <TextField
                id="standard-basic"
                variant="standard"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ingrese un nombre sin espacios"
                style={{ minWidth: '250px' }}
            />

            <Button
                variant="outlined"
                onClick={handleAddClick}
            >
                Añadir
            </Button>
        </div>
        
        <div style={{ margin: '1rem 2rem' }}>
            <input
                type="file"
                accept=".json"
                id="jsonImporter"
                style={{ display: 'none' }}
                onChange={handleJSONImport}
            />
            <Button
                variant="contained"
                color="secondary"
                className='import-button'
                onClick={() => document.getElementById('jsonImporter').click()}
                style={{ marginBottom: '10px' }}
            >
                Import Wedding from JSON
            </Button>
        </div>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {items.map((item, index) => (
                    <ListItem
                        key={index}
                        onClick={() => handleRedirect(item)}
                        className="wedding-item flex items-center justify-between bg-gray-100 px-3 py-2 rounded cursor-pointer hover:bg-gray-200"                        secondaryAction={
                            <Button
                                variant="contained"
                                color='primary'
                                onClick={(e) => handleDelete(index, e)}
                                className="add-wedding-btn">Eliminar</Button>
                        }
                    >
                        <ListItemText
                            primary={item}/>
                    </ListItem>
                ))}
        </List>
        </div>     
    );
}

export default EditableList;