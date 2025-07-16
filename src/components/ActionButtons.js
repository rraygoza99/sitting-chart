import React from 'react';
import { Button } from '@mui/material';
import CSVImporter from './CSVImporter';

function ActionButtons({
    onSaveArrangement,
    onDeleteArrangement,
    onExportToPDF,
    onExportToJSON,
    onToggleViewMode,
    onDownloadSampleCSV,
    onRemoveSelectedGuests,
    onCSVImport,
    viewMode,
    isGrouped,
    onToggleGrouped,
    selectedGuestsCount
}) {
    return (
        <div>
            <div>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onSaveArrangement}
                    className='save-button'
                    style={{ marginBottom: '10px', marginRight: '10px' }}
                >
                    Save Arrangement
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={onDeleteArrangement}
                    className='delete-button'
                    style={{ marginBottom: '10px' }}
                >
                    Delete Arrangement
                </Button>
            </div>
            
            <div>
                <Button
                    variant="contained"
                    color="success"
                    onClick={onExportToPDF}
                    className='export-button'
                    style={{ marginBottom: '10px', marginRight: '10px' }}
                >
                    Export to PDF
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={onExportToJSON}
                    className='export-button'
                    style={{ marginBottom: '10px', marginRight: '10px' }}
                >
                    Export to JSON
                </Button>
                <Button
                    variant="contained"
                    color="info"
                    onClick={onToggleViewMode}
                    className='switch-button'
                    style={{ marginBottom: '10px' }}
                >
                    Switch to {viewMode === 'list' ? 'Visual View' : 'List View'}
                </Button>
            </div>
            
            <div>
                <CSVImporter onImport={onCSVImport} />
                <Button
                    variant="outlined"
                    color="info"
                    onClick={onDownloadSampleCSV}
                    style={{ marginTop: '10px', marginLeft: '10px' }}
                    className='download-sample-button'
                >
                    📄 Download Sample CSV
                </Button>
            </div>
            
            <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                    type="checkbox"
                    checked={isGrouped}
                    onChange={(e) => onToggleGrouped(e.target.checked)}
                    style={{ marginRight: '5px' }}
                />
                Group Guests
            </label>
            
            <Button
                variant="contained"
                color="error"
                onClick={onRemoveSelectedGuests}
                className='delete-button'
                style={{ marginBottom: '10px' }}
                disabled={selectedGuestsCount === 0}
            >
                Remove Selected Guests ({selectedGuestsCount})
            </Button>
        </div>
    );
}

export default ActionButtons;
