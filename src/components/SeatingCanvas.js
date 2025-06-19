import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

function SeatingCanvas({ guests }) {
    const [tables, setTables] = useState([]);
    const [guestList, setGuestList] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'visual'
    const [isGrouped, setIsGrouped] = useState(true); // Toggle for grouping
    const [selectedGuests, setSelectedGuests] = useState(new Set()); // Track selected guests

    useEffect(() => {
        const savedData = localStorage.getItem('weddingArrangement');
        if (savedData) {
            const { savedGuestList, savedTables } = JSON.parse(savedData);
            setGuestList(savedGuestList);
            setTables(savedTables);
        } else {
            const initialGuestList = guests.map((guest, index) => ({
                ...guest,
                id: `guest-${Date.now()}-${index}`, // Ensure unique IDs for initial guests
            }));
            setGuestList(initialGuestList);
            const totalGuests = guests.length;
            const requiredTables = Math.ceil(totalGuests / 10);
            setTables(Array(requiredTables).fill([]));
        }
    }, [guests]);

    const updateTables = (guestListLength) => {
        const totalGuests = guestListLength + tables.flat().length;
        const requiredTables = Math.ceil(totalGuests / 10);
        if (requiredTables > tables.length) {
            setTables(prevTables => [...prevTables, ...Array(requiredTables - prevTables.length).fill([])]);
        }
    };

    const saveArrangement = () => {
        const dataToSave = {
            savedGuestList: guestList,
            savedTables: tables,
        };
        localStorage.setItem('weddingArrangement', JSON.stringify(dataToSave));
        alert('Arrangement saved successfully!');
    };

    const deleteArrangement = () => {
        localStorage.removeItem('weddingArrangement');
        const initialGuestList = guests.map((guest, index) => ({ ...guest, id: `guest-${index}` }));
        setGuestList(initialGuestList.sort((a, b) => a.firstName.localeCompare(b.firstName)));
        const totalGuests = guests.length;
        const requiredTables = Math.ceil(totalGuests / 10);
        setTables(Array(requiredTables).fill([]));
        alert('Arrangement deleted successfully!');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Wedding Seating Arrangement', 10, 10);

        let currentY = 20; // Start Y position for content
        const pageHeight = 280; // Height of the page in the PDF

        tables.forEach((table, index) => {
            if (currentY + 20 > pageHeight) {
                doc.addPage(); // Add a new page if content exceeds the page height
                currentY = 10; // Reset Y position for the new page
            }

            doc.setFontSize(14);
            doc.text(`Table ${index + 1}`, 10, currentY);
            currentY += 10;

            table.forEach((guest) => {
                if (currentY + 10 > pageHeight) {
                    doc.addPage(); // Add a new page if content exceeds the page height
                    currentY = 10; // Reset Y position for the new page
                }

                doc.setFontSize(12);
                doc.text(
                    `${guest.firstName} ${guest.lastName}`,
                    20,
                    currentY
                );
                currentY += 10;
            });

            currentY += 10; // Add spacing between tables
        });

        doc.save('Wedding_Seating_Arrangement.pdf');
    };

    const toggleViewMode = () => {
        setViewMode(prevMode => (prevMode === 'list' ? 'visual' : 'list'));
    };

    const handleDrop = (guest, tableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[tableIndex] = [...updatedTables[tableIndex], guest];
            return updatedTables;
        });

        setGuestList(prevGuestList =>
            prevGuestList.filter(unassigned => unassigned.id !== guest.id)
        );
    };

    const handleRemove = (guest, tableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[tableIndex] = updatedTables[tableIndex].filter(assigned => assigned.id !== guest.id);
            return updatedTables;
        });

        setGuestList(prevGuestList => [...prevGuestList, guest]);
    };

    const handleReassign = (guest, fromTableIndex, toTableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[fromTableIndex] = updatedTables[fromTableIndex].filter(assigned => assigned.id !== guest.id);
            updatedTables[toTableIndex] = [...updatedTables[toTableIndex], guest];
            return updatedTables;
        });
    };

    const handleAddPlusOne = (guest) => {
        setGuestList(prevGuestList => [
            ...prevGuestList,
            {
                firstName: `${guest.firstName} +1`,
                lastName: guest.lastName,
                group: guest.group,
                id: `guest-${Date.now()}-${Math.random()}`, // Generate unique ID for each "+1"
            },
        ]);
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

    const renderListView = () => (
        <div
            style={{
                marginLeft: '20px',
                flex: 1,
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                overflowY: 'auto',
                height: '100vh',
            }}
        >
            {tables.map((table, tableIndex) => (
                <div
                    key={tableIndex}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        const guest = JSON.parse(e.dataTransfer.getData('guest'));
                        handleDrop(guest, tableIndex);
                    }}
                    style={{
                        border: '1px solid #000',
                        padding: '10px',
                        width: '300px',
                        height: '300px',
                        overflowY: 'auto',
                    }}
                >
                    <h3 style={{ marginBottom: '10px' }}>
                        Table {tableIndex + 1} ({table.length}/10) {/* Counter for assigned seats */}
                    </h3>
                    {table.map((guest) => (
                        <div
                            key={guest.id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('guest', JSON.stringify(guest));
                                e.dataTransfer.setData('fromTableIndex', tableIndex);
                            }}
                            style={{
                                border: '1px solid #ccc',
                                padding: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '5px',
                            }}
                        >
                            <span>
                                {guest.firstName} {guest.lastName}
                            </span>
                            <button
                                onClick={() => handleRemove(guest, tableIndex)}
                                style={{ marginLeft: '10px', cursor: 'pointer' }}
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    const renderVisualView = () => (
        <div
            style={{
                marginLeft: '20px',
                flex: 1,
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                overflowY: 'auto',
                height: '100vh',
            }}
        >
            {tables.map((table, tableIndex) => (
                <div
                    key={tableIndex}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        const guest = JSON.parse(e.dataTransfer.getData('guest'));
                        const fromTableIndex = e.dataTransfer.getData('fromTableIndex');
                        if (fromTableIndex) {
                            setTables(prevTables => {
                                const updatedTables = [...prevTables];
                                updatedTables[parseInt(fromTableIndex, 10)] = updatedTables[parseInt(fromTableIndex, 10)].filter(
                                    assigned => assigned.id !== guest.id
                                );
                                updatedTables[tableIndex] = [...updatedTables[tableIndex], guest];
                                return updatedTables;
                            });
                        } else {
                            setTables(prevTables => {
                                const updatedTables = [...prevTables];
                                updatedTables[tableIndex] = [...updatedTables[tableIndex], guest];
                                return updatedTables;
                            });
                            setGuestList(prevGuestList =>
                                prevGuestList.filter(unassigned => unassigned.id !== guest.id)
                            );
                        }
                    }}
                    style={{
                        position: 'relative',
                        width: '300px',
                        height: '300px',
                        border: '1px solid #000',
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <span
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontWeight: 'bold',
                        }}
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
                                    e.dataTransfer.setData('guest', JSON.stringify(guest));
                                    e.dataTransfer.setData('fromTableIndex', tableIndex);
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
                                style={{
                                    position: 'absolute',
                                    top: `${y}px`,
                                    left: `${x}px`,
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    border: '1px solid #ccc',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#fff',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    color: '#000',
                                    cursor: 'pointer',
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
                        .filter(guest => !guest.firstName.includes('+1')) // Exclude "+1" guests from main list
                        .map((guest) => (
                            <div key={guest.id}>
                                {/* Original guest */}
                                <div
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('guest', JSON.stringify(guest))}
                                    style={{
                                        border: '1px solid #ccc',
                                        padding: '5px',
                                        marginBottom: '5px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
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
                                    <button
                                        onClick={() => handleAddPlusOne(guest)}
                                        style={{ marginLeft: '10px', cursor: 'pointer' }}
                                    >
                                        +1
                                    </button>
                                </div>
                                {/* "+1" guests */}
                                {guestList
                                    .filter(
                                        plusOne =>
                                            plusOne.firstName.startsWith(`${guest.firstName} +1`) &&
                                            plusOne.lastName === guest.lastName
                                    )
                                    .map((plusOne) => (
                                        <div
                                            key={plusOne.id}
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData('guest', JSON.stringify(plusOne))}
                                            style={{
                                                border: '1px solid #ccc',
                                                padding: '5px',
                                                marginLeft: '20px',
                                                marginBottom: '5px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
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
                        ))}
                </div>
            ));
        } else {
            return guestList
                .filter(guest => !guest.firstName.includes('+1')) // Exclude "+1" guests from main list
                .map((guest) => (
                    <div key={guest.id}>
                        {/* Original guest */}
                        <div
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('guest', JSON.stringify(guest))}
                            style={{
                                border: '1px solid #ccc',
                                padding: '5px',
                                marginBottom: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
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
                            <button
                                onClick={() => handleAddPlusOne(guest)}
                                style={{ marginLeft: '10px', cursor: 'pointer' }}
                            >
                                +1
                            </button>
                        </div>
                        {/* "+1" guests */}
                        {guestList
                            .filter(
                                plusOne =>
                                    plusOne.firstName.startsWith(`${guest.firstName} +1`) &&
                                    plusOne.lastName === guest.lastName
                            )
                            .map((plusOne) => (
                                <div
                                    key={plusOne.id}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('guest', JSON.stringify(plusOne))}
                                    style={{
                                        border: '1px solid #ccc',
                                        padding: '5px',
                                        marginLeft: '20px',
                                        marginBottom: '5px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
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

    return (
        <div style={{ display: 'flex' }}>
            <div className="guestList">
                <button onClick={saveArrangement} style={{ marginBottom: '10px', cursor: 'pointer' }}>
                    Save Arrangement
                </button>
                <button onClick={deleteArrangement} style={{ marginBottom: '10px', cursor: 'pointer' }}>
                    Delete Arrangement
                </button>
                <button onClick={exportToPDF} style={{ marginBottom: '10px', cursor: 'pointer' }}>
                    Export to PDF
                </button>
                <button onClick={toggleViewMode} style={{ marginBottom: '10px', cursor: 'pointer' }}>
                    Switch to {viewMode === 'list' ? 'Visual View' : 'List View'}
                </button>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                    <input
                        type="checkbox"
                        checked={isGrouped}
                        onChange={(e) => setIsGrouped(e.target.checked)}
                        style={{ marginRight: '5px' }}
                    />
                    Group Guests
                </label>
                <button onClick={removeSelectedGuests} style={{ marginBottom: '10px', cursor: 'pointer' }}>
                    Remove Selected Guests
                </button>
                <h2>Guest List</h2>
                <p>Total Guests: {guestList.length}</p>
                {renderGuestList()}
            </div>
            {viewMode === 'list' ? renderListView() : renderVisualView()}
        </div>
    );
}

export default SeatingCanvas;

