import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { useParams, useBlocker } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TableBarIcon from '@mui/icons-material/TableBar';
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
import TopActionBar from './TopActionBar';
import ContextMenu from './ContextMenu';
import TableList from './TableList';
import GuestManagerModal from './GuestManagerModal';
import GroupIcon from '@mui/icons-material/Group';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import './SeatingCanvas.css';
import { useSeatingTranslation } from '../hooks/useSeatingTranslation';
import { useNotification } from './common/NotificationProvider';
import { getWedding, saveWedding } from '../utils/weddingsService';
import { addGuestsUnique, dedupeGuests, normalizeGuestData, generateUniqueGuestId } from '../utils/guests';
import { logSeating, findDuplicatesById, summarizeIds } from '../utils/debug';

function SeatingCanvas({ guests = [] }) {
    const auth = useAuth();
    const { name: weddingId } = useParams();
    const [tables, setTables] = useState([]);
    const [guestList, setGuestList] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'visual'
    const [isGrouped, setIsGrouped] = useState(true);
    const [selectedGuests, setSelectedGuests] = useState(new Set());
    const notify = useNotification();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editIsTableCaptain, setEditIsTableCaptain] = useState(false);
    const [editingGuestTableIndex, setEditingGuestTableIndex] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [isDragOverGuestList, setIsDragOverGuestList] = useState(false);
    const [showNewGroupModal, setShowNewGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [editingTable, setEditingTable] = useState(null);
    const [tableAliases, setTableAliases] = useState({});
    const [tableSizes, setTableSizes] = useState({});
    const [tableNumbers, setTableNumbers] = useState({}); // Custom table numbers for PDF export
    const [showAddGuestsModal, setShowAddGuestsModal] = useState(false);
    const [showGuestManager, setShowGuestManager] = useState(false);
    const [newGuestsData, setNewGuestsData] = useState([]);
    const [collapsedGroups, setCollapsedGroups] = useState(new Set()); // Track collapsed groups
        const [customGroups, setCustomGroups] = useState([]); // Persisted custom groups (can be empty)
    const [searchTerm, setSearchTerm] = useState(''); // Search functionality
    const [currentLanguage, setCurrentLanguage] = useState('english'); // Language state
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes
    const [isLoading, setIsLoading] = useState(false); // Loading state for server operations
    
    // Split button state for Add actions
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    
    // Undo system state
    const [undoHistory, setUndoHistory] = useState([]);
    const MAX_UNDO_HISTORY = 10;
    const addAnchorRef = useRef(null);
    
    // Translation hook
    const { t } = useSeatingTranslation(currentLanguage);

    // Helper to generate an initial guest list with GUID ids (avoids timestamp collisions)
    const buildInitialGuestList = (incoming = []) => {
        const existingIds = new Set();
        return incoming.map(g => {
            let id = g.id ? String(g.id) : null;
            if (!id || existingIds.has(id)) {
                id = generateUniqueGuestId(existingIds);
            }
            existingIds.add(id);
            return { ...g, id };
        });
    };

    // Load and save via service
    const loadWeddingFromServer = async (weddingName) => {
        setIsLoading(true);
        try {
            const data = await getWedding(weddingName);
            return data;
        } catch (e) {
            console.error('Error loading wedding from server:', e);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const saveWeddingToServer = async (weddingName, weddingData) => {
        setIsLoading(true);
        try {
            const ownerId = auth?.user?.profile?.email || undefined;
            await saveWedding(weddingName, weddingData, ownerId);
            return true;
        } catch (e) {
            console.error('Error saving wedding to server:', e);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

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

    // Warn user when attempting to reload/close tab if there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!hasUnsavedChanges) return;
            // Modern browsers will show a generic confirmation dialog; custom text is ignored
            e.preventDefault();
            e.returnValue = '';
            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    // Block in-app route changes if there are unsaved changes
    const blocker = useBlocker(hasUnsavedChanges);
    useEffect(() => {
        if (blocker.state === 'blocked') {
            const confirmLeave = window.confirm(
                t ? t('unsavedChangesConfirm') || 'You have unsaved changes. Leave this page?' : 'You have unsaved changes. Leave this page?'
            );
            if (confirmLeave) {
                blocker.proceed();
            } else {
                blocker.reset();
            }
        }
    }, [blocker, t]);

    // Notifications are global; no local alert close handler needed.
    
    // Load wedding data from server
    useEffect(() => {
        const loadWeddingData = async () => {
            if (!weddingId) {
                // Handle case where there's no wedding ID
                const initialGuestList = buildInitialGuestList(guests);
                setGuestList(initialGuestList);
                const totalGuests = guests.length;
                const tableSize = getTableSize();
                const requiredTables = Math.ceil(Math.max(totalGuests, 1) / tableSize);
                setTables(Array(requiredTables).fill([]));
                return;
            }

            // Try to load from server first
            const serverData = await loadWeddingFromServer(weddingId);
            
            if (serverData) {
                // Successfully loaded from server
                // The server returns data with a nested structure: { content: { actualData } }
                const contentData = serverData.content || serverData; // Handle both nested and flat structures
                
                // Handle both formats: direct properties (guestList, tables) and saved format (savedGuestList, savedTables)
                const { 
                    guestList: directGuestList,
                    tables: directTables,
                    tableAliases: directTableAliases,
                    tableSizes: directTableSizes,
                    tableNumbers: directTableNumbers,
                        customGroups: directCustomGroups,
                    savedGuestList, 
                    savedTables, 
                    savedTableAliases, 
                    savedTableSizes, 
                    savedTableNumbers,
                    savedCustomGroups 
                } = contentData;
                
                // Use saved format if available, otherwise use direct format
                const loadedGuestList = savedGuestList || directGuestList || [];
                const loadedTables = savedTables || directTables || [];
                const loadedTableAliases = savedTableAliases || directTableAliases || {};
                const loadedTableSizes = savedTableSizes || directTableSizes || {};
                const loadedTableNumbers = savedTableNumbers || directTableNumbers || {};
                const loadedCustomGroups = savedCustomGroups || directCustomGroups || [];
                
                // Ensure loadedTables is an array of arrays, handling both formats:
                // Format 1: Array of arrays (legacy format) - [[guest1, guest2], [guest3]]
                // Format 2: Array of table objects (server format) - [{tableNumber: 1, guests: [guest1, guest2]}]
                let safeTables;
                if (Array.isArray(loadedTables)) {
                    safeTables = loadedTables.map(table => {
                        if (Array.isArray(table)) {
                            // Legacy format: table is already an array of guests
                            return table;
                        } else if (table && typeof table === 'object' && Array.isArray(table.guests)) {
                            // Server format: table is an object with a guests property
                            return table.guests;
                        } else {
                            // Invalid format, return empty array
                            return [];
                        }
                    });
                } else {
                    safeTables = [];
                }
                
                // Ensure no duplicates in loaded guest list
                // Normalize IDs to avoid duplicate React keys (warning: duplicate key 'x')
                const { guestList: normalizedList } = normalizeGuestData(dedupeGuests(loadedGuestList), []);
                setGuestList(normalizedList);
                setTableAliases(loadedTableAliases);
                setTableSizes(loadedTableSizes);
                setTableNumbers(loadedTableNumbers);
                setCustomGroups(Array.isArray(loadedCustomGroups) ? loadedCustomGroups : []);
                
                // Check if we have guests but no tables (e.g., CSV import from home page)
                if (normalizedList.length > 0 && safeTables.length === 0) {
                    const tableSize = getTableSize();
                    const requiredTables = Math.ceil(normalizedList.length / tableSize);
                    setTables(Array(requiredTables).fill([]));
                } else {
                    // Apply any remapped guest IDs to tables too (if future normalization includes them)
                    setTables(safeTables);
                }
                
                // No unsaved changes when loading from server
                setHasUnsavedChanges(false);
            } else {
                // Server failed to load data - show error message
                notify.error('Failed to load wedding data from server. Please check your connection and try again.');
                
                // Initialize with empty state
                const initialGuestList = buildInitialGuestList(guests);
                const { guestList: normalizedInitial } = normalizeGuestData(dedupeGuests(initialGuestList), []);
                setGuestList(normalizedInitial);
                const totalGuests = guests.length;
                const tableSize = getTableSize();
                const requiredTables = Math.ceil(totalGuests / tableSize);
                setTables(Array(requiredTables).fill([]));
                setTableAliases({});
                setTableSizes({});
                setTableNumbers({});
                setHasUnsavedChanges(false);
            }
        };

        loadWeddingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weddingId]);
    useEffect(() => {
        if (guests.length > 0 && guestList.length === 0) {
            const initialGuestList = buildInitialGuestList(guests);
            setGuestList(initialGuestList);
        }
        
        // Load language preference
        const savedConfig = localStorage.getItem('seatingConfiguration');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                if (config.language) {
                    setCurrentLanguage(config.language);
                }
            } catch (error) {
                console.error('Error loading language preference:', error);
            }
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
        const existingIds = new Set([...guestList, ...tables.flat()].map(g => String(g.id)));
        const newGuests = importedGuests.map((guest) => {
            let id = guest.id ? String(guest.id) : null;
            if (!id || existingIds.has(id)) {
                id = generateUniqueGuestId(existingIds);
            }
            existingIds.add(id);
            return { ...guest, id };
        });
        setGuestList(prevGuestList => {
            const merged = addGuestsUnique(prevGuestList, newGuests);
            const { guestList: normalized } = normalizeGuestData(merged, tables);
            return normalized;
        });
        updateTables(guestList.length + newGuests.length);
        notify.success(t('importSuccessful', { count: newGuests.length }));
    };

const saveArrangement = async () => {
        if (!weddingId) {
            notify.error('Cannot save: No wedding ID provided');
            return;
        }

        const dataToSave = {
            weddingName: weddingId,
            exportDate: new Date().toISOString(),
            totalGuests: guestList.length,
            totalTables: tables.length,
            guestList: guestList,
            tables: tables,
            tableAliases: tableAliases,
            tableSizes: tableSizes,
            tableNumbers: tableNumbers,
            customGroups: customGroups,
            metadata: {
                viewMode: viewMode,
                isGrouped: isGrouped,
                version: "1.0"
            }
        };
        
        // Save to server
        const success = await saveWeddingToServer(weddingId, dataToSave);
        
        if (success) {
            // Reset unsaved changes flag after successful save
            setHasUnsavedChanges(false);
            notify.success(t('arrangementSaved'));
        } else {
            notify.error('Failed to save to server. Please check your connection and try again.');
        }
    };

    // Undo system functions
    const saveStateToHistory = (actionDescription) => {
        const currentState = {
            guestList: [...guestList],
            tables: tables.map(table => [...table]),
            tableAliases: { ...tableAliases },
            tableSizes: { ...tableSizes },
            tableNumbers: { ...tableNumbers },
            timestamp: Date.now(),
            action: actionDescription
        };

        setUndoHistory(prevHistory => {
            const newHistory = [currentState, ...prevHistory];
            return newHistory.slice(0, MAX_UNDO_HISTORY);
        });
        
        // Mark as having unsaved changes when an action occurs
        setHasUnsavedChanges(true);
    };

    const performUndo = () => {
        if (undoHistory.length === 0) {
            notify.info(t('noActionsToUndo'));
            return;
        }

        const [lastState, ...remainingHistory] = undoHistory;
        
        setGuestList(lastState.guestList);
        setTables(lastState.tables);
        setTableAliases(lastState.tableAliases);
        setTableSizes(lastState.tableSizes);
        setTableNumbers(lastState.tableNumbers);
        setUndoHistory(remainingHistory);
        
        // Mark as having unsaved changes when undoing
        setHasUnsavedChanges(true);

    notify.info(t('undoAction', { action: lastState.action }));
    };

    const deleteArrangement = () => {
        // Reset to initial state
        const initialGuestList = guests.map((guest, index) => ({ ...guest, id: `guest-${index}` }));
        setGuestList(initialGuestList.sort((a, b) => a.firstName.localeCompare(b.firstName)));
        const totalGuests = guests.length;
        const tableSize = getTableSize();
        const requiredTables = Math.ceil(totalGuests / tableSize);
        setTables(Array(requiredTables).fill([])); // Reset tables state
        setTableAliases({}); // Reset table aliases
        setTableSizes({}); // Reset table sizes
        setTableNumbers({}); // Reset table numbers
    setCustomGroups([]); // Reset custom groups
    notify.warning(t('arrangementDeleted'));
    };    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(t('weddingSeatingArrangement'), 10, 10);

        const allGuests = [];
        tables.forEach((table, tableIndex) => {
            table.forEach((guest) => {
                allGuests.push({
                    ...guest,
                    tableNumber: getTableDisplayNumber(tableIndex) // Use custom table number
                });
            });
        });

        const adults = allGuests.filter(g => !g.isChild);
        const children = allGuests.filter(g => g.isChild);

        adults.sort((a, b) => {
            const lastNameA = (a.lastName || '').toLowerCase();
            const lastNameB = (b.lastName || '').toLowerCase();
            return lastNameA.localeCompare(lastNameB);
        });

        children.sort((a, b) => {
            const lastNameA = (a.lastName || '').toLowerCase();
            const lastNameB = (b.lastName || '').toLowerCase();
            return lastNameA.localeCompare(lastNameB);
        });

        let currentY = 30;
        const pageHeight = 280;
        const rowHeight = 8;
        const columnWidths = [60, 60, 30];

        const addHeader = () => {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(t('lastName'), 10, currentY);
            doc.text(t('firstName'), 10 + columnWidths[0], currentY);
            doc.text(t('tableNumber'), 10 + columnWidths[0] + columnWidths[1], currentY);
            
            doc.line(10, currentY + 2, 10 + columnWidths[0] + columnWidths[1] + columnWidths[2], currentY + 2);
            currentY += 10;
            doc.setFont(undefined, 'normal');
        };

        addHeader();

        const addGuestRows = (guestList) => {
            guestList.forEach((guest) => {
                if (currentY + rowHeight > pageHeight) {
                    doc.addPage();
                    currentY = 20;
                    addHeader();
                }

                doc.text(guest.lastName || '', 10, currentY);
                doc.text(guest.firstName || '', 10 + columnWidths[0], currentY);
                doc.text(guest.tableNumber.toString(), 10 + columnWidths[0] + columnWidths[1], currentY);
                currentY += rowHeight;
            });
        };

        addGuestRows(adults);

        if (children.length > 0) {
            if (currentY + rowHeight * 2 > pageHeight) {
                doc.addPage();
                currentY = 20;
            }
            currentY += 10;
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(t('children') || 'Children', 10, currentY);
            currentY += 10;
            addHeader();
            addGuestRows(children);
        }

        doc.save('Wedding_Seating_Arrangement.pdf');
    };

    const exportToPDFGroupedByTables = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(t('weddingSeatingArrangementGrouped'), 10, 10);

        let currentY = 30;
        const pageHeight = 280;
        const rowHeight = 8;
        const tableHeaderBaseHeight = 12;
        const marginBetweenTables = 15;

        tables.forEach((table, tableIndex) => {
            if (table.length === 0) return; // Skip empty tables

            const tableDisplayName = getTableDisplayName(tableIndex);
            const tableDisplayNumber = getTableDisplayNumber(tableIndex);
            const tableTitle = `${tableDisplayName} (Table #${tableDisplayNumber})`;
            const captain = Array.isArray(table) ? table.find(g => g.isTableCaptain) : null;
            const headerExtra = captain ? 6 : 0; // extra space for captain line
            
            // Check if we need a new page for this table
            const estimatedTableHeight = (tableHeaderBaseHeight + headerExtra) + (table.length * rowHeight) + marginBetweenTables;
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
            if (captain) {
                const label = `${t('table')} ${t('captain') || 'Captain'}`;
                const capName = `${captain.firstName || ''} ${captain.lastName || ''}`.trim();
                doc.text(`${label}: ${capName}`, 10, currentY + 14);
            }
            
            currentY += (tableHeaderBaseHeight + headerExtra) + 5;

            const adults = table.filter(g => !g.isChild);
            const children = table.filter(g => g.isChild);

            // Sort guests by last name
            adults.sort((a, b) => {
                const lastNameA = (a.lastName || '').toLowerCase();
                const lastNameB = (b.lastName || '').toLowerCase();
                return lastNameA.localeCompare(lastNameB);
            });

            children.sort((a, b) => {
                const lastNameA = (a.lastName || '').toLowerCase();
                const lastNameB = (b.lastName || '').toLowerCase();
                return lastNameA.localeCompare(lastNameB);
            });

            const addGuestRows = (guestList) => {
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                guestList.forEach((guest, guestIndex) => {
                    if (currentY + rowHeight > pageHeight) {
                        doc.addPage();
                        currentY = 20;
                    }
                    
                    const guestName = `${guestIndex + 1}. ${guest.firstName || ''} ${guest.lastName || ''}`;
                    doc.text(guestName, 15, currentY);
                    currentY += rowHeight;
                });
            };

            addGuestRows(adults);

            if (children.length > 0) {
                if (currentY + rowHeight * 2 > pageHeight) {
                    doc.addPage();
                    currentY = 20;
                }
                currentY += 5;
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text(t('children') || 'Children', 15, currentY);
                currentY += 8;
                addGuestRows(children);
            }

            currentY += marginBetweenTables;
        });

        doc.save('Wedding_Seating_Arrangement_Grouped_by_Tables.pdf');
    };

    // Add button group handlers
    const handleAddMenuToggle = () => {
        setAddMenuOpen((prevOpen) => !prevOpen);
    };

    const handleAddMenuClose = (event) => {
        if (addAnchorRef.current && addAnchorRef.current.contains(event.target)) {
            return;
        }
        setAddMenuOpen(false);
    };

    const handleAddOption = (addType) => {
        if (addType === 'guests') {
            openAddGuestsModal();
        } else if (addType === 'group') {
            openNewGroupModal();
        }
        setAddMenuOpen(false);
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

    notify.success(t('arrangementExported'));
    };

    const exportGuestTicketsToPDF = () => {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(18);
        doc.text(t('guestTicketList'), 20, 20);
        
        // Wedding name if available
        if (weddingId) {
            doc.setFontSize(14);
            doc.text(`${t('wedding')}: ${weddingId}`, 20, 35);
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
                
                const childCount = relatedGuests.filter(g => g.isChild).length;
                const adultCount = relatedGuests.length - childCount;

                guestTicketMap.set(originalId, {
                    fullName: `${originalGuest.firstName} ${originalGuest.lastName}`,
                    ticketCount: adultCount,
                    childCount: childCount
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
        doc.text('Adults', 130, 70);
        doc.text('Children', 160, 70);
        
        // Draw header line
        doc.line(20, 72, 190, 72);
        
        // Table data
        doc.setFont(undefined, 'normal');
        let yPosition = 80;
        let totalTickets = 0;
        let totalChildren = 0;
        
        guestTicketList.forEach((guest, index) => {
            // Check if we need a new page
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
                
                // Repeat headers on new page
                doc.setFont(undefined, 'bold');
                doc.text('Guest Name', 20, yPosition);
                doc.text('Adults', 130, yPosition);
                doc.text('Children', 160, yPosition);
                doc.line(20, yPosition + 2, 190, yPosition + 2);
                doc.setFont(undefined, 'normal');
                yPosition += 10;
            }
            
            doc.text(guest.fullName, 20, yPosition);
            doc.text(guest.ticketCount.toString(), 130, yPosition);
            doc.text(guest.childCount > 0 ? guest.childCount.toString() : '', 160, yPosition);
            totalTickets += guest.ticketCount;
            totalChildren += guest.childCount;
            yPosition += 7;
        });
        
        // Total line
        yPosition += 5;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;
        doc.setFont(undefined, 'bold');
        doc.text('Total Guests:', 20, yPosition);
        doc.text(guestTicketList.length.toString(), 80, yPosition);
        doc.text('Total Adults:', 100, yPosition);
        doc.text(totalTickets.toString(), 130, yPosition);
        doc.text('Total Children:', 150, yPosition);
        doc.text(totalChildren.toString(), 180, yPosition);
        
        doc.save(`${weddingId || 'wedding'}_guest_tickets.pdf`);
        
    notify.success(t('guestTicketsExported'));
    };

    // Export ticket information grouped by guest group
    const exportGuestTicketsByGroupToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text(t('guestTicketsByGroup'), 20, 20);

        // Wedding name if available
        if (weddingId) {
            doc.setFontSize(14);
            doc.text(`${t('wedding')}: ${weddingId}`, 20, 35);
        }

        // Date
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);

        const allGuests = [...guestList, ...tables.flat()];
        const guestGroupMap = new Map();

        allGuests.forEach(guest => {
            if (guest.group) {
                if (!guestGroupMap.has(guest.group)) {
                    guestGroupMap.set(guest.group, []);
                }
                guestGroupMap.get(guest.group).push(guest);
            }
        });

        let yPosition = 70;

        // Sort groups by name
        const sortedGroups = Array.from(guestGroupMap.keys()).sort();

        sortedGroups.forEach(groupName => {
            const groupGuests = guestGroupMap.get(groupName);
            const adultCount = groupGuests.filter(g => !g.isChild).length;
            const childCount = groupGuests.filter(g => g.isChild).length;

            if (yPosition > 260) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(groupName, 20, yPosition);
            yPosition += 8;

            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`${t('adults')}: ${adultCount}`, 25, yPosition);
            doc.text(`${t('children')}: ${childCount > 0 ? childCount : ''}`, 75, yPosition);
            yPosition += 10;
        });

        doc.save(`${weddingId || 'wedding'}_guest_tickets_by_group.pdf`);

    notify.success(t('guestTicketsByGroupExported'));
    };

    const downloadSampleCSV = () => {
        // Create sample CSV data with the expected format: Firstname,Lastname,Group (ID is optional)
        const sampleData = [
            'John,Doe,Family',
            'John,Doe +1,Family',
            'Jane,Smith,Family',
            'Jane,Smith +1,Family',
            'Jane,Smith +2,Family',
            'Mike,Johnson,Friends',
            'Sarah,Williams,Friends',
            'Sarah,Williams +1,Friends',
            'Robert,Brown,Colleagues',
            'Emily,Garcia,Colleagues',
            'David,Jones,Family',
            'Lisa,Davis,Friends'
        ];

        const csvContent = sampleData.join('\n');
        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample_guest_list_no_ids.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    notify.info(t('sampleCSVDownloaded'));
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
        console.log('Guests to move:', guestsToMove);
        // Save state before making changes
        if (isMultiDrag) {
            saveStateToHistory(`Moved ${guestsToMove.length} guests to table ${tableIndex + 1}`);
        } else {
            saveStateToHistory(`Moved ${guest.firstName} ${guest.lastName} to table ${tableIndex + 1}`);
        }
        
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
            // Always remove moved guests from the unseated list by id
            const movedIds = new Set(guestsToMove.map(g => String(g.id)));
            const updatedGuestList = prevGuestList.filter(unassigned => !movedIds.has(String(unassigned.id)));
            const dups = findDuplicatesById(updatedGuestList);
            if (dups.length) {
                logSeating('After handleDrop - duplicates detected (pre-dedupe)', {
                    duplicates: dups,
                    guestToMoveIds: guestsToMove.map(g => g.id),
                    before: summarizeIds(prevGuestList),
                    after: summarizeIds(updatedGuestList)
                });
            } else {
                logSeating('After handleDrop - no duplicates', {
                    guestToMoveIds: guestsToMove.map(g => g.id),
                    before: summarizeIds(prevGuestList),
                    after: summarizeIds(updatedGuestList)
                });
            }
            return dedupeGuests(updatedGuestList);
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
            
            // Save state before making changes
            if (isMultiDrag) {
                saveStateToHistory(`Unassigned ${guestsToMove.length} guests from tables`);
            } else {
                saveStateToHistory(`Unassigned ${guest.firstName} ${guest.lastName} from table ${fromTableIndex + 1}`);
            }
            
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
                console.log(prevGuestList);
                const cleaned = guestsToMove.map(g => {
                    const { fromTableIndex, ...cleanGuest } = g;
                    return { ...cleanGuest, isTableCaptain: false };
                });
                return addGuestsUnique(prevGuestList, cleaned);
            });

            if (isMultiDrag) {
                setSelectedGuests(new Set());
            }
        }
    };

    const handleRemove = (guest, tableIndex) => {
        // Save state before making changes
        saveStateToHistory(`Removed ${guest.firstName} ${guest.lastName} from table ${tableIndex + 1}`);
        
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[tableIndex] = updatedTables[tableIndex].filter(assigned => assigned.id !== guest.id);
            return updatedTables;
        });

            setGuestList(prevGuestList => {
                const merged = addGuestsUnique(prevGuestList, { ...guest, isTableCaptain: false });
                const { guestList: normalized } = normalizeGuestData(merged, tables);
                return normalized;
            });
    };

    // Clear all guests from a specific table
    const handleClearTable = (tableIndex) => {
        // First, get the guests from the table that need to be moved
        const guestsToMove = tables[tableIndex];
        
        if (guestsToMove.length === 0) {
            return; // Nothing to clear
        }
        
        // Save state before making changes
        saveStateToHistory(`Cleared all ${guestsToMove.length} guests from table ${tableIndex + 1}`);
        
        // Clear the table
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[tableIndex] = [];
            return updatedTables;
        });
        
        // Then add all guests back to guest list
        setGuestList(prevGuestList => {
            const reset = guestsToMove.map(g => ({ ...g, isTableCaptain: false }));
            const merged = addGuestsUnique(prevGuestList, reset);
            const { guestList: normalized } = normalizeGuestData(merged, tables);
            return normalized;
        });
    };

    // Add a new empty table
    const handleAddTable = () => {
        const defaultTableSize = getTableSize();
        
        setTables(prevTables => [...prevTables, []]);
        
        // Also update table aliases, sizes, and numbers to match the new table count
        setTableAliases(prevAliases => ({
            ...prevAliases,
            [tables.length]: `Table ${tables.length + 1}`
        }));
        
        setTableSizes(prevSizes => ({
            ...prevSizes,
            [tables.length]: defaultTableSize // Use the default table size from configuration
        }));
        
        setTableNumbers(prevNumbers => ({
            ...prevNumbers,
            [tables.length]: tables.length + 1
        }));
        
        saveStateToHistory(`Added new table ${tables.length + 1}`);
    };

    /*const handleReassign = (guest, fromTableIndex, toTableIndex) => {
        setTables(prevTables => {
            const updatedTables = [...prevTables];
            updatedTables[fromTableIndex] = updatedTables[fromTableIndex].filter(assigned => assigned.id !== guest.id);
            updatedTables[toTableIndex] = [...updatedTables[toTableIndex], guest];
            return updatedTables;
        });
    };*/
    // (Legacy) getTotalTickets removed; sequencing now handled via explicit plusOneSequence / childSequence fields.

    // All guests can now have plus ones since IDs are GUIDs
    const canAddPlusOne = () => true;
    const handleAddPlusOne = (guest) => {
        saveStateToHistory(`Added +1 for ${guest.firstName} ${guest.lastName}`);
        const allGuests = [...guestList, ...tables.flat()];
        const existingIds = new Set(allGuests.map(g => String(g.id)));
        const existingPlusOnes = allGuests.filter(g => g.originalGuestId === guest.id && !g.isChild).length;
        const plusOne = {
            firstName: `${guest.firstName}`,
            lastName: `${guest.lastName} +1`,
            group: guest.group,
            originalGuestId: guest.id,
            plusOneSequence: existingPlusOnes + 1,
            id: generateUniqueGuestId(existingIds)
        };
        setGuestList(prevGuestList => addGuestsUnique(prevGuestList, plusOne));
        updateTables(guestList.length + 1);
        setHasUnsavedChanges(true);
    };

    const handleAddChild = (guest) => {
        saveStateToHistory(`Added child for ${guest.firstName} ${guest.lastName}`);
        const allGuests = [...guestList, ...tables.flat()];
        const existingIds = new Set(allGuests.map(g => String(g.id)));
        const existingChildren = allGuests.filter(g => g.originalGuestId === guest.id && g.isChild).length;
        const childGuest = {
            firstName: `${guest.firstName} ${guest.lastName}'s`,
            lastName: `child`,
            group: guest.group,
            originalGuestId: guest.id,
            childSequence: existingChildren + 1,
            isChild: true,
            id: generateUniqueGuestId(existingIds)
        };
        setGuestList(prevGuestList => addGuestsUnique(prevGuestList, childGuest));
        updateTables(guestList.length + 1);
        setHasUnsavedChanges(true);
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

    const handleSelectGroup = (groupName, groupGuests) => {
        const groupGuestIds = groupGuests.map(guest => guest.id);
        const allGroupGuestsSelected = groupGuestIds.every(id => selectedGuests.has(id));
        
        setSelectedGuests(prevSelected => {
            const updatedSelected = new Set(prevSelected);
            
            if (allGroupGuestsSelected) {
                // Deselect all guests in this group
                groupGuestIds.forEach(id => updatedSelected.delete(id));
            } else {
                // Select all guests in this group
                groupGuestIds.forEach(id => updatedSelected.add(id));
            }
            
            return updatedSelected;
        });
    };

    const isGroupSelected = (groupGuests) => {
        const groupGuestIds = groupGuests.map(guest => guest.id);
        return groupGuestIds.length > 0 && groupGuestIds.every(id => selectedGuests.has(id));
    };

    const isGroupPartiallySelected = (groupGuests) => {
        const groupGuestIds = groupGuests.map(guest => guest.id);
        const selectedCount = groupGuestIds.filter(id => selectedGuests.has(id)).length;
        return selectedCount > 0 && selectedCount < groupGuestIds.length;
    };

    const removeSelectedGuests = () => {
        if (selectedGuests.size > 0) {
            saveStateToHistory(`Deleted ${selectedGuests.size} guest(s) from guest list`);
        }
        setGuestList(prevGuestList => {
            const filtered = prevGuestList.filter(guest => !selectedGuests.has(guest.id));
            logSeating('After removeSelectedGuests', {
                removedIds: Array.from(selectedGuests),
                before: summarizeIds(prevGuestList),
                after: summarizeIds(filtered),
                duplicates: findDuplicatesById(filtered)
            });
            return filtered;
        });
        setSelectedGuests(new Set());
        setContextMenu({ visible: false, x: 0, y: 0 }); // Hide context menu
        setHasUnsavedChanges(true);
    };

    // Guest Manager handlers
    const handleManagerAddPlusOne = (originalId) => {
        const primary = [...guestList, ...tables.flat()].find(g => g.id === originalId);
        if (primary) {
            handleAddPlusOne(primary);
        }
    };

    const handleManagerAddChild = (originalId) => {
        const primary = [...guestList, ...tables.flat()].find(g => g.id === originalId);
        if (primary) {
            handleAddChild(primary);
        }
    };

    const handleManagerRenameGuest = (originalId, newFirst, newLast) => {
        // Rename the primary guest only
        setGuestList(prev => prev.map(g => String(g.id) === String(originalId) ? { ...g, firstName: newFirst, lastName: newLast } : g));
        setTables(prev => prev.map(t => t.map(g => String(g.id) === String(originalId) ? { ...g, firstName: newFirst, lastName: newLast } : g)));
        saveStateToHistory(`Renamed guest to ${newFirst} ${newLast}`);
        setHasUnsavedChanges(true);
    };

    const handleManagerDeleteGuest = (originalId) => {
        saveStateToHistory(`Deleted guest ${originalId} and their tickets`);
        setGuestList(prev => prev.filter(g => String(g.id) !== String(originalId) && String(g.originalGuestId) !== String(originalId)));
        setTables(prev => prev.map(t => t.filter(g => String(g.id) !== String(originalId) && String(g.originalGuestId) !== String(originalId))));
        setHasUnsavedChanges(true);
    };

    const handleManagerAddGuest = ({ firstName, lastName, group }) => {
        const allGuests = [...guestList, ...tables.flat()];
        const existingIds = new Set(allGuests.map(g => String(g.id)));
        const newGuest = { id: generateUniqueGuestId(existingIds), firstName, lastName, group: group || 'Ungrouped' };
        saveStateToHistory(`Added guest ${firstName} ${lastName}`);
        const grp = (group || 'Ungrouped').trim();
        if (grp && !getUniqueGroups().includes(grp)) {
            setCustomGroups(prev => {
                const set = new Set(prev || []);
                set.add(grp);
                return Array.from(set);
            });
        }
        setGuestList(prev => addGuestsUnique(prev, newGuest));
        updateTables(guestList.length + 1);
        setHasUnsavedChanges(true);
    };

    const handleManagerChangeGroup = (originalId, newGroupName) => {
        const trimmed = (newGroupName || '').trim();
        if (!trimmed) return;
        saveStateToHistory(`Changed group of guest ${originalId} to "${trimmed}"`);
        // Persist the group if it's new
        if (!getUniqueGroups().includes(trimmed)) {
            setCustomGroups(prev => {
                const set = new Set(prev || []);
                set.add(trimmed);
                return Array.from(set);
            });
        }
        // Update only the primary guest's group (plus ones keep their group inherited visually)
    setGuestList(prev => prev.map(g => String(g.id) === String(originalId) ? { ...g, group: trimmed } : g));
    setTables(prev => prev.map(t => t.map(g => String(g.id) === String(originalId) ? { ...g, group: trimmed } : g)));
        setHasUnsavedChanges(true);
    };

    const handleContextMenu = (e, guestId = null) => {
        e.preventDefault();
        
        // If a specific guest was right-clicked and it's not selected, select it
        if (guestId && !selectedGuests.has(guestId)) {
            setSelectedGuests(new Set([guestId]));
        }
        
        // Show context menu if at least one guest is selected (or will be selected)
        if (selectedGuests.size >= 1 || guestId) {
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

    const getUniqueGroups = () => {
        // Merge persisted custom groups with groups inferred from current guests
        const groups = new Set(Array.isArray(customGroups) ? customGroups : []);
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
        const trimmed = (newGroup || '').trim();
        if (!trimmed) return;

        saveStateToHistory(`Changed group for ${selectedGuests.size} guest(s) to "${trimmed}"`);
        setGuestList(prevGuestList =>
            prevGuestList.map(guest =>
                selectedGuests.has(guest.id)
                    ? { ...guest, group: trimmed }
                    : guest
            )
        );

        setTables(prevTables =>
            prevTables.map(table =>
                table.map(guest =>
                    selectedGuests.has(guest.id)
                        ? { ...guest, group: trimmed }
                        : guest
                )
            )
        );

        setSelectedGuests(new Set());
        hideContextMenu();
        setHasUnsavedChanges(true);
        
    notify.success(`Successfully changed group for ${selectedGuests.size} guest(s) to "${trimmed}"`);
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
        const name = newGroupName.trim();
        if (!name) return;

        // Always add to custom groups
        setCustomGroups(prev => {
            const set = new Set(prev || []);
            set.add(name);
            return Array.from(set);
        });
    setHasUnsavedChanges(true);

        // If there are selected guests, move them to the new group
        if (selectedGuests.size > 0) {
            changeGuestGroup(name);
        }

        closeNewGroupModal();
    };

    const openEditModal = (guestId, currentFirstName, currentLastName = '') => {
        setEditingGuest(guestId);
        setEditFirstName(currentFirstName.replace(' +1', ''));
        setEditLastName(currentLastName);
        // Determine if guest is currently seated and their captain status
        let tableIdx = null;
        let isCaptain = false;
        tables.forEach((table, idx) => {
            if (Array.isArray(table)) {
                const found = table.find(g => String(g.id) === String(guestId));
                if (found) {
                    tableIdx = idx;
                    isCaptain = !!found.isTableCaptain;
                }
            }
        });
        setEditingGuestTableIndex(tableIdx);
        setEditIsTableCaptain(isCaptain);
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
                    ? { ...guest, firstName: editFirstName.trim(), lastName: editLastName.trim(), isTableCaptain: editIsTableCaptain && editingGuestTableIndex !== null ? true : false }
                    : guest
            )
        );

        setTables(prevTables => {
            return prevTables.map((table, idx) => {
                if (!Array.isArray(table)) return table;
                if (idx !== editingGuestTableIndex) {
                    // If setting captain on another table, ensure others unaffected
                    return table.map(g =>
                        g.id === editingGuest
                            ? { ...g, firstName: editFirstName.trim(), lastName: editLastName.trim() }
                            : g
                    );
                }
                // Enforce single captain per table when applicable
                return table.map(g => {
                    if (String(g.id) === String(editingGuest)) {
                        return { ...g, firstName: editFirstName.trim(), lastName: editLastName.trim(), isTableCaptain: !!editIsTableCaptain };
                    }
                    // If our target is captain, clear others; otherwise leave as-is
                    return editIsTableCaptain ? { ...g, isTableCaptain: false } : g;
                });
            });
        });

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

    // Removed legacy getNextGuestId; GUID generation used directly.

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

    const handleLanguageChange = (newLanguage) => {
        setCurrentLanguage(newLanguage);
        console.log('Language changed to:', newLanguage);
        // Here you can add additional logic when language changes
        // such as updating text labels, date formats, etc.
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
            notify.warning(t('pleaseAddGuest'));
            return;
        }

        const allGuests = [...guestList, ...tables.flat()];
        const existingIds = new Set(allGuests.map(g => String(g.id)));
        const guestsToAdd = validGuests.map(guest => {
            const id = generateUniqueGuestId(existingIds);
            existingIds.add(id);
            return {
                firstName: guest.firstName.trim(),
                lastName: guest.lastName.trim(),
                group: guest.group.trim() || 'Ungrouped',
                id
            };
        });

    saveStateToHistory(`Added ${guestsToAdd.length} guest(s)`);
    setGuestList(prevGuestList => [...prevGuestList, ...guestsToAdd]);
        updateTables(guestList.length + guestsToAdd.length);
    setHasUnsavedChanges(true);
        
    notify.success(t('guestAdded', { count: guestsToAdd.length }));
        
        closeAddGuestsModal();
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
                            const seq = guest.plusOneSequence || guest.childSequence || 0;
                            return `${guest.originalGuestId}-${seq.toString().padStart(3, '0')}`;
                        } else {
                            return `${guest.id}-000`;
                        }
                    };
                    return getGuestOrder(a).localeCompare(getGuestOrder(b));
                });
            }
            return sortedGroups.map(groupName => (
                <div key={groupName} style={{ marginBottom: '20px' }}>
                    <h3 
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
                        <input
                            type="checkbox"
                            checked={isGroupSelected(groupedGuests[groupName])}
                            ref={checkbox => {
                                if (checkbox) {
                                    checkbox.indeterminate = isGroupPartiallySelected(groupedGuests[groupName]);
                                }
                            }}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleSelectGroup(groupName, groupedGuests[groupName]);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                                marginRight: '8px',
                                cursor: 'pointer',
                                transform: 'scale(1.2)'
                            }}
                        />
                        <span 
                            onClick={() => toggleGroupCollapse(groupName)}
                            style={{ 
                                fontSize: '16px', 
                                fontWeight: 'bold',
                                color: '#2196f3',
                                transition: 'transform 0.2s ease',
                                transform: collapsedGroups.has(groupName) ? 'rotate(0deg)' : 'rotate(90deg)',
                                cursor: 'pointer'
                            }}
                        >
                            ▶
                        </span>
                        <span 
                            onClick={() => toggleGroupCollapse(groupName)}
                            style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', cursor: 'pointer' }}
                        >
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
                                    onContextMenu={(e) => handleContextMenu(e, guest.id)}
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
                                        {canAddPlusOne(guest.id) && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleAddChild(guest)}
                                                style={{ marginLeft: '10px' }}
                                                className=''
                                            >
                                                <Icon>child_friendly</Icon>
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
                            const seq = guest.plusOneSequence || guest.childSequence || 0;
                            return `${guest.originalGuestId}-${seq.toString().padStart(3, '0')}`;
                        } else {
                            return `${guest.id}-000`;
                        }
                    };
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
                                        firstName: `${selectedGuests.size} ${t('guests')}`,
                                        lastName: ''
                                    }));
                                } else {
                                    // Single guest drag
                                    e.dataTransfer.setData('guest', JSON.stringify(guest));
                                }
                            }}
                            onContextMenu={(e) => handleContextMenu(e, guest.id)}
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
                                    onClick={() => handleAddChild(guest)}
                                    color="primary"
                                    size="small"
                                    title="Add Child"
                                >
                                    <ChildFriendlyIcon />
                                </IconButton>
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

    // Calculate total seated guests
    const totalSeatedGuests = tables.flat().length;

    return (
        <div>
            {/* Loading Overlay */}
            {isLoading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                    color: 'white',
                    fontSize: '1.2rem'
                }}>
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            Loading...
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="loading-spinner" style={{
                                border: '4px solid #f3f3f3',
                                borderTop: '4px solid #3498db',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                animation: 'spin 2s linear infinite',
                                margin: '0 auto'
                            }}></div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Top Action Bar */}
                <TopActionBar
                    onSave={saveArrangement}
                    onExportAlphabetical={exportToPDF}
                    onExportGrouped={exportToPDFGroupedByTables}
                    onExportTickets={exportGuestTicketsToPDF}
                    onExportTicketsByGroup={exportGuestTicketsByGroupToPDF}
                    onUndo={performUndo}
                    canUndo={undoHistory.length > 0}
                    hasUnsavedChanges={hasUnsavedChanges}
                    currentLanguage={currentLanguage}
                    isDisabled={isLoading}
                    totalSeatedGuests={totalSeatedGuests}
                />
            <div style={{ display: 'flex' }} onClick={hideContextMenu}>
            {/* Configuration Modal Component */}
                    <ConfigurationModal
                        onExportToJSON={exportToJSON}
                        onDeleteArrangement={deleteArrangement}
                        onCSVImport={handleCSVImport}
                        onDownloadSampleCSV={downloadSampleCSV}
                        onLanguageChange={handleLanguageChange}
                        currentLanguage={currentLanguage}
                        weddingId={weddingId}
                        existingGuests={guestList}
                        existingTables={tables}
                    />            {/* Context Menu */}
            <ContextMenu
                visible={contextMenu.visible}
                x={contextMenu.x}
                y={contextMenu.y}
                selectedGuestsSize={selectedGuests.size}
                uniqueGroups={getUniqueGroups()}
                onDeleteGuests={removeSelectedGuests}
                onChangeGroup={changeGuestGroup}
                onOpenNewGroupModal={openNewGroupModal}
                onHide={hideContextMenu}
                currentLanguage={currentLanguage}
            />
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
                        {t('addGuests')}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                        {t('addGuestsInstructions')}
                    </Typography>
                    
                    <div style={{ height: 400, width: '100%', marginBottom: '16px' }}>
                        <DataGrid
                            rows={newGuestsData}
                            columns={[
                                {
                                    field: 'firstName',
                                    headerName: t('firstName'),
                                    width: 200,
                                    editable: true,
                                },
                                {
                                    field: 'lastName',
                                    headerName: t('lastName'),
                                    width: 200,
                                    editable: true,
                                },
                                {
                                    field: 'group',
                                    headerName: t('group'),
                                    width: 200,
                                    editable: true,
                                    type: 'singleSelect',
                                    valueOptions: getUniqueGroups().map(group => group || 'Ungrouped'),
                                },
                                {
                                    field: 'actions',
                                    headerName: t('actions'),
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
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={saveNewGuests}
                            color="primary"
                        >
                            {t('addGuests')}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Guest Manager Modal */}
            <GuestManagerModal
                open={showGuestManager}
                onClose={() => setShowGuestManager(false)}
                currentLanguage={currentLanguage}
                allGuests={[...guestList, ...tables.flat()]}
                onAddPlusOne={handleManagerAddPlusOne}
                onAddChild={handleManagerAddChild}
                onRenameGuest={handleManagerRenameGuest}
                onDeleteGuest={handleManagerDeleteGuest}
                onAddGuest={handleManagerAddGuest}
                onChangeGroup={handleManagerChangeGroup}
                groups={getUniqueGroups()}
            />

            {/* Edit Guest Modal */}
            <Modal
                open={editModalOpen}
                onClose={closeEditModal}
                aria-labelledby="edit-guest-modal-title"
                aria-describedby="edit-guest-modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="edit-guest-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                        {t('editGuest')} {t('info')}
                    </Typography>
                    <TextField
                        fullWidth
                        label={t('firstName')}
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label={t('lastName')}
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                    {editingGuestTableIndex !== null && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '8px' }}>
                            <input
                                type="checkbox"
                                checked={!!editIsTableCaptain}
                                onChange={(e) => setEditIsTableCaptain(e.target.checked)}
                            />
                            <span>{t('table')} {t('captain') || 'Capitán de mesa'}</span>
                        </label>
                    )}
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={closeEditModal}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={saveGuestEdit}
                            disabled={!editFirstName.trim()}
                        >
                            {t('save')}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <div className="guestList"
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverGuestList(true);
                }}
                onDragLeave={(e) => {
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
                            <ButtonGroup 
                                variant="contained" 
                                color="success"
                                ref={addAnchorRef}
                                aria-label="Add options"
                                size="small"
                            >
                                <Button 
                                    onClick={handleAddMenuToggle}
                                    className='add-guests-button'
                                >
                                    ➕
                                </Button>
                            </ButtonGroup>
                            <Popper
                                sx={{ zIndex: 1000 }}
                                open={addMenuOpen}
                                anchorEl={addAnchorRef.current}
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
                                        <Paper 
                                            sx={{ 
                                                backgroundColor: 'white',
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                border: '1px solid #e0e0e0',
                                                opacity: 1
                                            }}
                                        >
                                            <ClickAwayListener onClickAway={handleAddMenuClose}>
                                                <MenuList 
                                                    id="add-split-button-menu" 
                                                    autoFocusItem
                                                    sx={{ 
                                                        backgroundColor: 'white',
                                                        opacity: 1,
                                                        minWidth: 120
                                                    }}
                                                >
                                                    <MenuItem 
                                                        onClick={() => handleAddOption('guests')}
                                                        sx={{ 
                                                            backgroundColor: 'white',
                                                            color: '#333',
                                                            opacity: 1,
                                                            '&:hover': {
                                                                backgroundColor: '#f5f5f5'
                                                            }
                                                        }}
                                                    >
                                                        {t('addGuests')}
                                                    </MenuItem>
                                                    <MenuItem 
                                                        onClick={() => handleAddOption('group')}
                                                        sx={{ 
                                                            backgroundColor: 'white',
                                                            color: '#333',
                                                            opacity: 1,
                                                            '&:hover': {
                                                                backgroundColor: '#f5f5f5'
                                                            }
                                                        }}
                                                    >
                                                        {t('addGroup')}
                                                    </MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </div>
                        
                        <div className="button-row">
                            <Button
                                variant="contained"
                                color="info"
                                onClick={toggleViewMode}
                                className='switch-button'
                                size="small"
                            >
                                {viewMode === 'visual' ? <ListAltIcon /> : <TableBarIcon />}
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={removeSelectedGuests}
                                className='delete-button'
                                size="small"
                            >
                                <PersonRemoveIcon />
                            </Button>
                            <Button
                            variant="outlined"
                            onClick={() => setShowGuestManager(true)}
                            size="small"
                            className='guest-manager-button'
                        >
                            <GroupIcon />
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
                            {t('groupGuests')}
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
                                {getUniqueGroups().every(group => collapsedGroups.has(group)) ? t('expandAll') : t('collapseAll')}
                            </Button>
                        )}
                    </div>
                    
                    {/* Search Field */}
                    <div style={{ marginBottom: '15px' }}>
                        <TextField
                            fullWidth
                            size="small"
                            label={t('searchGuests')}
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
                    <p className="guest-list-stats">{t('remainingGuests')}: {guestList.length}</p>

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
                            <strong>{selectedGuests.size} {t('guestsSelected')}</strong> - {t('dragToMoveMessage')}
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
                            🔄 {t('dropToUnassign')}
                        </div>
                    )}
                    {renderGuestList()}
                </div>
            </div>
            <TableList
                viewMode={viewMode}
                tables={tables}
                editingTable={editingTable}
                highlightSearchTerm={highlightSearchTerm}
                onDrop={handleDrop}
                tableHasMatchingGuest={tableHasMatchingGuest}
                getTableDisplayName={getTableDisplayName}
                getTableDisplayNumber={getTableDisplayNumber}
                getTableDisplaySize={getTableDisplaySize}
                onTableEditClick={handleTableEditClick}
                onTableEditComplete={handleTableEditComplete}
                onTableAliasChange={handleTableAliasChange}
                onTableNumberChange={handleTableNumberChange}
                onTableSizeChange={handleTableSizeChange}
                onClearTable={handleClearTable}
                onAddTable={handleAddTable}
                onEditGuest={openEditModal}
                onRemoveGuest={handleRemove}
                currentLanguage={currentLanguage}
            />
            </div>
        </div>
    );
}

export default SeatingCanvas;


