import React from 'react';
import { useParams } from 'react-router-dom';
import { useSeatingArrangement } from '../hooks/useSeatingArrangement';
import GuestList from './GuestList';
import TableView from './TableView';
import ActionButtons from './ActionButtons';
import ContextMenu from './ContextMenu';
import EditModals from './EditModals';
import NotificationSnackbar from './NotificationSnackbar';
import './SeatingCanvas.css';

function SeatingCanvas({ guests = [] }) {
    const { name: weddingId } = useParams();
    
    const {
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
    } = useSeatingArrangement(guests, weddingId);

    // Handle drag start for guest items
    const handleGuestDragStart = (e, guest) => {
        const isSelected = selectedGuests.has(guest.id);
        const hasMultipleSelected = selectedGuests.size > 1;
        
        if (isSelected && hasMultipleSelected) {
            const selectedGuestsList = guestList.filter(g => selectedGuests.has(g.id));
            e.dataTransfer.setData('guest', JSON.stringify({
                isMultiDrag: true,
                selectedGuests: selectedGuestsList,
                id: 'multi-drag',
                firstName: `${selectedGuests.size} guests`,
                lastName: ''
            }));
        } else {
            e.dataTransfer.setData('guest', JSON.stringify(guest));
        }
    };

    return (
        <div style={{ display: 'flex' }} onClick={hideContextMenu}>
            {/* Context Menu */}
            <ContextMenu
                contextMenu={contextMenu}
                selectedGuestsCount={selectedGuests.size}
                showGroupSubmenu={showGroupSubmenu}
                onRemoveSelectedGuests={removeSelectedGuests}
                onChangeGuestGroup={changeGuestGroup}
                onOpenNewGroupModal={openNewGroupModal}
                onSetShowGroupSubmenu={setShowGroupSubmenu}
                getUniqueGroups={getUniqueGroups}
            />

            {/* Edit Modals */}
            <EditModals
                editModalOpen={editModalOpen}
                editFirstName={editFirstName}
                editLastName={editLastName}
                showNewGroupModal={showNewGroupModal}
                newGroupName={newGroupName}
                onCloseEditModal={closeEditModal}
                onSetEditFirstName={setEditFirstName}
                onSetEditLastName={setEditLastName}
                onSaveGuestEdit={saveGuestEdit}
                onCloseNewGroupModal={closeNewGroupModal}
                onSetNewGroupName={setNewGroupName}
                onSaveNewGroup={saveNewGroup}
            />

            {/* Notification Snackbar */}
            <NotificationSnackbar
                alertOpen={alertOpen}
                alertMessage={alertMessage}
                alertSeverity={alertSeverity}
                onCloseAlert={handleCloseAlert}
            />
            
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
                    padding: '10px',
                    transition: 'all 0.2s ease'
                }}
            >
                <ActionButtons
                    onSaveArrangement={saveArrangement}
                    onDeleteArrangement={deleteArrangement}
                    onExportToPDF={exportToPDF}
                    onExportToJSON={exportToJSON}
                    onToggleViewMode={toggleViewMode}
                    onDownloadSampleCSV={downloadSampleCSV}
                    onRemoveSelectedGuests={removeSelectedGuests}
                    onCSVImport={handleCSVImport}
                    viewMode={viewMode}
                    isGrouped={isGrouped}
                    onToggleGrouped={setIsGrouped}
                    selectedGuestsCount={selectedGuests.size}
                />
                
                <GuestList
                    guestList={guestList}
                    isGrouped={isGrouped}
                    selectedGuests={selectedGuests}
                    isDragOverGuestList={isDragOverGuestList}
                    onSelectGuest={handleSelectGuest}
                    onAddPlusOne={handleAddPlusOne}
                    onEditGuest={openEditModal}
                    onContextMenu={handleContextMenu}
                    onDragStart={handleGuestDragStart}
                    canAddPlusOne={canAddPlusOne}
                />
            </div>
            
            <TableView
                tables={tables}
                viewMode={viewMode}
                onDrop={handleDrop}
                onRemoveGuest={handleRemove}
                onClearTable={handleClearTable}
                onEditGuest={openEditModal}
            />
        </div>
    );
}

export default SeatingCanvas;


