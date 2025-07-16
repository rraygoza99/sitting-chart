import { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';

export function useSeatingArrangement(guests, weddingId) {
    const [tables, setTables] = useState([]);
    const [guestList, setGuestList] = useState([]);
    const [viewMode, setViewMode] = useState('list');
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
    const [showGroupSubmenu, setShowGroupSubmenu] = useState(false);
    const [showNewGroupModal, setShowNewGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const getStorageKey = useCallback(() => `weddingArrangement-${weddingId || 'default'}`, [weddingId]);

    // Load saved data or initialize
    useEffect(() => {
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
            setTables(Array(requiredTables).fill([]));
        }
    }, [weddingId, guests]);

    useEffect(() => {
        if (guests.length > 0 && guestList.length === 0) {
            const initialGuestList = guests.map((guest, index) => ({
                ...guest,
                id: guest.id || `guest-${Date.now()}-${index}`,
            }));
            setGuestList(initialGuestList);
        }
    }, [guests, guestList.length]);

    const updateTables = (guestListLength) => {
        const totalGuests = guestListLength + tables.flat().length;
        const requiredTables = Math.ceil(totalGuests / 10);
        if (requiredTables > tables.length) {
            setTables(prevTables => [...prevTables, ...Array(requiredTables - prevTables.length).fill([])]);
        }
    };

    const showAlert = (message, severity = 'success') => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    };

    const handleCSVImport = (importedGuests) => {
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
        showAlert(`Successfully imported ${newGuests.length} guests!`);
    };

    const saveArrangement = async () => {
        const dataToSave = {
            savedGuestList: guestList,
            savedTables: tables,
        };
        localStorage.setItem(getStorageKey(), JSON.stringify(dataToSave));
        showAlert('Arrangement saved successfully!');
    };

    const deleteArrangement = () => {
        localStorage.removeItem(getStorageKey());
        const initialGuestList = guests.map((guest, index) => ({ ...guest, id: `guest-${index}` }));
        setGuestList(initialGuestList.sort((a, b) => a.firstName.localeCompare(b.firstName)));
        const totalGuests = guests.length;
        const requiredTables = Math.ceil(totalGuests / 10);
        setTables(Array(requiredTables).fill([]));
        showAlert('Arrangement deleted successfully!', 'warning');
    };

    const exportToPDF = () => {
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

        showAlert('Arrangement exported to JSON successfully!');
    };

    const downloadSampleCSV = () => {
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

        showAlert('Sample CSV downloaded successfully!', 'info');
    };

    const toggleViewMode = () => {
        setViewMode(prevMode => (prevMode === 'list' ? 'visual' : 'list'));
    };

    const handleDrop = (guest, tableIndex) => {
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

    const handleDropToGuestList = (guest) => {
        const fromTableIndex = parseInt(guest.fromTableIndex, 10);
        
        if (!isNaN(fromTableIndex)) {
            const isMultiDrag = guest.isMultiDrag;
            const guestsToMove = isMultiDrag ? guest.selectedGuests : [guest];
            
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

    const handleClearTable = (tableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            const guestsToMove = updatedTables[tableIndex];
            
            updatedTables[tableIndex] = [];
            
            setGuestList(prevGuestList => [...prevGuestList, ...guestsToMove]);
            
            return updatedTables;
        });
    };

    const getTotalTickets = (guestId) => {
        return guestList.filter(guest => guest.originalGuestId === guestId).length + 1;
    };

    const canAddPlusOne = (guestId) => {
        const idStr = String(guestId);
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
                id: `${guest.id}-${getTotalTickets(guest.id) + 1}`,
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
        setContextMenu({ visible: false, x: 0, y: 0 });
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
        setShowGroupSubmenu(false);
    };

    const getUniqueGroups = () => {
        const groups = new Set();
        guestList.forEach(guest => {
            if (guest.group) {
                groups.add(guest.group);
            }
        });
        return Array.from(groups).sort();
    };

    const changeGuestGroup = (newGroup) => {
        setGuestList(prevGuestList =>
            prevGuestList.map(guest =>
                selectedGuests.has(guest.id)
                    ? { ...guest, group: newGroup }
                    : guest
            )
        );

        setTables(prevTables =>
            prevTables.map(table =>
                table.map(guest =>
                    selectedGuests.has(guest.id)
                        ? { ...guest, group: newGroup }
                        : guest
                )
            )
        );

        setSelectedGuests(new Set());
        hideContextMenu();
        
        showAlert(`Successfully changed group for ${selectedGuests.size} guest(s) to "${newGroup}"`);
    };

    const openNewGroupModal = () => {
        setShowNewGroupModal(true);
        hideContextMenu();
    };

    const closeNewGroupModal = () => {
        setShowNewGroupModal(false);
        setNewGroupName('');
    };

    const saveNewGroup = () => {
        if (!newGroupName.trim()) return;
        
        changeGuestGroup(newGroupName.trim());
        closeNewGroupModal();
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

    const handleCloseAlert = () => setAlertOpen(false);

    return {
        // State
        tables,
        guestList,
        viewMode,
        isGrouped,
        selectedGuests,
        alertMessage,
        alertOpen,
        alertSeverity,
        editModalOpen,
        editingGuest,
        editFirstName,
        editLastName,
        contextMenu,
        isDragOverGuestList,
        showGroupSubmenu,
        showNewGroupModal,
        newGroupName,
        
        // Actions
        handleCSVImport,
        saveArrangement,
        deleteArrangement,
        exportToPDF,
        exportToJSON,
        downloadSampleCSV,
        toggleViewMode,
        handleDrop,
        handleDropToGuestList,
        handleRemove,
        handleClearTable,
        handleAddPlusOne,
        handleSelectGuest,
        removeSelectedGuests,
        handleContextMenu,
        hideContextMenu,
        getUniqueGroups,
        changeGuestGroup,
        openNewGroupModal,
        closeNewGroupModal,
        saveNewGroup,
        openEditModal,
        closeEditModal,
        saveGuestEdit,
        handleCloseAlert,
        canAddPlusOne,
        
        // Setters
        setIsGrouped,
        setIsDragOverGuestList,
        setShowGroupSubmenu,
        setEditFirstName,
        setEditLastName,
        setNewGroupName
    };
}
