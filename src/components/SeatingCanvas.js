import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import ExposurePlus1Icon from '@mui/icons-material/Exposure';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CSVImporter from './CSVImporter';
import './SeatingCanvas.css';

function SeatingCanvas({ guests = [] }) {
    const { name: weddingId } = useParams();
    const [tables, setTables] = useState([]);
    const [guestList, setGuestList] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'visual'
    const [isGrouped, setIsGrouped] = useState(true);
    const [selectedGuests, setSelectedGuests] = useState(new Set());
    const [alertMessage, setAlertMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [isDragOverGuestList, setIsDragOverGuestList] = useState(false);

    const handleCloseAlert = () => setAlertOpen(false);
    const getStorageKey = useCallback(() => `weddingArrangement-${weddingId || 'default'}`, [weddingId]);    useEffect(() => {
        const storageKey = `weddingArrangement-${weddingId || 'default'}`;
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const { savedGuestList, savedTables } = JSON.parse(savedData);
                setGuestList(savedGuestList || []);
                setTables(savedTables || []);
            } catch (error) {
                console.error('Error parsing saved data:', error);
                setGuestList([]);
                setTables([]);
            }
        } else {
            const initialGuestList = guests.map((guest, index) => ({
                ...guest,
                id: guest.id || `guest-${Date.now()}-${index}`,
            }));
            setGuestList(initialGuestList);
            const totalGuests = guests.length;
            const requiredTables = Math.ceil(Math.max(totalGuests, 1) / 10);
            setTables(Array(requiredTables).fill([]));        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weddingId]);
    useEffect(() => {
        if (guests.length > 0 && guestList.length === 0) {
            const initialGuestList = guests.map((guest, index) => ({
                ...guest,
                id: guest.id || `guest-${Date.now()}-${index}`,
            }));
            setGuestList(initialGuestList);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateTables = (guestListLength) => {
        const totalGuests = guestListLength + tables.flat().length;
        const requiredTables = Math.ceil(totalGuests / 10);
        if (requiredTables > tables.length) {
            setTables(prevTables => [...prevTables, ...Array(requiredTables - prevTables.length).fill([])]);
        }
    };    const handleCSVImport = (importedGuests) => {
        const newGuests = importedGuests.map((guest, index) => ({
            ...guest,
            id: guest.id || `imported-guest-${Date.now()}-${index}`,
        }));
        
        setGuestList(prevGuestList => {
            const filteredNewGuests = newGuests.filter(newGuest => 
                !prevGuestList.some(existing => existing.id === newGuest.id)
            );
            return [...prevGuestList, ...filteredNewGuests];
        });

        updateTables(guestList.length + newGuests.length);
        
        setAlertMessage(`Successfully imported ${newGuests.length} guests!`);
        setAlertSeverity('success');
        setAlertOpen(true);
    };

const saveArrangement = async () => {
        const dataToSave = {
            savedGuestList: guestList,
            savedTables: tables,
        };
        localStorage.setItem(getStorageKey(), JSON.stringify(dataToSave));
        
        setAlertMessage('Arrangement saved successfully!');
        setAlertSeverity('success');
        setAlertOpen(true);
    };const deleteArrangement = () => {
        localStorage.removeItem(getStorageKey());
        const initialGuestList = guests.map((guest, index) => ({ ...guest, id: `guest-${index}` }));
        setGuestList(initialGuestList.sort((a, b) => a.firstName.localeCompare(b.firstName)));
        const totalGuests = guests.length;
        const requiredTables = Math.ceil(totalGuests / 10);
        setTables(Array(requiredTables).fill([])); // Reset tables state
        setAlertMessage('Arrangement deleted successfully!');
        setAlertSeverity('warning');
        setAlertOpen(true);
    };    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Wedding Seating Arrangement', 10, 10);

        const allGuests = [];
        tables.forEach((table, tableIndex) => {
            table.forEach((guest) => {
                allGuests.push({
                    ...guest,
                    tableNumber: tableIndex + 1
                });
            });
        });

        allGuests.sort((a, b) => {
            const lastNameA = (a.lastName || '').toLowerCase();
            const lastNameB = (b.lastName || '').toLowerCase();
            return lastNameA.localeCompare(lastNameB);
        });

        let currentY = 30;
        const pageHeight = 280;
        const rowHeight = 8;
        const columnWidths = [60, 60, 30];

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Last Name', 10, currentY);
        doc.text('First Name', 10 + columnWidths[0], currentY);
        doc.text('Table #', 10 + columnWidths[0] + columnWidths[1], currentY);
        
        doc.line(10, currentY + 2, 10 + columnWidths[0] + columnWidths[1] + columnWidths[2], currentY + 2);
        currentY += 10;

        doc.setFont(undefined, 'normal');
        allGuests.forEach((guest) => {
            if (currentY + rowHeight > pageHeight) {
                doc.addPage();
                currentY = 20;
                
                doc.setFont(undefined, 'bold');
                doc.text('Last Name', 10, currentY);
                doc.text('First Name', 10 + columnWidths[0], currentY);
                doc.text('Table #', 10 + columnWidths[0] + columnWidths[1], currentY);
                doc.line(10, currentY + 2, 10 + columnWidths[0] + columnWidths[1] + columnWidths[2], currentY + 2);
                currentY += 10;
                doc.setFont(undefined, 'normal');
            }

            doc.text(guest.lastName || '', 10, currentY);
            doc.text(guest.firstName || '', 10 + columnWidths[0], currentY);
            doc.text(guest.tableNumber.toString(), 10 + columnWidths[0] + columnWidths[1], currentY);
            currentY += rowHeight;
        });

        doc.save('Wedding_Seating_Arrangement.pdf');
    };

    const exportToJSON = () => {
        const arrangementData = {
            weddingName: weddingId,
            exportDate: new Date().toISOString(),
            totalGuests: guestList.length,
            totalTables: tables.length,
            guestList: guestList,
            tables: tables.map((table, index) => ({
                tableNumber: index + 1,
                seatedGuests: table.length,
                maxCapacity: 10,
                guests: table
            })),
            metadata: {
                viewMode: viewMode,
                isGrouped: isGrouped,
                version: "1.0"
            }
        };

        const dataStr = JSON.stringify(arrangementData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${weddingId || 'wedding'}_seating_arrangement.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setAlertMessage('Arrangement exported to JSON successfully!');
        setAlertSeverity('success');
        setAlertOpen(true);
    };

    const downloadSampleCSV = () => {
        // Create sample CSV data with the expected format: Firstname,Lastname,Group,ID
        const sampleData = [
            'John,Doe,Family,1',
            'Jane,Doe,Family,2',
            'Mike,Smith,Friends,3',
            'Sarah,Johnson,Friends,4',
            'Robert,Williams,Colleagues,5',
            'Emily,Brown,Colleagues,6',
            'David,Jones,Family,7',
            'Lisa,Garcia,Friends,8'
        ];

        const csvContent = sampleData.join('\n');
        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample_guest_list.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setAlertMessage('Sample CSV downloaded successfully!');
        setAlertSeverity('info');
        setAlertOpen(true);
    };

    const toggleViewMode = () => {
        setViewMode(prevMode => (prevMode === 'list' ? 'visual' : 'list'));
    };    const handleDrop = (guest, tableIndex) => {
        const fromTableIndex = parseInt(guest.fromTableIndex, 10);
        
        if (fromTableIndex === tableIndex) {
            return;
        }
        
        const isMultiDrag = guest.isMultiDrag;
        const guestsToMove = isMultiDrag ? guest.selectedGuests : [guest];
        
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            
            guestsToMove.forEach(guestToMove => {
                const guestFromTableIndex = parseInt(guestToMove.fromTableIndex, 10);
                
                if (!isNaN(guestFromTableIndex) && guestFromTableIndex !== tableIndex) {
                    updatedTables[guestFromTableIndex] = updatedTables[guestFromTableIndex].filter(
                        assigned => assigned.id !== guestToMove.id
                    );
                }
                updatedTables[tableIndex] = [...updatedTables[tableIndex], guestToMove];
            });
            
            return updatedTables;
        });

        setGuestList(prevGuestList => {
            let updatedGuestList = [...prevGuestList];
            
            guestsToMove.forEach(guestToMove => {
                const guestFromTableIndex = parseInt(guestToMove.fromTableIndex, 10);
                if (isNaN(guestFromTableIndex)) {
                    updatedGuestList = updatedGuestList.filter(unassigned => unassigned.id !== guestToMove.id);
                }
            });
            
            return updatedGuestList;
        });

        if (isMultiDrag) {
            setSelectedGuests(new Set());
        }
    };

    // Handle dropping guests back to the guest list (unassign them)
    const handleDropToGuestList = (guest) => {
        const fromTableIndex = parseInt(guest.fromTableIndex, 10);
        
        // Only process if the guest is coming from a table
        if (!isNaN(fromTableIndex)) {
            const isMultiDrag = guest.isMultiDrag;
            const guestsToMove = isMultiDrag ? guest.selectedGuests : [guest];
            
            // Remove from tables and add back to guest list
            setTables(prevTables => {
                const updatedTables = [...prevTables];
                
                guestsToMove.forEach(guestToMove => {
                    const guestFromTableIndex = parseInt(guestToMove.fromTableIndex, 10);
                    if (!isNaN(guestFromTableIndex)) {
                        updatedTables[guestFromTableIndex] = updatedTables[guestFromTableIndex].filter(
                            assigned => assigned.id !== guestToMove.id
                        );
                    }
                });
                
                return updatedTables;
            });

            setGuestList(prevGuestList => {
                const updatedGuestList = [...prevGuestList];
                
                guestsToMove.forEach(guestToMove => {
                    // Remove the fromTableIndex property before adding back to guest list
                    const { fromTableIndex, ...cleanGuest } = guestToMove;
                    updatedGuestList.push(cleanGuest);
                });
                
                return updatedGuestList;
            });

            if (isMultiDrag) {
                setSelectedGuests(new Set());
            }
        }
    };

    const handleRemove = (guest, tableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[tableIndex] = updatedTables[tableIndex].filter(assigned => assigned.id !== guest.id);
            return updatedTables;
        });

        setGuestList(prevGuestList => [...prevGuestList, guest]);
    };

    // Clear all guests from a specific table
    const handleClearTable = (tableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            const guestsToMove = updatedTables[tableIndex];
            
            // Clear the table
            updatedTables[tableIndex] = [];
            
            // Add all guests back to guest list
            setGuestList(prevGuestList => [...prevGuestList, ...guestsToMove]);
            
            return updatedTables;
        });
    };

    /*const handleReassign = (guest, fromTableIndex, toTableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[fromTableIndex] = updatedTables[fromTableIndex].filter(assigned => assigned.id !== guest.id);
            updatedTables[toTableIndex] = [...updatedTables[toTableIndex], guest];
            return updatedTables;
        });
    };*/
    const getTotalTickets=(guestId)=>{
        return guestList.filter(guest => guest.originalGuestId === guestId).length + 1; // +1 for the original guest
    };

    // Check if a guest ID can be used for adding +1 guests
    const canAddPlusOne = (guestId) => {
        const idStr = String(guestId);
        // If it's just a number, allow it
        if (!isNaN(parseInt(idStr, 10)) && isFinite(idStr)) {
            return true;
        }

        return false;
    };
    const handleAddPlusOne = (guest) => {
        
        setGuestList(prevGuestList => [
            ...prevGuestList,
            {
                firstName: `${guest.firstName}`,
                lastName: `${guest.lastName} +1`,
                group: guest.group,
                originalGuestId: guest.id,
                id: `${guest.id}-${getTotalTickets(guest.id)+1}`, // Unique ID based on original guest ID and count of tickets
            },
        ]);
        updateTables(guestList.length + 1);
    };

    const handleSelectGuest = (guestId) => {
        setSelectedGuests(prevSelected => {
            const updatedSelected = new Set(prevSelected);
            if (updatedSelected.has(guestId)) {
                updatedSelected.delete(guestId);
            } else {
                updatedSelected.add(guestId);
            }
            return updatedSelected;
        });
    };

    const removeSelectedGuests = () => {
        setGuestList(prevGuestList =>
            prevGuestList.filter(guest => !selectedGuests.has(guest.id))
        );
        setSelectedGuests(new Set());
        setContextMenu({ visible: false, x: 0, y: 0 }); // Hide context menu
    };

    const handleContextMenu = (e) => {
        if (selectedGuests.size > 1) {
            e.preventDefault();
            setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY
            });
        }
    };

    const hideContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0 });
    };

    const openEditModal = (guestId, currentFirstName, currentLastName = '') => {
        setEditingGuest(guestId);
        setEditFirstName(currentFirstName.replace(' +1', ''));
        setEditLastName(currentLastName);
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingGuest(null);
        setEditFirstName('');
        setEditLastName('');
    };

    const saveGuestEdit = () => {
        if (!editingGuest || !editFirstName.trim()) return;

        setGuestList(prevGuestList =>
            prevGuestList.map(guest =>
                guest.id === editingGuest
                    ? { ...guest, firstName: editFirstName.trim(), lastName: editLastName.trim() }
                    : guest
            )
        );

        setTables(prevTables =>
            prevTables.map(table =>
                table.map(guest =>
                    guest.id === editingGuest
                        ? { ...guest, firstName: editFirstName.trim(), lastName: editLastName.trim() }
                        : guest
                )
            )
        );

        closeEditModal();
    };

    const renderListView = () => (
        <div

            className='tables-container'
        >
            {tables.map((table, tableIndex) => (
                <div
                    key={tableIndex}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        const guest = JSON.parse(e.dataTransfer.getData('guest'));
                        handleDrop(guest, tableIndex);
                    }}
                    className='single-table'
                >
                    <h3 style={{ marginBottom: '10px' }}>
                        Table {tableIndex + 1} ({table.length}/10) {/* Counter for assigned seats */}
                        {table.length > 0 && (
                            <IconButton
                                onClick={() => handleClearTable(tableIndex)}
                                color="error"
                                size="small"
                                title="Clear all guests from this table"
                                style={{ marginLeft: '10px' }}
                            >
                                <Icon>delete</Icon>
                            </IconButton>
                        )}
                    </h3>
                    {table.map((guest) => (
                        <div
                            key={guest.id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData(
                                    'guest',
                                    JSON.stringify({ ...guest, fromTableIndex: tableIndex }) // Include original table index
                                );
                            }}
                            className='table-guest-item'
                        >
                            <span>
                                {guest.firstName} {guest.lastName}
                            </span>
                            <div style={{ marginLeft: '10px', display: 'flex', gap: '5px' }}>
                                {/* Edit button for all guests */}
                                <IconButton
                                    onClick={() => openEditModal(guest.id, guest.firstName, guest.lastName)}
                                    color="primary"
                                    size="small"
                                    title="Edit guest name"
                                >
                                    <Icon>edit</Icon>
                                </IconButton>
                                <IconButton
                                    onClick={() => handleRemove(guest, tableIndex)}
                                    color="error"
                                    size="small"
                                    title="Remove from table"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    const renderVisualView = () => (
        <div
            className='visual-tables-container'
        >
            {tables.map((table, tableIndex) => (
                <div
                    key={tableIndex}
                    onDragOver={(e) => e.preventDefault()}                    onDrop={(e) => {
                        const guest = JSON.parse(e.dataTransfer.getData('guest'));
                        handleDrop(guest, tableIndex);
                    }}
                    className='visual-table-border'
                >
                    <span
                        className='visual-table-title'
                    >
                        Table {tableIndex + 1} ({table.length}/10)
                        {table.length > 0 && (
                            <IconButton
                                onClick={() => handleClearTable(tableIndex)}
                                color="error"
                                size="small"
                                title="Clear all guests from this table"
                                style={{ marginLeft: '5px' }}
                            >
                                <Icon>clear_all</Icon>
                            </IconButton>
                        )}
                    </span>
                    {table.map((guest, index) => {
                        const angle = (index / 10) * 2 * Math.PI; // Divide the circle into 10 equal parts
                        const radius = 120; // Distance from the center
                        const x = 150 + radius * Math.cos(angle)-30; // Calculate x position
                        const y = 150 + radius * Math.sin(angle)-30; // Calculate y position
                        return (
                            <div
                                key={guest.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                        'guest',
                                        JSON.stringify({ ...guest, fromTableIndex: tableIndex }) // Include original table index
                                    );
                                }}
                                onDoubleClick={() => {
                                    // Double-click to edit any guest
                                    openEditModal(guest.id, guest.firstName, guest.lastName);
                                }}
                                className='visual-table-guest-item'
                                style={{
                                    position: 'absolute',
                                    top: `${y}px`,
                                    left: `${x}px`,
                                    
                                }}
                            >
                                {guest.firstName} {guest.lastName}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );

    const renderGuestList = () => {
        if (isGrouped) {
            const groupedGuests = guestList.reduce((groups, guest) => {
                const group = guest.group || 'Ungrouped';
                if (!groups[group]) groups[group] = [];
                groups[group].push(guest);
                return groups;
            }, {});

            const sortedGroups = Object.keys(groupedGuests).sort();
            for(var group of sortedGroups) {
                groupedGuests[group].sort((a, b) => {
                    const getGuestOrder = (guest) => {
                    if (guest.originalGuestId) {
                        const parts = guest.id.split('-');
                        const sequenceNum = parseInt(parts[parts.length - 1], 10) || 0;
                        return `${guest.originalGuestId}-${sequenceNum.toString().padStart(3, '0')}`;
                    } else {
                        return `${guest.id}-000`;
                    }
                };
        
                return getGuestOrder(a).localeCompare(getGuestOrder(b));
            });
            }
            console.log('Grouped Guests:', groupedGuests);
            return sortedGroups.map(groupName => (
                <div key={groupName} style={{ marginBottom: '20px' }}>
                    <h3>{groupName}</h3>
                    {groupedGuests[groupName]
                        //.filter(guest => !guest.originalGuestId) // Exclude "+1" guests from main list
                        .map((guest) => (
                            <div key={guest.id}>
                                {/* Original guest */}
                                <div
                                    draggable
                                    onDragStart={(e) => {
                                        // Check if this guest is selected and if there are multiple selected guests
                                        const isSelected = selectedGuests.has(guest.id);
                                        const hasMultipleSelected = selectedGuests.size > 1;
                                        
                                        if (isSelected && hasMultipleSelected) {
                                            // Multi-guest drag: get all selected guests
                                            const selectedGuestsList = guestList.filter(g => selectedGuests.has(g.id));
                                            e.dataTransfer.setData('guest', JSON.stringify({
                                                isMultiDrag: true,
                                                selectedGuests: selectedGuestsList,
                                                id: 'multi-drag', // Placeholder ID for multi-drag
                                                firstName: `${selectedGuests.size} guests`,
                                                lastName: ''
                                            }));
                                        } else {
                                            // Single guest drag
                                            e.dataTransfer.setData('guest', JSON.stringify(guest));
                                        }
                                    }}
                                    onContextMenu={handleContextMenu}
                                    className={`guest-item ${selectedGuests.has(guest.id) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedGuests.has(guest.id)}
                                        onChange={() => handleSelectGuest(guest.id)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <span>
                                        {guest.firstName} {guest.lastName}
                                    </span>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {canAddPlusOne(guest.id) && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleAddPlusOne(guest)}
                                                style={{ marginLeft: '10px' }}
                                                className='save-button'
                                            >
                                                <Icon>exposure_plus_1</Icon>
                                            </Button>
                                        )}
                                        <IconButton
                                            onClick={() => openEditModal(guest.id, guest.firstName, guest.lastName)}
                                            color="primary"
                                            size="small"
                                            title="Edit guest name"
                                        >
                                            <Icon>edit</Icon>
                                        </IconButton>
                                        
                                    </div>
                                </div>
                                {/* "+1" guests */}
                           
                            </div>
                        ))}
                </div>
            ));
        } else {

            return guestList
                .sort((a, b) => {
                    const getGuestOrder = (guest) => {
                        if (guest.originalGuestId) {
                            const parts = guest.id.split('-');
                            const sequenceNum = parseInt(parts[parts.length - 1], 10) || 0;
                            return `${guest.originalGuestId}-${sequenceNum.toString().padStart(3, '0')}`;
                        } else {
                            return `${guest.id}-000`;
                        }
                    }
                    return getGuestOrder(a).localeCompare(getGuestOrder(b));
                })
                //.filter(guest => !guest.originalGuestId) // Exclude "+1" guests from main list
                .map((guest) => (
                    <div key={guest.id}>
                        {/* Original guest */}
                        <div
                            draggable
                            onDragStart={(e) => {
                                // Check if this guest is selected and if there are multiple selected guests
                                const isSelected = selectedGuests.has(guest.id);
                                const hasMultipleSelected = selectedGuests.size > 1;
                                
                                if (isSelected && hasMultipleSelected) {
                                    // Multi-guest drag: get all selected guests
                                    const selectedGuestsList = guestList.filter(g => selectedGuests.has(g.id));
                                    e.dataTransfer.setData('guest', JSON.stringify({
                                        isMultiDrag: true,
                                        selectedGuests: selectedGuestsList,
                                        id: 'multi-drag', // Placeholder ID for multi-drag
                                        firstName: `${selectedGuests.size} guests`,
                                        lastName: ''
                                    }));
                                } else {
                                    // Single guest drag
                                    e.dataTransfer.setData('guest', JSON.stringify(guest));
                                }
                            }}
                            onContextMenu={handleContextMenu}
                            className={`guest-item ${selectedGuests.has(guest.id) ? 'selected' : ''}`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedGuests.has(guest.id)}
                                onChange={() => handleSelectGuest(guest.id)}
                                style={{ marginRight: '10px' }}
                            />
                            <span>
                                {guest.firstName} {guest.lastName}
                            </span>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <IconButton
                                    onClick={() => openEditModal(guest.id, guest.firstName, guest.lastName)}
                                    color="primary"
                                    size="small"
                                    title="Edit guest name"
                                >
                                    <Icon>edit</Icon>
                                </IconButton>
                                {canAddPlusOne(guest.id) && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleAddPlusOne(guest)}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        <ExposurePlus1Icon />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ));
        }
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <div style={{ display: 'flex' }} onClick={hideContextMenu}>
            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                        minWidth: '150px'
                    }}
                >
                    <div
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedGuests();
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                        Delete Selected Guests ({selectedGuests.size})
                    </div>
                </div>
            )}
            {/* Edit Guest Modal */}
            <Modal
                open={editModalOpen}
                onClose={closeEditModal}
                aria-labelledby="edit-guest-modal-title"
                aria-describedby="edit-guest-modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="edit-guest-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                        Edit Guest Information
                    </Typography>
                    <TextField
                        fullWidth
                        label="First Name"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Last Name"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={closeEditModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={saveGuestEdit}
                            disabled={!editFirstName.trim()}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar open={alertOpen} autoHideDuration={3000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={alertSeverity}>
                    {alertMessage}
                </Alert>
            </Snackbar>            
            <div className="guestList"
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverGuestList(true);
                }}
                onDragLeave={(e) => {
                    // Only hide if we're leaving the guest list container entirely
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsDragOverGuestList(false);
                    }
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    const guest = JSON.parse(e.dataTransfer.getData('guest'));
                    handleDropToGuestList(guest);
                    setIsDragOverGuestList(false);
                }}
                style={{
                    backgroundColor: isDragOverGuestList ? '#e8f5e8' : 'transparent',
                    border: isDragOverGuestList ? '2px dashed #4caf50' : '2px dashed transparent',
                    borderRadius: '8px',
                    padding: '10px',
                    transition: 'all 0.2s ease'
                }}
            >
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={saveArrangement}
                        className='save-button'
                        style={{ marginBottom: '10px', marginRight: '10px' }}
                    >
                        Save Arrangement
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={deleteArrangement}
                        className='delete-button'
                        style={{ marginBottom: '10px' }}
                    >
                        Delete Arrangement
                    </Button>
                </div>                <div>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={exportToPDF}
                        className='export-button'
                        style={{ marginBottom: '10px', marginRight: '10px' }}
                    >
                        Export to PDF
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={exportToJSON}
                        className='export-button'
                        style={{ marginBottom: '10px', marginRight: '10px' }}
                    >
                        Export to JSON
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={toggleViewMode}
                        className='switch-button'
                        style={{ marginBottom: '10px' }}
                    >
                        Switch to {viewMode === 'list' ? 'Visual View' : 'List View'}
                    </Button>
                </div>
                
                <div>
                    <CSVImporter onImport={handleCSVImport} />
                    <Button
                        variant="outlined"
                        color="info"
                        onClick={downloadSampleCSV}
                        style={{ marginTop: '10px', marginLeft: '10px' }}
                        className='download-sample-button'
                    >
                        📄 Download Sample CSV
                    </Button>
                </div>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    <input
                        type="checkbox"
                        checked={isGrouped}
                        onChange={(e) => setIsGrouped(e.target.checked)}
                        style={{ marginRight: '5px' }}
                    />
                    Group Guests
                </label>
                <Button
                    variant="contained"
                    color="error"
                    onClick={removeSelectedGuests}
                    className='delete-button'
                    style={{ marginBottom: '10px' }}
                >
                    Remove Selected Guests
                </Button>
                <h2>Guest List</h2>
                {isDragOverGuestList && (
                    <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#c8e6c9',
                        border: '1px solid #4caf50',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        fontSize: '14px',
                        color: '#2e7d32',
                        textAlign: 'center'
                    }}>
                        🔄 Drop here to unassign from table
                    </div>
                )}
                <p>Total Guests: {guestList.length}</p>
                {selectedGuests.size > 1 && (
                    <div style={{ 
                        padding: '8px 12px', 
                        backgroundColor: '#e3f2fd', 
                        border: '1px solid #2196f3', 
                        borderRadius: '4px', 
                        marginBottom: '10px',
                        fontSize: '14px',
                        color: '#1976d2'
                    }}>
                        <strong>{selectedGuests.size} guests selected</strong> - Drag any selected guest to move all together
                    </div>
                )}
                {renderGuestList()}
            </div>
            {viewMode === 'list' ? renderListView() : renderVisualView()}
        </div>
    );
}

export default SeatingCanvas;


