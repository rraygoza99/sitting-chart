// English translations dictionary
export const englishTranslations = {
    // General
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'remove': 'Remove',
    'close': 'Close',
    'settings': 'Settings',
    'configuration': 'Configuration',
    'arrangement': 'Arrangement',
    'export': 'Export',
    'import': 'Import',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'warning': 'Warning',
    'info': 'Information',
    'information': 'Information',
    'yes': 'Yes',
    'no': 'No',
    'ok': 'OK',
    'search': 'Search',
    'home': 'Home',
    'undo': 'Undo',
    
    // Navigation and Actions
        // Navigation
    'goToHome': 'Go to Home',
    'unsavedChangesTitle': 'Unsaved Changes',
    'unsavedChangesMessage': 'You have unsaved changes. Are you sure you want to leave without saving?',
    'leaveWithoutSaving': 'Leave Without Saving',
    'undoLastAction': 'Undo last table assignment',
    'saveArrangement': 'Save Arrangement',
    'exportToPDF': 'Export to PDF',
    'configurationSettings': 'Configuration Settings',
    
    // Wedding Seating
    'weddingSeatingArrangement': 'Wedding Seating Arrangement',
    'weddingSeatingArrangementGrouped': 'Wedding Seating Arrangement - Grouped by Tables',
    'guestList': 'Guest List',
    'tableAssignments': 'Table Assignments',
    'visualView': 'Visual View',
    'listView': 'List View',
    'viewMode': 'View Mode',
    'grouped': 'Grouped',
    'ungrouped': 'Ungrouped',
    
    // Guest Management
    'guests': 'Guests',
    'guest': 'Guest',
    'addGuest': 'Add Guest',
    'addGuests': 'Add Guests',
    'addGroup': 'Add Group',
    'editGuest': 'Edit Guest',
    'removeGuest': 'Remove Guest',
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'fullName': 'Full Name',
    'group': 'Group',
    'table': 'Table',
    'tableNumber': 'Table #',
    'addNewTable': 'Add New Table',
    'seated': 'Seated',
    'current': 'Current',
    'totalGuests': 'Total Guests',
    'selectedGuests': 'Selected Guests',
    'unassignedGuests': 'Unassigned Guests',
    'assignedGuests': 'Assigned Guests',
    
    // Tables
    'tables': 'Tables',
    'tableSettings': 'Table Settings',
    'defaultTableSize': 'Default Table Size',
    'tableSize': 'Table Size',
    'tableName': 'Table Name',
    'seatedGuests': 'Seated Guests',
    'maxCapacity': 'Max Capacity',
    'clearTable': 'Clear Table',
    'emptyTable': 'Empty Table',
    'addTable': 'Add Table',
    'removeTable': 'Remove Table',
    'numberSeatsPerTable': 'Number of seats per table (default: 10)',
    
    // Actions and Buttons
    'actions': 'Actions',
    'addNewGroup': 'Add New Group',
    'createNewGroup': 'Create New Group',
    'changeGroup': 'Change Group',
    'groupName': 'Group Name',
    'newGroupName': 'New Group Name',
    'addPlusOne': 'Add +1',
    'addRow': 'Add Row',
    'removeRow': 'Remove Row',
    'collapseAll': 'Collapse All',
    'expandAll': 'Expand All',
    'selectAll': 'Select All',
    'clearSelection': 'Clear Selection',
    
    // Export Options
    'exportOptions': 'Export Options',
    'alphabeticalList': 'Alphabetical List',
    'groupedByTables': 'Grouped by Tables',
    'exportTickets': 'Export Tickets',
    'exportTicketsByGroup': 'Export Tickets by Group',
    'exportToJSON': 'Export to JSON',
    'downloadSampleCSV': 'Download Sample CSV',
    
    // CSV Import
    'csvImport': 'CSV Import',
    'importFromCSV': 'Import from CSV',
    'selectCSVFile': 'Select CSV File',
    'csvFormat': 'CSV Format',
    'csvFormatHelp': 'Import guests from CSV file (Format: firstName,lastName,group).',
    'sampleCSVDownloaded': 'Sample CSV downloaded successfully!',
    'importSuccessful': 'Successfully imported {count} guests!',
    
    // Language Settings
    'languageSettings': 'Language Settings',
    'english': 'English',
    'spanish': 'Español',
    'switchLanguage': 'Switch between English and Spanish interface language.',
    
    // Modal Titles and Messages
    'configurationSettingsTitle': 'Configuration Settings',
    'configureSeatingSettings': 'Configure your seating arrangement settings here.',
    'addGuestsModalTitle': 'Add Guests',
    'editGuestModalTitle': 'Edit Guest',
    'addGuestsInstructions': 'Double click in the row to start editing',
    'arrangementActions': 'Arrangement Actions',
    'currentArrangement': 'Current arrangement: {name}',
    'noArrangementSelected': 'No arrangement selected',
    
    // Success Messages
    'arrangementSaved': 'Arrangement saved successfully!',
    'arrangementDeleted': 'Arrangement deleted successfully!',
    'arrangementExported': 'Arrangement exported to JSON successfully!',
    'guestAdded': 'Successfully added {count} guest(s)',
    'guestRemoved': 'Guest removed successfully!',
    'guestEdited': 'Guest updated successfully!',
    'groupChanged': 'Successfully changed group for {count} guest(s) to "{group}"',
    'guestTicketsExported': 'Guest ticket list exported to PDF successfully!',
    
    // Error Messages
    'errorLoadingConfiguration': 'Error loading configuration',
    'errorSavingArrangement': 'Error saving arrangement',
    'errorImportingCSV': 'Error importing CSV file',
    'noValidGuestsFound': 'No valid guests found in CSV. Please check the format:\nfirstName,lastName,group (ID is optional)',
    'pleaseAddGuest': 'Please add at least one guest with first and last name',
    'noActionsToUndo': 'No actions to undo',
    
    // Undo Actions
    'undoAction': 'Undid: {action}',
    'movedGuestToTable': 'Moved {guest} to table {table}',
    'movedGuestsToTable': 'Moved {count} guests to table {table}',
    'unassignedGuest': 'Unassigned {guest} from table {table}',
    'unassignedMultipleGuests': 'Unassigned {count} guests from tables',
    'removedGuestFromTable': 'Removed {guest} from table {table}',
    'clearedTable': 'Cleared all {count} guests from table {table}',
    
    // PDF Export
    'weddingSeatingPDF': 'Wedding Seating Arrangement',
    'guestName': 'Guest Name',
    'tickets': 'Tickets',
    'totalTickets': 'Total Tickets',
    'generated': 'Generated',
    'wedding': 'Wedding',
    'guestTicketList': 'Guest Ticket List',
    'guestTicketListByGroup': 'Guest Ticket List by Group',
    'guestTicketsByGroupExported': 'Guest tickets by group exported to PDF successfully!',
    'total': 'Total',
    
    // Search and Filtering
    'searchGuests': 'Search guests...',
    'searchResults': 'Search Results',
    'noSearchResults': 'No guests found matching your search',
    'guestsCount': '{count} guests',
    'remainingGuests': 'Remaining Guests',
    'groupGuests': 'Group Guests',
    'guestsSelected': 'guests selected',
    'dragToMoveMessage': 'Drag any selected guest to move all together',
    
    // Context Menu
    'editGuestName': 'Edit guest name',
    'moveToGroup': 'Move to group',
    'removeFromTable': 'Remove from table',
    'assignToTable': 'Assign to table',
    
    // Validation
    'firstNameRequired': 'First name is required',
    'lastNameRequired': 'Last name is required',
    'groupNameRequired': 'Group name is required',
    'tableSizeMinimum': 'Table size must be at least 1',
    'tableSizeMaximum': 'Table size cannot exceed 20',
    
    // Drag and Drop
    'dragGuestToTable': 'Drag guest to assign to table',
    'dragGuestToUnassign': 'Drag guest here to unassign from table',
    'dropZone': 'Drop zone',
    'dropToUnassign': 'Drop here to unassign from table',
    
    // Status Messages
    'readyToImport': 'Ready to import',
    'processing': 'Processing...',
    'complete': 'Complete',
    'failed': 'Failed',
    
    // Accessibility
    'ariaLabelPDFExport': 'PDF export options',
    'ariaLabelConfiguration': 'Configuration settings',
    'ariaLabelSearch': 'Search guests',
    'ariaLabelGuestCheckbox': 'Select guest',
    'ariaLabelGroupCheckbox': 'Select all guests in group',
};

export default englishTranslations;
