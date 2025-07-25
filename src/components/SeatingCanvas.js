import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import ExposurePlus1Icon from '@mui/icons-material/Exposure';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ConfigurationModal from './ConfigurationModal';
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
    const [showGroupSubmenu, setShowGroupSubmenu] = useState(false);
    const [showNewGroupModal, setShowNewGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [editingTable, setEditingTable] = useState(null);
    const [tableAliases, setTableAliases] = useState({});
    const [tableSizes, setTableSizes] = useState({});
    const [tableNumbers, setTableNumbers] = useState({}); // Custom table numbers for PDF export
    const [showAddGuestsModal, setShowAddGuestsModal] = useState(false);
    const [newGuestsData, setNewGuestsData] = useState([]);
    const [collapsedGroups, setCollapsedGroups] = useState(new Set()); // Track collapsed groups
    const [searchTerm, setSearchTerm] = useState(''); // Search functionality
    
    // Split button state for PDF export
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const exportAnchorRef = useRef(null);

    // Function to get the configured table size
    const getTableSize = useCallback(() => {
        try {
            const savedConfig = localStorage.getItem('seatingConfiguration');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                return config.defaultTableSize || 10;
            }
        } catch (error) {
            console.error('Error loading table size configuration:', error);
        }
        return 10; // Default fallback
    }, []);

    const handleCloseAlert = () => setAlertOpen(false);
    const getStorageKey = useCallback(() => `weddingArrangement-${weddingId || 'default'}`, [weddingId]);    useEffect(() => {
        const storageKey = `weddingArrangement-${weddingId || 'default'}`;
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const { 
                    savedGuestList, 
                    savedTables, 
                    savedTableAliases = {}, 
                    savedTableSizes = {}, 
                    savedTableNumbers = {} 
                } = JSON.parse(savedData);
                setGuestList(savedGuestList || []);
                setTables(savedTables || []);
                setTableAliases(savedTableAliases);
                setTableSizes(savedTableSizes);
                setTableNumbers(savedTableNumbers);
            } catch (error) {
                console.error('Error parsing saved data:', error);
                setGuestList([]);
                setTables([]);
                setTableAliases({});
                setTableSizes({});
                setTableNumbers({});
            }
        } else {
            const initialGuestList = guests.map((guest, index) => ({
                ...guest,
                id: guest.id || `guest-${Date.now()}-${index}`,
            }));
            setGuestList(initialGuestList);
            const totalGuests = guests.length;
            const tableSize = getTableSize();
            const requiredTables = Math.ceil(Math.max(totalGuests, 1) / tableSize);
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
        const tableSize = getTableSize();
        const requiredTables = Math.ceil(totalGuests / tableSize);
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
            savedTableAliases: tableAliases,
            savedTableSizes: tableSizes,
            savedTableNumbers: tableNumbers
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
        const tableSize = getTableSize();
        const requiredTables = Math.ceil(totalGuests / tableSize);
        setTables(Array(requiredTables).fill([])); // Reset tables state
        setTableAliases({}); // Reset table aliases
        setTableSizes({}); // Reset table sizes
        setTableNumbers({}); // Reset table numbers
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
                    tableNumber: getTableDisplayNumber(tableIndex) // Use custom table number
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

    const exportToPDFGroupedByTables = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Wedding Seating Arrangement - Grouped by Tables', 10, 10);

        let currentY = 30;
        const pageHeight = 280;
        const rowHeight = 8;
        const tableHeaderHeight = 12;
        const marginBetweenTables = 15;

        tables.forEach((table, tableIndex) => {
            if (table.length === 0) return; // Skip empty tables

            const tableDisplayName = getTableDisplayName(tableIndex);
            const tableDisplayNumber = getTableDisplayNumber(tableIndex);
            const tableTitle = `${tableDisplayName} (Table #${tableDisplayNumber})`;
            
            // Check if we need a new page for this table
            const estimatedTableHeight = tableHeaderHeight + (table.length * rowHeight) + marginBetweenTables;
            if (currentY + estimatedTableHeight > pageHeight) {
                doc.addPage();
                currentY = 20;
            }

            // Table header
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(tableTitle, 10, currentY);
            doc.setFontSize(10);
            doc.text(`Guests: ${table.length}/${getTableDisplaySize(tableIndex)}`, 10, currentY + 8);
            
            currentY += tableHeaderHeight + 5;

            // Sort guests by last name
            const sortedGuests = [...table].sort((a, b) => {
                const lastNameA = (a.lastName || '').toLowerCase();
                const lastNameB = (b.lastName || '').toLowerCase();
                return lastNameA.localeCompare(lastNameB);
            });

            // Guest list for this table
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            sortedGuests.forEach((guest, guestIndex) => {
                if (currentY + rowHeight > pageHeight) {
                    doc.addPage();
                    currentY = 20;
                }
                
                const guestName = `${guestIndex + 1}. ${guest.firstName || ''} ${guest.lastName || ''}`;
                doc.text(guestName, 15, currentY);
                currentY += rowHeight;
            });

            currentY += marginBetweenTables;
        });

        doc.save('Wedding_Seating_Arrangement_Grouped_by_Tables.pdf');
    };

    // Split button handlers
    const handleExportMenuToggle = () => {
        setExportMenuOpen((prevOpen) => !prevOpen);
    };

    const handleExportMenuClose = (event) => {
        if (exportAnchorRef.current && exportAnchorRef.current.contains(event.target)) {
            return;
        }
        setExportMenuOpen(false);
    };

    const handleExportOption = (exportType) => {
        if (exportType === 'alphabetical') {
            exportToPDF();
        } else if (exportType === 'grouped') {
            exportToPDFGroupedByTables();
        }
        setExportMenuOpen(false);
    };

    const exportToJSON = () => {
        const tableSize = getTableSize();
        const arrangementData = {
            weddingName: weddingId,
            exportDate: new Date().toISOString(),
            totalGuests: guestList.length,
            totalTables: tables.length,
            guestList: guestList,
            tables: tables.map((table, index) => ({
                tableNumber: index + 1,
                seatedGuests: table.length,
                maxCapacity: tableSize,
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

    const exportGuestTicketsToPDF = () => {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(18);
        doc.text('Guest Ticket List', 20, 20);
        
        // Wedding name if available
        if (weddingId) {
            doc.setFontSize(14);
            doc.text(`Wedding: ${weddingId}`, 20, 35);
        }
        
        // Date
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
        
        // Get all guests (from guest list and tables) and calculate tickets
        const allGuests = [...guestList, ...tables.flat()];
        
        // Group guests by their original ID to count tickets
        const guestTicketMap = new Map();
        
        allGuests.forEach(guest => {
            const originalId = guest.originalGuestId || guest.id;
            const originalGuest = allGuests.find(g => g.id === originalId);
            
            if (originalGuest && !guestTicketMap.has(originalId)) {
                // Count all related guests (main guest + plus ones)
                const relatedGuests = allGuests.filter(g => 
                    g.id === originalId || g.originalGuestId === originalId
                );
                
                guestTicketMap.set(originalId, {
                    fullName: `${originalGuest.firstName} ${originalGuest.lastName}`,
                    ticketCount: relatedGuests.length
                });
            }
        });
        
        // Convert to array and sort by full name
        const guestTicketList = Array.from(guestTicketMap.values())
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
        
        // Table headers
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Guest Name', 20, 70);
        doc.text('Tickets', 150, 70);
        
        // Draw header line
        doc.line(20, 72, 190, 72);
        
        // Table data
        doc.setFont(undefined, 'normal');
        let yPosition = 80;
        let totalTickets = 0;
        
        guestTicketList.forEach((guest, index) => {
            // Check if we need a new page
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
                
                // Repeat headers on new page
                doc.setFont(undefined, 'bold');
                doc.text('Guest Name', 20, yPosition);
                doc.text('Tickets', 150, yPosition);
                doc.line(20, yPosition + 2, 190, yPosition + 2);
                doc.setFont(undefined, 'normal');
                yPosition += 10;
            }
            
            doc.text(guest.fullName, 20, yPosition);
            doc.text(guest.ticketCount.toString(), 150, yPosition);
            totalTickets += guest.ticketCount;
            yPosition += 7;
        });
        
        // Total line
        yPosition += 5;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;
        doc.setFont(undefined, 'bold');
        doc.text('Total Guests:', 20, yPosition);
        doc.text(guestTicketList.length.toString(), 80, yPosition);
        doc.text('Total Tickets:', 120, yPosition);
        doc.text(totalTickets.toString(), 150, yPosition);
        
        doc.save(`${weddingId || 'wedding'}_guest_tickets.pdf`);
        
        setAlertMessage('Guest ticket list exported to PDF successfully!');
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

    const toggleGroupCollapse = (groupName) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupName)) {
                newSet.delete(groupName);
            } else {
                newSet.add(groupName);
            }
            return newSet;
        });
    };

    const toggleAllGroups = () => {
        const uniqueGroups = getUniqueGroups();
        setCollapsedGroups(prev => {
            // If all groups are collapsed, expand all. Otherwise, collapse all.
            const allCollapsed = uniqueGroups.every(group => prev.has(group));
            if (allCollapsed) {
                return new Set(); // Expand all
            } else {
                return new Set(uniqueGroups); // Collapse all
            }
        });
    };

    const matchesSearch = (guest) => {
        if (!searchTerm.trim()) return false;
        const search = searchTerm.toLowerCase();
        const firstName = (guest.firstName || '').toLowerCase();
        const lastName = (guest.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        return firstName.includes(search) || lastName.includes(search) || fullName.includes(search);
    };

    const tableHasMatchingGuest = (table) => {
        if (!searchTerm.trim()) return false;
        return table.some(guest => matchesSearch(guest));
    };

    const highlightSearchTerm = (text) => {
        if (!searchTerm.trim() || !text) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => {
            if (part.toLowerCase() === searchTerm.toLowerCase()) {
                return (
                    <span key={index} style={{ 
                        backgroundColor: '#ffeb3b', 
                        padding: '1px 3px',
                        borderRadius: '3px',
                        fontWeight: 'bold'
                    }}>
                        {part}
                    </span>
                );
            }
            return part;
        });
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
        
        setAlertMessage(`Successfully changed group for ${selectedGuests.size} guest(s) to "${newGroup}"`);
        setAlertSeverity('success');
        setAlertOpen(true);
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

    // Helper functions for table editing
    const getTableDisplayName = (tableIndex) => {
        return tableAliases[tableIndex] || `Table ${tableIndex + 1}`;
    };

    const getTableDisplaySize = (tableIndex) => {
        return tableSizes[tableIndex] || getTableSize();
    };

    const getTableDisplayNumber = (tableIndex) => {
        return tableNumbers[tableIndex] || (tableIndex + 1);
    };

    const handleTableAliasChange = (tableIndex, newAlias) => {
        setTableAliases(prev => ({
            ...prev,
            [tableIndex]: newAlias
        }));
    };

    const handleTableSizeChange = (tableIndex, newSize) => {
        const size = parseInt(newSize, 10);
        if (size > 0) {
            setTableSizes(prev => ({
                ...prev,
                [tableIndex]: size
            }));
        }
    };

    const handleTableNumberChange = (tableIndex, newNumber) => {
        const number = parseInt(newNumber, 10);
        if (number > 0) {
            setTableNumbers(prev => ({
                ...prev,
                [tableIndex]: number
            }));
        }
    };

    const handleTableEditClick = (tableIndex) => {
        setEditingTable(tableIndex);
    };

    const handleTableEditComplete = () => {
        setEditingTable(null);
    };

    // Helper functions for adding guests
    const getNextGuestId = () => {
        const allGuests = [...guestList, ...tables.flat()];
        let maxId = 0;
        
        allGuests.forEach(guest => {
            const id = guest.id;
            if (typeof id === 'string') {
                const numericPart = id.match(/(\d+)/);
                if (numericPart) {
                    const num = parseInt(numericPart[1], 10);
                    if (num > maxId) maxId = num;
                }
            } else if (typeof id === 'number') {
                if (id > maxId) maxId = id;
            }
        });
        
        return maxId + 1;
    };

    const openAddGuestsModal = () => {
        setNewGuestsData([
            { id: 1, firstName: '', lastName: '', group: '' }
        ]);
        setShowAddGuestsModal(true);
    };

    const closeAddGuestsModal = () => {
        setShowAddGuestsModal(false);
        setNewGuestsData([]);
    };

    const handleAddRow = () => {
        const newRow = {
            id: newGuestsData.length + 1,
            firstName: '',
            lastName: '',
            group: ''
        };
        setNewGuestsData([...newGuestsData, newRow]);
    };

    const handleRemoveRow = (id) => {
        setNewGuestsData(newGuestsData.filter(row => row.id !== id));
    };

    const saveNewGuests = () => {
        const validGuests = newGuestsData.filter(guest => 
            guest.firstName.trim() && guest.lastName.trim()
        );
        
        if (validGuests.length === 0) {
            setAlertMessage('Please add at least one guest with first and last name');
            setAlertSeverity('warning');
            setAlertOpen(true);
            return;
        }

        let nextId = getNextGuestId();
        const guestsToAdd = validGuests.map(guest => ({
            firstName: guest.firstName.trim(),
            lastName: guest.lastName.trim(),
            group: guest.group.trim() || 'Ungrouped',
            id: nextId++
        }));

        setGuestList(prevGuestList => [...prevGuestList, ...guestsToAdd]);
        updateTables(guestList.length + guestsToAdd.length);
        
        setAlertMessage(`Successfully added ${guestsToAdd.length} guest(s)`);
        setAlertSeverity('success');
        setAlertOpen(true);
        
        closeAddGuestsModal();
    };

    const renderListView = () => {
        return (
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
                        <div className="table-header"
                        style={{
                            ...(table.length === getTableDisplaySize(tableIndex) ? { backgroundColor: 'var(--table-header-completed-color)', color:'var(--table-header-completed-text-color)' } : {}),
                            ...(table.length > getTableDisplaySize(tableIndex) ? { backgroundColor: 'var(--table-header-oversized-color)', color:'var(--table-header-oversized-text-color)' } : {}),
                            ...(tableHasMatchingGuest(table) ? { 
                                backgroundColor: 'var(--table-header-highlight-color, #c4ce40ff)', 
                                border: '2px solid #1976d2',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                            } : {})
                        }}>
                            {editingTable === tableIndex ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TextField
                                            type='text'
                                            label="Table Alias"
                                            size="small"
                                            defaultValue={getTableDisplayName(tableIndex)}
                                            style={{ flex: 1, backgroundColor: 'white', borderRadius: '4px' }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleTableAliasChange(tableIndex, e.target.value);
                                                    handleTableEditComplete();
                                                }
                                            }}
                                        />
                                        <TextField
                                            type='number'
                                            min="1"
                                            label="Table #"
                                            size="small"
                                            defaultValue={getTableDisplayNumber(tableIndex)}
                                            style={{ width: '100px', backgroundColor: 'white', borderRadius: '4px' }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleTableNumberChange(tableIndex, e.target.value);
                                                    handleTableEditComplete();
                                                }
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TextField
                                            type='number'
                                            min="1"
                                            label="Max Size"
                                            size="small"
                                            defaultValue={getTableDisplaySize(tableIndex)}
                                            style={{ width: '100px', backgroundColor: 'white', borderRadius: '4px' }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleTableSizeChange(tableIndex, e.target.value);
                                                    handleTableEditComplete();
                                                }
                                            }}
                                        />
                                        <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                                            Current: {table.length} guests
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                            {getTableDisplayName(tableIndex)}
                                        </span>
                                        <span style={{ fontSize: '14px' }}>
                                            Table #{getTableDisplayNumber(tableIndex)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '14px' }}>
                                        Seated: {table.length}/{getTableDisplaySize(tableIndex)}
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <IconButton
                                    onClick={() => handleTableEditClick(tableIndex)}
                                    color="inherit"
                                    size="small"
                                    title="Edit table settings"
                                    sx={{ color: 'white' }}
                                >
                                    <Icon>edit</Icon>
                                </IconButton>
                                {table.length > 0 && (
                                    <IconButton
                                        onClick={() => handleClearTable(tableIndex)}
                                        color="inherit"
                                        size="small"
                                        title="Clear all guests from this table"
                                        sx={{ color: 'white' }}
                                    >
                                        <Icon>delete</Icon>
                                    </IconButton>
                                )}
                            </div>
                        </div>
                        <div className="table-content">
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
                                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                        <span style={{ flex: 1 }}>
                                            {highlightSearchTerm(`${guest.firstName} ${guest.lastName}`)}
                                        </span>
                                    </div>
                                    <div style={{ marginLeft: '10px', display: 'flex', gap: '5px' }}>
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
                    </div>
                ))}
            </div>
        );
    };

    const renderVisualView = () => {
        return (
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
                        <div
                            className='visual-table-title'
                            style={{
                                ...(tableHasMatchingGuest(table) ? { 
                                    backgroundColor: '#e3f2fd', 
                                    border: '2px solid #1976d2',
                                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
                                } : {})
                            }}
                        >
                            {editingTable === tableIndex ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '160px' }}>
                                    {/* First Row: Table Alias and Number */}
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <input
                                            type="text"
                                            defaultValue={getTableDisplayName(tableIndex)}
                                            placeholder="Table name..."
                                            
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleTableAliasChange(tableIndex, e.target.value);
                                                    handleTableEditComplete();
                                                }
                                            }}
                                            autoFocus
                                            style={{
                                                background: 'white',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                padding: '2px 4px',
                                                fontSize: '11px',
                                                flex: 1
                                            }}
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            defaultValue={getTableDisplayNumber(tableIndex)}
                                            
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleTableNumberChange(tableIndex, e.target.value);
                                                    handleTableEditComplete();
                                                }
                                            }}
                                            style={{
                                                background: 'white',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                padding: '2px 4px',
                                                fontSize: '11px',
                                                width: '40px'
                                            }}
                                        />
                                    </div>
                                    {/* Second Row: Max Size */}
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '10px', color: '#333' }}>Max:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            defaultValue={getTableDisplaySize(tableIndex)}
                                            
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleTableSizeChange(tableIndex, e.target.value);
                                                    handleTableEditComplete();
                                                }
                                            }}
                                            style={{
                                                background: 'white',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                padding: '2px 4px',
                                                fontSize: '11px',
                                                width: '40px'
                                            }}
                                        />
                                        <span style={{ fontSize: '10px', color: '#333' }}>
                                            Current: {table.length}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, textAlign: 'center' }}>
                                    {/* First Row: Table Name and Number */}
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                        {getTableDisplayName(tableIndex)} #{getTableDisplayNumber(tableIndex)}
                                    </div>
                                    {/* Second Row: Occupancy */}
                                    <div style={{ fontSize: '11px' }}>
                                        {table.length}/{getTableDisplaySize(tableIndex)}
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <IconButton
                                    onClick={() => handleTableEditClick(tableIndex)}
                                    color="primary"
                                    size="small"
                                    title="Edit table settings"
                                    sx={{ minWidth: '24px', minHeight: '24px', padding: '2px' }}
                                >
                                    <Icon sx={{ fontSize: '16px' }}>edit</Icon>
                                </IconButton>
                                {table.length > 0 && (
                                    <IconButton
                                        onClick={() => handleClearTable(tableIndex)}
                                        color="error"
                                        size="small"
                                        title="Clear all guests from this table"
                                        sx={{ minWidth: '24px', minHeight: '24px', padding: '2px' }}
                                    >
                                        <Icon sx={{ fontSize: '16px' }}>delete</Icon>
                                    </IconButton>
                                )}
                            </div>
                        </div>
                    {table.map((guest, index) => {
                        const currentTableSize = getTableDisplaySize(tableIndex);
                        const angle = (index / currentTableSize) * 2 * Math.PI; // Divide the circle into equal parts based on table size
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
                                <span>{highlightSearchTerm(`${guest.firstName} ${guest.lastName}`)}</span>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

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
                    <h3 
                        onClick={() => toggleGroupCollapse(groupName)}
                        style={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            margin: '0 0 10px 0',
                            padding: '12px 16px',
                            backgroundColor: collapsedGroups.has(groupName) ? '#f0f0f0' : '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0',
                            userSelect: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e8f0fe';
                            e.target.style.borderColor = '#2196f3';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = collapsedGroups.has(groupName) ? '#f0f0f0' : '#f8f9fa';
                            e.target.style.borderColor = '#e0e0e0';
                        }}
                    >
                        <span style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            color: '#2196f3',
                            transition: 'transform 0.2s ease',
                            transform: collapsedGroups.has(groupName) ? 'rotate(0deg)' : 'rotate(90deg)'
                        }}>
                            ▶
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                            {groupName}
                        </span>
                        <span style={{ 
                            fontSize: '13px', 
                            color: '#666', 
                            marginLeft: 'auto',
                            fontWeight: 'normal',
                            backgroundColor: '#e3f2fd',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: '1px solid #bbdefb'
                        }}>
                            {groupedGuests[groupName].length} guests
                        </span>
                    </h3>
                    {!collapsedGroups.has(groupName) && (
                        <div style={{ 
                            paddingLeft: '24px',
                            paddingRight: '8px',
                            marginBottom: '8px',
                            opacity: 1,
                            transition: 'opacity 0.3s ease'
                        }}>
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
                                    style={{
                                        backgroundColor: matchesSearch(guest) ? '#e3f2fd' : 'transparent',
                                        border: matchesSearch(guest) ? '2px solid #2196f3' : '1px solid transparent',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        margin: '2px 0',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedGuests.has(guest.id)}
                                        onChange={() => handleSelectGuest(guest.id)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <span style={{ flex: 1 }}>
                                        {highlightSearchTerm(`${guest.firstName} ${guest.lastName}`)}
                                    </span>
                                    {matchesSearch(guest) && (
                                        <Icon style={{ color: '#2196f3', fontSize: '16px', marginRight: '8px' }}>
                                            search
                                        </Icon>
                                    )}
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {canAddPlusOne(guest.id) && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleAddPlusOne(guest)}
                                                style={{ marginLeft: '10px' }}
                                                className='plus-one-button'
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
                    )}
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
                            style={{
                                backgroundColor: matchesSearch(guest) ? '#e3f2fd' : 'transparent',
                                border: matchesSearch(guest) ? '2px solid #2196f3' : '1px solid transparent',
                                borderRadius: '4px',
                                padding: '8px',
                                margin: '2px 0',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedGuests.has(guest.id)}
                                onChange={() => handleSelectGuest(guest.id)}
                                style={{ marginRight: '10px' }}
                            />
                            <span style={{ flex: 1 }}>
                                {highlightSearchTerm(`${guest.firstName} ${guest.lastName}`)}
                            </span>
                            {matchesSearch(guest) && (
                                <Icon style={{ color: '#2196f3', fontSize: '16px', marginRight: '8px' }}>
                                    search
                                </Icon>
                            )}
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
            {/* Configuration Modal Component */}
            <ConfigurationModal 
                onExportToJSON={exportToJSON}
                onDeleteArrangement={deleteArrangement}
                onCSVImport={handleCSVImport}
                onDownloadSampleCSV={downloadSampleCSV}
                weddingId={weddingId}
            />
            
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
                    <div
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f5f5f5';
                            setShowGroupSubmenu(true);
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            // Don't hide submenu immediately to allow navigation
                        }}
                    >
                        Change Group... ({selectedGuests.size})
                        <span style={{ float: 'right' }}>▶</span>
                        
                        {/* Group Submenu */}
                        {showGroupSubmenu && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: contextMenu.y + 60 > window.innerHeight - 200 ? 'auto' : 0,
                                    bottom: contextMenu.y + 60 > window.innerHeight - 200 ? 0 : 'auto',
                                    left: '100%',
                                    backgroundColor: 'white',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    minWidth: '120px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    zIndex: 1001
                                }}
                                onMouseEnter={() => setShowGroupSubmenu(true)}
                                onMouseLeave={() => setShowGroupSubmenu(false)}
                            >
                                {getUniqueGroups().map((group, index) => (
                                    <div
                                        key={group}
                                        style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            borderBottom: index < getUniqueGroups().length - 1 ? '1px solid #eee' : 'none'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            changeGuestGroup(group);
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                    >
                                        {group}
                                    </div>
                                ))}
                                {getUniqueGroups().length > 0 && (
                                    <div style={{ borderTop: '1px solid #ddd', margin: '4px 0' }} />
                                )}
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        fontStyle: 'italic',
                                        color: '#666'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openNewGroupModal();
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                                    Add new group...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* New Group Modal */}
            <Modal
                open={showNewGroupModal}
                onClose={closeNewGroupModal}
                aria-labelledby="new-group-modal-title"
                aria-describedby="new-group-modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="new-group-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                        Create New Group
                    </Typography>
                    <TextField
                        fullWidth
                        label="Group Name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        placeholder="Enter group name..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && newGroupName.trim()) {
                                saveNewGroup();
                            }
                        }}
                    />
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={closeNewGroupModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={saveNewGroup}
                            disabled={!newGroupName.trim()}
                        >
                            Create Group
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Add Guests Modal */}
            <Modal
                open={showAddGuestsModal}
                onClose={closeAddGuestsModal}
                aria-labelledby="add-guests-modal-title"
                aria-describedby="add-guests-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 800,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    maxHeight: '80vh',
                    overflow: 'auto'
                }}>
                    <Typography id="add-guests-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                        Add New Guests
                    </Typography>
                    
                    <div style={{ height: 400, width: '100%', marginBottom: '16px' }}>
                        <DataGrid
                            rows={newGuestsData}
                            columns={[
                                {
                                    field: 'firstName',
                                    headerName: 'First Name',
                                    width: 200,
                                    editable: true,
                                },
                                {
                                    field: 'lastName',
                                    headerName: 'Last Name',
                                    width: 200,
                                    editable: true,
                                },
                                {
                                    field: 'group',
                                    headerName: 'Group',
                                    width: 200,
                                    editable: true,
                                    type: 'singleSelect',
                                    valueOptions: getUniqueGroups().map(group => group || 'Ungrouped'),
                                },
                                {
                                    field: 'actions',
                                    headerName: 'Actions',
                                    width: 100,
                                    renderCell: (params) => (
                                        <IconButton
                                            onClick={() => handleRemoveRow(params.row.id)}
                                            color="error"
                                            size="small"
                                            disabled={newGuestsData.length === 1}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    ),
                                    sortable: false,
                                    filterable: false,
                                },
                            ]}
                            processRowUpdate={(newRow) => {
                                setNewGuestsData(prevData =>
                                    prevData.map(row => (row.id === newRow.id ? newRow : row))
                                );
                                return newRow;
                            }}
                            onProcessRowUpdateError={(error) => {
                                console.error('Error updating row:', error);
                            }}
                            disableRowSelectionOnClick
                            hideFooter
                        />
                    </div>
                    
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleAddRow}
                            startIcon={<Icon>add</Icon>}
                        >
                            Add Row
                        </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={closeAddGuestsModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={saveNewGuests}
                            color="primary"
                        >
                            Add Guests
                        </Button>
                    </Box>
                </Box>
            </Modal>

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
                    transition: 'all 0.2s ease'
                }}
            >
                {/* Fixed Header Section */}
                <div className="guest-list-header">
                    
                    {/* Action Buttons */}
                    <div className="button-section">
                        <div className="button-row">
                            <Button
                                variant="contained"
                                color="success"
                                onClick={openAddGuestsModal}
                                className='add-guests-button'
                                size="small"
                            >
                                ➕ Add Guests
                            </Button>
                        </div>
                        <div className="button-row">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={saveArrangement}
                                className='save-button'
                                size="small"
                            >
                                Save Arrangement
                            </Button>
                        </div>
                        
                        <div className="button-row">
                            <ButtonGroup 
                                variant="contained" 
                                color="success"
                                ref={exportAnchorRef}
                                aria-label="PDF export options"
                                size="small"
                            >
                                <Button 
                                    onClick={() => handleExportOption('alphabetical')}
                                    className='export-button'
                                >
                                    Export as PDF
                                </Button>
                                <Button
                                    size="small"
                                    aria-controls={exportMenuOpen ? 'export-split-button-menu' : undefined}
                                    aria-expanded={exportMenuOpen ? 'true' : undefined}
                                    aria-label="select export option"
                                    aria-haspopup="menu"
                                    onClick={handleExportMenuToggle}
                                >
                                    <ArrowDropDownIcon />
                                </Button>
                            </ButtonGroup>
                            <Popper
                                sx={{ zIndex: 1 }}
                                open={exportMenuOpen}
                                anchorEl={exportAnchorRef.current}
                                role={undefined}
                                transition
                                disablePortal
                            >
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        style={{
                                            transformOrigin:
                                                placement === 'bottom' ? 'center top' : 'center bottom',
                                        }}
                                    >
                                        <Paper>
                                            <ClickAwayListener onClickAway={handleExportMenuClose}>
                                                <MenuList id="export-split-button-menu" autoFocusItem>
                                                    <MenuItem onClick={() => handleExportOption('alphabetical')}>
                                                        Alphabetical List
                                                    </MenuItem>
                                                    <MenuItem onClick={() => handleExportOption('grouped')}>
                                                        Grouped by Tables
                                                    </MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={exportGuestTicketsToPDF}
                                className='export-button'
                                size="small"
                            >
                                📋 Export ticket Information
                            </Button>
                            <Button
                                variant="contained"
                                color="info"
                                onClick={toggleViewMode}
                                className='switch-button'
                                size="small"
                            >
                                Change view mode
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={removeSelectedGuests}
                                className='delete-button'
                                size="small"
                            >
                                Remove Selected Guests
                            </Button>
                        </div>
                    </div>
                    
                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={isGrouped}
                                onChange={(e) => setIsGrouped(e.target.checked)}
                                style={{ marginRight: '5px' }}
                            />
                            Group Guests
                        </label>
                        
                        {isGrouped && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={toggleAllGroups}
                                style={{ 
                                    fontSize: '12px', 
                                    padding: '4px 8px',
                                    minWidth: 'auto'
                                }}
                            >
                                {getUniqueGroups().every(group => collapsedGroups.has(group)) ? 'Expand All' : 'Collapse All'}
                            </Button>
                        )}
                    </div>
                    
                    {/* Search Field */}
                    <div style={{ marginBottom: '15px' }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Search guests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <Icon style={{ marginRight: '8px', color: '#666' }}>search</Icon>
                                ),
                                endAdornment: searchTerm && (
                                    <IconButton
                                        size="small"
                                        onClick={() => setSearchTerm('')}
                                        style={{ padding: '4px' }}
                                    >
                                        <Icon style={{ fontSize: '18px' }}>clear</Icon>
                                    </IconButton>
                                )
                            }}
                            style={{ backgroundColor: 'white', borderRadius: '4px' }}
                        />
                    </div>
                    
                    {/* Statistics */}
                    <p className="guest-list-stats">Total Guests: {guestList.length}</p>
                    
                    {/* Selected guests info */}
                    {selectedGuests.size > 1 && (
                        <div style={{ 
                            padding: '8px 12px', 
                            backgroundColor: '#e3f2fd', 
                            border: '1px solid #2196f3', 
                            borderRadius: '4px', 
                            fontSize: '14px',
                            color: '#1976d2'
                        }}>
                            <strong>{selectedGuests.size} guests selected</strong> - Drag any selected guest to move all together
                        </div>
                    )}
                </div>
                
                {/* Scrollable Content Section */}
                <div className="guest-list-content">
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
                    {renderGuestList()}
                </div>
            </div>
            {viewMode === 'list' ? renderListView() : renderVisualView()}
        </div>
    );
}

export default SeatingCanvas;


