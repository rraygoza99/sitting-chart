import React from 'react';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Icon from '@mui/material/Icon';
import CloseIcon from '@mui/icons-material/Close';
import { useSeatingTranslation } from '../hooks/useSeatingTranslation';

const TableList = ({
    tables,
    viewMode,
    searchTerm,
    editingTable,
    tableAliases,
    tableSizes,
    tableNumbers,
    onDrop,
    onRemoveGuest,
    onClearTable,
    onTableEditClick,
    onTableEditComplete,
    onTableAliasChange,
    onTableNumberChange,
    onTableSizeChange,
    onEditGuest,
    onAddTable,
    highlightSearchTerm,
    getTableDisplayName,
    getTableDisplaySize,
    getTableDisplayNumber,
    tableHasMatchingGuest,
    currentLanguage = 'english'
}) => {
    const { t } = useSeatingTranslation(currentLanguage);
    const renderListView = () => {
        return (
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
                                                    onTableAliasChange(tableIndex, e.target.value);
                                                    onTableEditComplete();
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
                                                    onTableNumberChange(tableIndex, e.target.value);
                                                    onTableEditComplete();
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
                                                    onTableSizeChange(tableIndex, e.target.value);
                                                    onTableEditComplete();
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
                                    onClick={() => onTableEditClick(tableIndex)}
                                    color="inherit"
                                    size="small"
                                    title="Edit table settings"
                                    sx={{ color: 'white' }}
                                >
                                    <Icon>edit</Icon>
                                </IconButton>
                                {table.length > 0 && (
                                    <IconButton
                                        onClick={() => onClearTable(tableIndex)}
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
                                            JSON.stringify({ ...guest, fromTableIndex: tableIndex })
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
                                            <CloseIcon />
                                        </IconButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                {/* Add Table Button */}
                <div 
                    className='single-table add-table-button'
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '120px',
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        marginTop: '20px'
                    }}
                    onClick={onAddTable}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = '#2196f3';
                        e.target.style.backgroundColor = '#f0f8ff';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = '#ccc';
                        e.target.style.backgroundColor = '#f9f9f9';
                    }}
                >
                    <div style={{ textAlign: 'center', color: '#666' }}>
                        <Icon style={{ fontSize: '48px', marginBottom: '8px', color: '#2196f3' }}>add_circle</Icon>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{t('addNewTable')}</div>
                    </div>
                </div>
            </div>
        );
    };

    const renderVisualView = () => {
        return (
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
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <input
                                            type="text"
                                            defaultValue={getTableDisplayName(tableIndex)}
                                            placeholder="Table name..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    onTableAliasChange(tableIndex, e.target.value);
                                                    onTableEditComplete();
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
                                                    onTableNumberChange(tableIndex, e.target.value);
                                                    onTableEditComplete();
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
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '10px', color: '#333' }}>Max:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            defaultValue={getTableDisplaySize(tableIndex)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    onTableSizeChange(tableIndex, e.target.value);
                                                    onTableEditComplete();
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
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                        {getTableDisplayName(tableIndex)} #{getTableDisplayNumber(tableIndex)}
                                    </div>
                                    <div style={{ fontSize: '11px' }}>
                                        {table.length}/{getTableDisplaySize(tableIndex)}
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <IconButton
                                    onClick={() => onTableEditClick(tableIndex)}
                                    color="primary"
                                    size="small"
                                    title="Edit table settings"
                                    sx={{ minWidth: '24px', minHeight: '24px', padding: '2px' }}
                                >
                                    <Icon sx={{ fontSize: '16px' }}>edit</Icon>
                                </IconButton>
                                {table.length > 0 && (
                                    <IconButton
                                        onClick={() => onClearTable(tableIndex)}
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
                            const angle = (index / currentTableSize) * 2 * Math.PI;
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
                                    <span>{highlightSearchTerm(`${guest.firstName} ${guest.lastName}`)}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
                
                {/* Add Table Button - Visual View */}
                <div 
                    className='visual-table-border add-table-button'
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '300px',
                        height: '300px',
                        border: '2px dashed #ccc',
                        borderRadius: '50%',
                        backgroundColor: '#f9f9f9',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                    onClick={onAddTable}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = '#2196f3';
                        e.target.style.backgroundColor = '#f0f8ff';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = '#ccc';
                        e.target.style.backgroundColor = '#f9f9f9';
                    }}
                >
                    <div style={{ textAlign: 'center', color: '#666' }}>
                        <Icon style={{ fontSize: '64px', marginBottom: '8px', color: '#2196f3' }}>add_circle</Icon>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{t('addNewTable')}</div>
                    </div>
                </div>
            </div>
        );
    };

    return viewMode === 'list' ? renderListView() : renderVisualView();
};

export default TableList;
