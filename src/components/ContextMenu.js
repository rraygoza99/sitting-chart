import React, { useState } from 'react';

const ContextMenu = ({
    visible,
    x,
    y,
    selectedGuestsSize,
    uniqueGroups,
    onDeleteGuests,
    onChangeGroup,
    onOpenNewGroupModal,
    onHide
}) => {
    const [showGroupSubmenu, setShowGroupSubmenu] = useState(false);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: y,
                left: x,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 1000,
                minWidth: '175px'
            }}
        >
            {/* Delete Option */}
            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGuests();
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
                Delete Selected Guests ({selectedGuestsSize})
            </div>

            {/* Change Group Option */}
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
                Change Group... ({selectedGuestsSize})
                <span style={{ float: 'right' }}>▶</span>
                
                {/* Group Submenu */}
                {showGroupSubmenu && (
                    <div
                        style={{
                            position: 'absolute',
                            top: y + 60 > window.innerHeight - 200 ? 'auto' : 0,
                            bottom: y + 60 > window.innerHeight - 200 ? 0 : 'auto',
                            left: '100%',
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            minWidth: '175px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 1001
                        }}
                        onMouseEnter={() => setShowGroupSubmenu(true)}
                        onMouseLeave={() => setShowGroupSubmenu(false)}
                    >
                        {/* Existing Groups */}
                        {uniqueGroups.map((group, index) => (
                            <div
                                key={group}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderBottom: index < uniqueGroups.length - 1 ? '1px solid #eee' : 'none'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChangeGroup(group);
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                {group}
                            </div>
                        ))}
                        
                        {/* Separator if there are existing groups */}
                        {uniqueGroups.length > 0 && (
                            <div style={{ borderTop: '1px solid #ddd', margin: '4px 0' }} />
                        )}
                        
                        {/* Add New Group Option */}
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
};

export default ContextMenu;
