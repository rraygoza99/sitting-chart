import React from 'react';
import { IconButton, Icon } from '@mui/material';

function TableView({
    tables,
    viewMode,
    onDrop,
    onRemoveGuest,
    onClearTable,
    onEditGuest
}) {
    const renderListView = () => (
        <div className='tables-container'>
            {tables.map((table, tableIndex) => (
                <div
                    key={tableIndex}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        const guest = JSON.parse(e.dataTransfer.getData('guest'));
                        onDrop(guest, tableIndex);
                    }}
                    className='single-table'
                >
                    <h3 style={{ marginBottom: '10px' }}>
                        Table {tableIndex + 1} ({table.length}/10)
                        {table.length > 0 && (
                            <IconButton
                                onClick={() => onClearTable(tableIndex)}
                                color="error"
                                size="small"
                                title="Clear all guests from this table"
                                style={{ marginLeft: '10px' }}
                            >
                                <Icon>delete</Icon>
                            </IconButton>
                        )}
                    </h3>
                    {table.map((guest) => (
                        <div
                            key={guest.id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData(
                                    'guest',
                                    JSON.stringify({ ...guest, fromTableIndex: tableIndex })
                                );
                            }}
                            className='table-guest-item'
                        >
                            <span>
                                {guest.firstName} {guest.lastName}
                            </span>
                            <div style={{ marginLeft: '10px', display: 'flex', gap: '5px' }}>
                                <IconButton
                                    onClick={() => onEditGuest(guest.id, guest.firstName, guest.lastName)}
                                    color="primary"
                                    size="small"
                                    title="Edit guest name"
                                >
                                    <Icon>edit</Icon>
                                </IconButton>
                                <IconButton
                                    onClick={() => onRemoveGuest(guest, tableIndex)}
                                    color="error"
                                    size="small"
                                    title="Remove from table"
                                >
                                    <Icon>close</Icon>
                                </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    const renderVisualView = () => (
        <div className='visual-tables-container'>
            {tables.map((table, tableIndex) => (
                <div
                    key={tableIndex}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        const guest = JSON.parse(e.dataTransfer.getData('guest'));
                        onDrop(guest, tableIndex);
                    }}
                    className='visual-table-border'
                >
                    <span className='visual-table-title'>
                        Table {tableIndex + 1} ({table.length}/10)
                        {table.length > 0 && (
                            <IconButton
                                onClick={() => onClearTable(tableIndex)}
                                color="error"
                                size="small"
                                title="Clear all guests from this table"
                                style={{ marginLeft: '5px' }}
                            >
                                <Icon>clear_all</Icon>
                            </IconButton>
                        )}
                    </span>
                    {table.map((guest, index) => {
                        const angle = (index / 10) * 2 * Math.PI;
                        const radius = 120;
                        const x = 150 + radius * Math.cos(angle) - 30;
                        const y = 150 + radius * Math.sin(angle) - 30;
                        return (
                            <div
                                key={guest.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                        'guest',
                                        JSON.stringify({ ...guest, fromTableIndex: tableIndex })
                                    );
                                }}
                                onDoubleClick={() => {
                                    onEditGuest(guest.id, guest.firstName, guest.lastName);
                                }}
                                className='visual-table-guest-item'
                                style={{
                                    position: 'absolute',
                                    top: `${y}px`,
                                    left: `${x}px`,
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

    return viewMode === 'list' ? renderListView() : renderVisualView();
}

export default TableView;
