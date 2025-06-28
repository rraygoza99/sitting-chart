import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Button from '@mui/material/Button'; // Import Material-UI Button
import Alert from '@mui/material/Alert'; // Import Material-UI Alert
import Snackbar from '@mui/material/Snackbar'; // Import Material-UI Snackbar
import ExposurePlus1Icon from '@mui/icons-material/Exposure'; // Import Material-UI ExposurePlus1 icon
import Icon from '@mui/material/Icon'; // Import Material-UI Icon
import IconButton from '@mui/material/IconButton'; // Import Material-UI IconButton
import CloseIcon from '@mui/icons-material/Close'; // Import Material-UI Close icon
import Modal from '@mui/material/Modal'; // Import Material-UI Modal
import Box from '@mui/material/Box'; // Import Material-UI Box
import TextField from '@mui/material/TextField'; // Import Material-UI TextField
import Typography from '@mui/material/Typography'; // Import Material-UI Typography
import CSVImporter from './CSVImporter'; // Import CSVImporter component
import './SeatingCanvas.css'; // Import the CSS file

function SeatingCanvas({ guests = [] }) {
    const { name: weddingId } = useParams(); // Get wedding name from URL and use it as weddingId
    const [tables, setTables] = useState([]);
    const [guestList, setGuestList] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'visual'
    const [isGrouped, setIsGrouped] = useState(true); // Toggle for grouping
    const [selectedGuests, setSelectedGuests] = useState(new Set()); // Track selected guests
    const [alertMessage, setAlertMessage] = useState(''); // Alert message
    const [alertOpen, setAlertOpen] = useState(false); // Alert visibility
    const [alertSeverity, setAlertSeverity] = useState('success'); // Severity of the alert
    const [editModalOpen, setEditModalOpen] = useState(false); // Edit modal visibility
    const [editingGuest, setEditingGuest] = useState(null); // Guest being edited
    const [editFirstName, setEditFirstName] = useState(''); // First name in edit modal
    const [editLastName, setEditLastName] = useState(''); // Last name in edit modal

    const handleCloseAlert = () => setAlertOpen(false); // Close alert handler    // Generate the localStorage key based on wedding ID
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
                // If parsing fails, initialize with empty arrays
                setGuestList([]);
                setTables([]);
            }
        } else {
            // Only initialize with props guests if no saved data exists
            const initialGuestList = guests.map((guest, index) => ({
                ...guest,
                id: guest.id || `guest-${Date.now()}-${index}`,
            }));
            setGuestList(initialGuestList);
            const totalGuests = guests.length;
            const requiredTables = Math.ceil(Math.max(totalGuests, 1) / 10);
            setTables(Array(requiredTables).fill([]));        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weddingId]); // Only depend on weddingId to prevent infinite loops
      // Separate useEffect to handle initial guests loading (only run once)
    useEffect(() => {
        if (guests.length > 0 && guestList.length === 0) {
            const initialGuestList = guests.map((guest, index) => ({
                ...guest,
                id: guest.id || `guest-${Date.now()}-${index}`,
            }));
            setGuestList(initialGuestList);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once on mount

    const updateTables = (guestListLength) => {
        const totalGuests = guestListLength + tables.flat().length;
        const requiredTables = Math.ceil(totalGuests / 10);
        if (requiredTables > tables.length) {
            setTables(prevTables => [...prevTables, ...Array(requiredTables - prevTables.length).fill([])]);
        }
    };    const handleCSVImport = (importedGuests) => {
        const newGuests = importedGuests.map((guest, index) => ({
            ...guest,
            id: guest.id || `imported-guest-${Date.now()}-${index}`, // Ensure unique IDs
        }));
        
        setGuestList(prevGuestList => {
            // Filter out any duplicates based on ID
            const filteredNewGuests = newGuests.filter(newGuest => 
                !prevGuestList.some(existing => existing.id === newGuest.id)
            );
            return [...prevGuestList, ...filteredNewGuests];
        });

        // Update tables to accommodate new guests
        updateTables(guestList.length + newGuests.length);
        
        setAlertMessage(`Successfully imported ${newGuests.length} guests!`);
        setAlertSeverity('success');
        setAlertOpen(true);
    };const saveArrangement = () => {
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

        // Create a list of all guests with their table assignments
        const allGuests = [];
        tables.forEach((table, tableIndex) => {
            table.forEach((guest) => {
                allGuests.push({
                    ...guest,
                    tableNumber: tableIndex + 1
                });
            });
        });

        // Sort guests alphabetically by last name
        allGuests.sort((a, b) => {
            const lastNameA = (a.lastName || '').toLowerCase();
            const lastNameB = (b.lastName || '').toLowerCase();
            return lastNameA.localeCompare(lastNameB);
        });

        let currentY = 30; // Start Y position for content
        const pageHeight = 280; // Height of the page in the PDF
        const rowHeight = 8; // Height of each row
        const columnWidths = [60, 60, 30]; // Column widths: Last Name, First Name, Table #

        // Draw table headers
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Last Name', 10, currentY);
        doc.text('First Name', 10 + columnWidths[0], currentY);
        doc.text('Table #', 10 + columnWidths[0] + columnWidths[1], currentY);
        
        // Draw header underline
        doc.line(10, currentY + 2, 10 + columnWidths[0] + columnWidths[1] + columnWidths[2], currentY + 2);
        currentY += 10;

        // Draw guest data
        doc.setFont(undefined, 'normal');
        allGuests.forEach((guest) => {
            if (currentY + rowHeight > pageHeight) {
                doc.addPage(); // Add a new page if content exceeds the page height
                currentY = 20; // Reset Y position for the new page
                
                // Redraw headers on new page
                doc.setFont(undefined, 'bold');
                doc.text('Last Name', 10, currentY);
                doc.text('First Name', 10 + columnWidths[0], currentY);
                doc.text('Table #', 10 + columnWidths[0] + columnWidths[1], currentY);
                doc.line(10, currentY + 2, 10 + columnWidths[0] + columnWidths[1] + columnWidths[2], currentY + 2);
                currentY += 10;
                doc.setFont(undefined, 'normal');
            }

            // Draw guest data in columns
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

        // Create blob and download
        const dataStr = JSON.stringify(arrangementData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
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

    const toggleViewMode = () => {
        setViewMode(prevMode => (prevMode === 'list' ? 'visual' : 'list'));
    };    const handleDrop = (guest, tableIndex) => {
        const fromTableIndex = parseInt(guest.fromTableIndex, 10); // Extract the original table index
        
        // If dropping in the same table, do nothing to prevent duplication
        if (fromTableIndex === tableIndex) {
            return;
        }
        
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            if (!isNaN(fromTableIndex) && fromTableIndex !== tableIndex) {
                // Remove guest from the original table
                updatedTables[fromTableIndex] = updatedTables[fromTableIndex].filter(
                    assigned => assigned.id !== guest.id
                );
            }
            // Add guest to the new table
            updatedTables[tableIndex] = [...updatedTables[tableIndex], guest];
            return updatedTables;
        });

        // Remove guest from guestList (only if not moving between tables)
        if (isNaN(fromTableIndex)) {
            setGuestList(prevGuestList =>
                prevGuestList.filter(unassigned => unassigned.id !== guest.id)
            );
        }
    };

    const handleRemove = (guest, tableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[tableIndex] = updatedTables[tableIndex].filter(assigned => assigned.id !== guest.id);
            return updatedTables;
        });

        // Add guest back to guestList
        setGuestList(prevGuestList => [...prevGuestList, guest]);
    };

    /*const handleReassign = (guest, fromTableIndex, toTableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[fromTableIndex] = updatedTables[fromTableIndex].filter(assigned => assigned.id !== guest.id);
            updatedTables[toTableIndex] = [...updatedTables[toTableIndex], guest];
            return updatedTables;
        });
    };*/

    const handleAddPlusOne = (guest) => {
        setGuestList(prevGuestList => [
            ...prevGuestList,
            {
                firstName: `${guest.firstName} +1`,
                lastName: '', // Clear last name for "+1" guests
                group: guest.group,
                originalGuestId: guest.id, // Reference to the original guest
                id: `guest-${Date.now()}-${Math.random()}`, // Generate unique ID for each "+1"
            },
        ]);
        updateTables(guestList.length + 1); // Update tables to account for the new "+1" guest
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
        setSelectedGuests(new Set()); // Clear selected guests
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
                guest.id === editingGuest && guest.firstName.includes('+1')
                    ? { ...guest, firstName: editFirstName.trim(), lastName: editLastName.trim() }
                    : guest
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
                            <IconButton
                                onClick={() => handleRemove(guest, tableIndex)}
                                style={{ marginLeft: '10px' }}
                                color="error"
                                size="small"
                            >
                                <CloseIcon />
                            </IconButton>
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
                        const fromTableIndex = parseInt(guest.fromTableIndex, 10); // Extract the original table index
                        
                        // If dropping in the same table, do nothing to prevent duplication
                        if (fromTableIndex === tableIndex) {
                            return;
                        }
                        
                        setTables(prevTables => {
                            const updatedTables = [...prevTables];
                            if (!isNaN(fromTableIndex) && fromTableIndex !== tableIndex) {
                                // Remove guest from the original table
                                updatedTables[fromTableIndex] = updatedTables[fromTableIndex].filter(
                                    assigned => assigned.id !== guest.id
                                );
                            }
                            // Add guest to the new table
                            updatedTables[tableIndex] = [...updatedTables[tableIndex], guest];
                            return updatedTables;
                        });
                        
                        // Remove guest from guestList (only if not moving between tables)
                        if (isNaN(fromTableIndex)) {
                            setGuestList(prevGuestList =>
                                prevGuestList.filter(unassigned => unassigned.id !== guest.id)
                            );
                        }
                    }}
                    className='visual-table-border'
                >
                    <span
                        className='visual-table-title'
                    >
                        Table {tableIndex + 1} ({table.length}/10)
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
                                    setTables(prevTables => {
                                        const updatedTables = [...prevTables];
                                        updatedTables[tableIndex] = updatedTables[tableIndex].filter(
                                            assigned => assigned.id !== guest.id
                                        );
                                        return updatedTables;
                                    });
                                    setGuestList(prevGuestList => [...prevGuestList, guest]);
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

            const sortedGroups = Object.keys(groupedGuests).sort(); // Sort group names alphabetically

            return sortedGroups.map(groupName => (
                <div key={groupName} style={{ marginBottom: '20px' }}>
                    <h3>{groupName}</h3>
                    {groupedGuests[groupName]
                        .filter(guest => !guest.originalGuestId) // Exclude "+1" guests from main list
                        .map((guest) => (
                            <div key={guest.id}>
                                {/* Original guest */}
                                <div
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('guest', JSON.stringify(guest))}
                                    className='guest-item'
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
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleAddPlusOne(guest)}
                                        style={{ marginLeft: '10px' }}
                                        className='save-button'
                                    >
                                        <Icon>exposure_plus_1</Icon>
                                    </Button>
                                </div>
                                {/* "+1" guests */}
                                {guestList
                                    .filter(
                                        plusOne =>
                                            plusOne.originalGuestId === guest.id // Ensure "+1" guests are tied to their original guest
                                    )
                                    .map((plusOne) => (
                                        <div
                                            key={plusOne.id}
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData('guest', JSON.stringify(plusOne))}
                                            onDoubleClick={() => {
                                                openEditModal(plusOne.id, plusOne.firstName, plusOne.lastName);
                                            }}
                                            className='plus-one-label'
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedGuests.has(plusOne.id)}
                                                onChange={() => handleSelectGuest(plusOne.id)}
                                                style={{ marginRight: '10px' }}
                                            />
                                            <span>
                                                {plusOne.firstName} {plusOne.lastName}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        ))}
                </div>
            ));
        } else {
            return guestList
                .filter(guest => !guest.originalGuestId) // Exclude "+1" guests from main list
                .map((guest) => (
                    <div key={guest.id}>
                        {/* Original guest */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('guest', JSON.stringify(guest))}
                            className='guest-item'
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
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleAddPlusOne(guest)}
                                style={{ marginLeft: '10px' }}
                            >
                                <ExposurePlus1Icon />
                            </Button>
                        </div>
                        {/* "+1" guests */}
                        {guestList
                            .filter(
                                plusOne =>
                                    plusOne.originalGuestId === guest.id // Ensure "+1" guests are tied to their original guest
                            )
                            .map((plusOne) => (
                                <div
                                className="plus-one-label"
                                    key={plusOne.id}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('guest', JSON.stringify(plusOne))}
                                    onDoubleClick={() => {
                                        openEditModal(plusOne.id, plusOne.firstName, plusOne.lastName);
                                    }}
                                    
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedGuests.has(plusOne.id)}
                                        onChange={() => handleSelectGuest(plusOne.id)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <span>
                                        {plusOne.firstName} {plusOne.lastName}
                                    </span>
                                </div>
                            ))}
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
        <div style={{ display: 'flex' }}>
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
            </Snackbar>            <div className="guestList">
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
                </div>                <div>
                    <CSVImporter onImport={handleCSVImport} />
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
                <p>Total Guests: {guestList.length}</p>
                {renderGuestList()}
            </div>
            {viewMode === 'list' ? renderListView() : renderVisualView()}
        </div>
    );
}

export default SeatingCanvas;


