import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import "/AppSittingChart/sitting-chart/src/components/buttonAddWedding/button.css";

function EditableList() {
    const [inputEnabled, setInputEnabled] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [items, setItems] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const navigate = useNavigate();

    const handleAddClick = () => {
        setInputEnabled(true);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const trimmed = inputValue.trim();
            if (trimmed && !trimmed.includes(' ')) {
                if (editingIndex !== null) {
                    const newItems = [...items];
                    newItems[editingIndex] = trimmed;
                    setItems(newItems);
                    setEditingIndex(null);
                } else {
                    setItems([...items, trimmed]);
                }
                setInputValue('');
                setInputEnabled(false);
            } else {
                alert('El nombre no debe tener espacios.');
            }
        }
    };

    const handleDelete = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleEdit = (index) => {
        setInputEnabled(true);
        setInputValue(items[index]);
        setEditingIndex(index);
    };

    const handleRedirect = (name) => {
        navigate(`/${name}`);
    };

    return (
        <div>
        <div className="inputWrapper">

            <TextField
                id="standard-basic"
                variant="standard"
                disabled={!inputEnabled}
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

            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li
                        key={index}
                        className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded cursor-pointer hover:bg-gray-200"
                    >
                        <span onClick={() => handleRedirect(item)}>{item}</span>
                        <div className="space-x-2">
                            <Button
                                variant="outlined"
                                onClick={() => handleEdit(index)}
                                className="text-yellow-600 hover:underline">Editar</Button>
                            <Button
                                variant="contained"
                                onClick={() => handleDelete(index)}
                                className="text-red-600 hover:underline">Eliminar</Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>     
    );
}

export default EditableList;