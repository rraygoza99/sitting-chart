import React from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

function EditModals({
    editModalOpen,
    editFirstName,
    editLastName,
    showNewGroupModal,
    newGroupName,
    onCloseEditModal,
    onSetEditFirstName,
    onSetEditLastName,
    onSaveGuestEdit,
    onCloseNewGroupModal,
    onSetNewGroupName,
    onSaveNewGroup
}) {
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

    return (
        <>
            {/* Edit Guest Modal */}
            <Modal
                open={editModalOpen}
                onClose={onCloseEditModal}
                aria-labelledby="edit-guest-modal-title"
                aria-describedby="edit-guest-modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="edit-guest-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                        Edit Guest Information
                    </Typography>
                    <TextField
                        fullWidth
                        label="First Name"
                        value={editFirstName}
                        onChange={(e) => onSetEditFirstName(e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Last Name"
                        value={editLastName}
                        onChange={(e) => onSetEditLastName(e.target.value)}
                        margin="normal"
                        variant="outlined"
                    />
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={onCloseEditModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onSaveGuestEdit}
                            disabled={!editFirstName.trim()}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* New Group Modal */}
            <Modal
                open={showNewGroupModal}
                onClose={onCloseNewGroupModal}
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
                        onChange={(e) => onSetNewGroupName(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        placeholder="Enter group name..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && newGroupName.trim()) {
                                onSaveNewGroup();
                            }
                        }}
                    />
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={onCloseNewGroupModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onSaveNewGroup}
                            disabled={!newGroupName.trim()}
                        >
                            Create Group
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}

export default EditModals;
