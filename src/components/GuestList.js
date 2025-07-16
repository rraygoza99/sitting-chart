import React from 'react';
import { Button, IconButton, Icon } from '@mui/material';

function GuestList({
    guestList,
    isGrouped,
    selectedGuests,
    isDragOverGuestList,
    onSelectGuest,
    onAddPlusOne,
    onEditGuest,
    onContextMenu,
    onDragStart,
    canAddPlusOne
}) {
    const renderGuestItem = (guest) => (
        <div
            key={guest.id}
            draggable
            onDragStart={(e) => onDragStart(e, guest)}
            onContextMenu={onContextMenu}
            className={`guest-item ${selectedGuests.has(guest.id) ? 'selected' : ''}`}
        >
            <input
                type="checkbox"
                checked={selectedGuests.has(guest.id)}
                onChange={() => onSelectGuest(guest.id)}
                style={{ marginRight: '10px' }}
            />
            <span>
                {guest.firstName} {guest.lastName}
            </span>
            <div style={{ display: 'flex', gap: '5px' }}>
                <IconButton
                    onClick={() => onEditGuest(guest.id, guest.firstName, guest.lastName)}
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
                        onClick={() => onAddPlusOne(guest)}
                        style={{ marginLeft: '10px' }}
                        className='save-button'
                    >
                        <Icon>exposure_plus_1</Icon>
                    </Button>
                )}
            </div>
        </div>
    );

    const renderGroupedGuests = () => {
        const groupedGuests = guestList.reduce((groups, guest) => {
            const group = guest.group || 'Ungrouped';
            if (!groups[group]) groups[group] = [];
            groups[group].push(guest);
            return groups;
        }, {});

        const sortedGroups = Object.keys(groupedGuests).sort();
        
        // Sort guests within each group
        for (var group of sortedGroups) {
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

        return sortedGroups.map(groupName => (
            <div key={groupName} style={{ marginBottom: '20px' }}>
                <h3>{groupName}</h3>
                {groupedGuests[groupName].map((guest) => (
                    <div key={guest.id}>
                        {renderGuestItem(guest)}
                    </div>
                ))}
            </div>
        ));
    };

    const renderUngroupedGuests = () => {
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
                };
                return getGuestOrder(a).localeCompare(getGuestOrder(b));
            })
            .map((guest) => (
                <div key={guest.id}>
                    {renderGuestItem(guest)}
                </div>
            ));
    };

    return (
        <div>
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
            {isGrouped ? renderGroupedGuests() : renderUngroupedGuests()}
        </div>
    );
}

export default GuestList;
