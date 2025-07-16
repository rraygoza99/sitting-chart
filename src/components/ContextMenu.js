import React from 'react';

function ContextMenu({
    contextMenu,
    selectedGuestsCount,
    showGroupSubmenu,
    onRemoveSelectedGuests,
    onChangeGuestGroup,
    onOpenNewGroupModal,
    onSetShowGroupSubmenu,
    getUniqueGroups
}) {
    if (!contextMenu.visible) return null;

    return (
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
                    onRemoveSelectedGuests();
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
                Delete Selected Guests ({selectedGuestsCount})
            </div>
            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    position: 'relative'
                }}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f5f5f5';
                    onSetShowGroupSubmenu(true);
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                }}
            >
                Change Group... ({selectedGuestsCount})
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
                        onMouseEnter={() => onSetShowGroupSubmenu(true)}
                        onMouseLeave={() => onSetShowGroupSubmenu(false)}
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
                                    onChangeGuestGroup(group);
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
                                onOpenNewGroupModal();
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
    );
}

export default ContextMenu;
