// Spanish translations dictionary
export const spanishTranslations = {
    // General
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'add': 'Agregar',
    'remove': 'Remover',
    'close': 'Cerrar',
    'settings': 'Configuración',
    'configuration': 'Configuración',
    'arrangement': 'Arreglo',
    'export': 'Exportar',
    'import': 'Importar',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'warning': 'Advertencia',
    'info': 'Información',
    'information': 'Información',
    'yes': 'Sí',
    'no': 'No',
    'ok': 'OK',
    'search': 'Buscar',
    'home': 'Inicio',
    'undo': 'Deshacer',
    
    // Navigation and Actions
    'goToHome': 'Ir al Inicio',
    'undoLastAction': 'Deshacer última asignación de mesa',
    'saveArrangement': 'Guardar Arreglo',
    'exportToPDF': 'Exportar a PDF',
    'configurationSettings': 'Configuración del Sistema',
    
    // Wedding Seating
    'weddingSeatingArrangement': 'Arreglo de Asientos de Boda',
    'weddingSeatingArrangementGrouped': 'Arreglo de Asientos de Boda - Agrupado por Mesas',
    'guestList': 'Lista de Invitados',
    'tableAssignments': 'Asignaciones de Mesa',
    'visualView': 'Vista Visual',
    'listView': 'Vista de Lista',
    'viewMode': 'Modo de Vista',
    'grouped': 'Agrupado',
    'ungrouped': 'Sin Agrupar',
    
    // Guest Management
    'guests': 'Invitados',
    'guest': 'Invitado',
    'addGuest': 'Agregar Invitado',
    'addGuests': 'Agregar Invitados',
    'addGroup': 'Agregar Grupo',
    'editGuest': 'Editar Invitado',
    'removeGuest': 'Remover Invitado',
    'firstName': 'Nombre',
    'lastName': 'Apellido',
    'fullName': 'Nombre Completo',
    'group': 'Grupo',
    'table': 'Mesa',
    'tableNumber': 'Mesa #',
    'addNewTable': 'Agregar Nueva Mesa',
    'seated': 'Sentados',
    'current': 'Actual',
    'totalGuests': 'Total de Invitados',
    'selectedGuests': 'Invitados Seleccionados',
    'unassignedGuests': 'Invitados Sin Asignar',
    'assignedGuests': 'Invitados Asignados',
    
    // Tables
    'tables': 'Mesas',
    'tableSettings': 'Configuración de Mesas',
    'defaultTableSize': 'Tamaño de Mesa Predeterminado',
    'tableSize': 'Tamaño de Mesa',
    'tableName': 'Nombre de Mesa',
    'seatedGuests': 'Invitados Sentados',
    'maxCapacity': 'Capacidad Máxima',
    'clearTable': 'Limpiar Mesa',
    'emptyTable': 'Mesa Vacía',
    'addTable': 'Agregar Mesa',
    'removeTable': 'Remover Mesa',
    'numberSeatsPerTable': 'Número de asientos por mesa (predeterminado: 10)',
    
    // Actions and Buttons
    'actions': 'Acciones',
    'addNewGroup': 'Agregar Nuevo Grupo',
    'createNewGroup': 'Crear Nuevo Grupo',
    'changeGroup': 'Cambiar Grupo',
    'groupName': 'Nombre del Grupo',
    'newGroupName': 'Nuevo Nombre del Grupo',
    'addPlusOne': 'Agregar +1',
    'addRow': 'Agregar Fila',
    'removeRow': 'Remover Fila',
    'collapseAll': 'Colapsar Todo',
    'expandAll': 'Expandir Todo',
    'selectAll': 'Seleccionar Todo',
    'clearSelection': 'Limpiar Selección',
    
    // Export Options
    'exportOptions': 'Opciones de Exportación',
    'alphabeticalList': 'Lista Alfabética',
    'groupedByTables': 'Agrupado por Mesas',
    'exportTickets': 'Exportar Boletos',
    'exportToJSON': 'Exportar a JSON',
    'downloadSampleCSV': 'Descargar CSV de Muestra',
    
    // CSV Import
    'csvImport': 'Importar CSV',
    'importFromCSV': 'Importar desde CSV',
    'selectCSVFile': 'Seleccionar Archivo CSV',
    'csvFormat': 'Formato CSV',
    'csvFormatHelp': 'Importar invitados desde archivo CSV (Formato: nombre,apellido,grupo).',
    'sampleCSVDownloaded': '¡CSV de muestra descargado exitosamente!',
    'importSuccessful': '¡Se importaron exitosamente {count} invitados!',
    
    // Language Settings
    'languageSettings': 'Configuración de Idioma',
    'english': 'English',
    'spanish': 'Español',
    'switchLanguage': 'Cambiar entre idioma de interfaz en inglés y español.',
    
    // Modal Titles and Messages
    'configurationSettingsTitle': 'Configuración del Sistema',
    'configureSeatingSettings': 'Configure aquí los ajustes de su arreglo de asientos.',
    'addGuestsModalTitle': 'Agregar Invitados',
    'editGuestModalTitle': 'Editar Invitado',
    'addGuestsInstructions': 'Haga doble clic en la fila para comenzar a editar',
    'arrangementActions': 'Acciones del Arreglo',
    'currentArrangement': 'Arreglo actual: {name}',
    'noArrangementSelected': 'Ningún arreglo seleccionado',
    
    // Success Messages
    'arrangementSaved': '¡Arreglo guardado exitosamente!',
    'arrangementDeleted': '¡Arreglo eliminado exitosamente!',
    'arrangementExported': '¡Arreglo exportado a JSON exitosamente!',
    'guestAdded': 'Se agregaron exitosamente {count} invitado(s)',
    'guestRemoved': '¡Invitado removido exitosamente!',
    'guestEdited': '¡Invitado actualizado exitosamente!',
    'groupChanged': 'Se cambió exitosamente el grupo de {count} invitado(s) a "{group}"',
    'guestTicketsExported': '¡Lista de boletos de invitados exportada a PDF exitosamente!',
    
    // Error Messages
    'errorLoadingConfiguration': 'Error cargando configuración',
    'errorSavingArrangement': 'Error guardando arreglo',
    'errorImportingCSV': 'Error importando archivo CSV',
    'noValidGuestsFound': 'No se encontraron invitados válidos en CSV. Por favor verifique el formato:\nnombre,apellido,grupo (ID es opcional)',
    'pleaseAddGuest': 'Por favor agregue al menos un invitado con nombre y apellido',
    'noActionsToUndo': 'No hay acciones para deshacer',
    
    // Undo Actions
    'undoAction': 'Deshecho: {action}',
    'movedGuestToTable': 'Movido {guest} a la mesa {table}',
    'movedGuestsToTable': 'Movidos {count} invitados a la mesa {table}',
    'unassignedGuest': 'Desasignado {guest} de la mesa {table}',
    'unassignedMultipleGuests': 'Desasignados {count} invitados de las mesas',
    'removedGuestFromTable': 'Removido {guest} de la mesa {table}',
    'clearedTable': 'Limpiados todos los {count} invitados de la mesa {table}',
    
    // PDF Export
    'weddingSeatingPDF': 'Arreglo de Asientos de Boda',
    'guestName': 'Nombre del Invitado',
    'tickets': 'Boletos',
    'totalTickets': 'Total de Boletos',
    'generated': 'Generado',
    'wedding': 'Boda',
    'guestTicketList': 'Lista de Boletos de Invitados',
    
    // Search and Filtering
    'searchGuests': 'Buscar invitados...',
    'searchResults': 'Resultados de Búsqueda',
    'noSearchResults': 'No se encontraron invitados que coincidan con su búsqueda',
    'guestsCount': '{count} invitados',
    'remainingGuests': 'Invitados Restantes',
    'groupGuests': 'Agrupar Invitados',
    'guestsSelected': 'invitados seleccionados',
    'dragToMoveMessage': 'Arrastra cualquier invitado seleccionado para mover todos juntos',
    
    // Context Menu
    'editGuestName': 'Editar nombre del invitado',
    'moveToGroup': 'Mover al grupo',
    'removeFromTable': 'Remover de la mesa',
    'assignToTable': 'Asignar a mesa',
    
    // Validation
    'firstNameRequired': 'El nombre es requerido',
    'lastNameRequired': 'El apellido es requerido',
    'groupNameRequired': 'El nombre del grupo es requerido',
    'tableSizeMinimum': 'El tamaño de la mesa debe ser al menos 1',
    'tableSizeMaximum': 'El tamaño de la mesa no puede exceder 20',
    
    // Drag and Drop
    'dragGuestToTable': 'Arrastrar invitado para asignar a mesa',
    'dragGuestToUnassign': 'Arrastrar invitado aquí para desasignar de mesa',
    'dropZone': 'Zona de soltar',
    'dropToUnassign': 'Suelta aquí para desasignar de la mesa',
    
    // Status Messages
    'readyToImport': 'Listo para importar',
    'processing': 'Procesando...',
    'complete': 'Completo',
    'failed': 'Falló',
    
    // Accessibility
    'ariaLabelPDFExport': 'Opciones de exportación PDF',
    'ariaLabelConfiguration': 'Configuración del sistema',
    'ariaLabelSearch': 'Buscar invitados',
    'ariaLabelGuestCheckbox': 'Seleccionar invitado',
    'ariaLabelGroupCheckbox': 'Seleccionar todos los invitados del grupo',
};

export default spanishTranslations;
