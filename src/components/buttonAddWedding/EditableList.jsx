import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import "./EditableList.css";
import { useWeddings } from "../../hooks/useWeddings";
import GreetingBar from "./GreetingBar";
import CreateWeddingForm from "./CreateWeddingForm";
import WeddingList from "./WeddingList";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { useState } from 'react';
import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';
import { useNotification } from "../common/NotificationProvider";

function EditableList() {
    const auth = useAuth();
    const userName = auth.user?.profile?.username || auth.user?.profile?.email || 'User';
    const { t } = useSeatingTranslation();
    const { 
        items,
        loading,
        saving,
        deletingName,
        loadError,
        anyBusy,
        addWedding,
        deleteWedding
    } = useWeddings({ ownerMail: auth.user?.profile?.email || undefined });
    const navigate = useNavigate();
    const [confirm, setConfirm] = useState({ open: false, name: null });
    const notify = useNotification();
    
    // Notify user on load fallback
    useEffect(() => {
        if (loadError) {
            notify.warning(loadError);
        }
    }, [loadError, notify]);
    
    const handleDeleteRequest = (weddingName) => {
        setConfirm({ open: true, name: weddingName });
    };

    const handleConfirmDelete = async () => {
        const name = confirm.name;
        try {
            await deleteWedding(name);
            notify.success(t('deletedWedding', { name }));
        } catch (err) {
            notify.error(t('failedDeleteWedding'));
        } finally {
            setConfirm({ open: false, name: null });
        }
    };

    const handleRedirect = (name) => {
        navigate(`/wedding/${name}`);
    };

    return (
        <div>
            {/* Greeting bar */}
            <GreetingBar userName={userName} />
            {loading && items.length === 0 && (
                <div style={{ textAlign: 'center', margin: '2rem', fontSize: '1.2rem', color: '#666' }}>
                    {t('loadingWeddings')}
                </div>
            )}
            {/* Create wedding */}
            <CreateWeddingForm
                onCreate={async (name) => {
                    try {
                        await addWedding(name);
                        notify.success(t('createdWedding', { name }));
                    } catch (err) {
                        notify.error(t('failedSaveWedding'));
                        throw err; // preserve form's submitting state logic
                    }
                }}
                disabled={loading || saving}
                onError={() => notify.error(t('failedSaveWedding'))}
            />

            {/* Weddings list */}
            <WeddingList
                items={items}
                disabled={anyBusy}
                deletingName={deletingName}
                onOpen={handleRedirect}
                onDelete={handleDeleteRequest}
            />

            <ConfirmDeleteDialog
                open={confirm.open}
                name={confirm.name}
                onCancel={() => setConfirm({ open: false, name: null })}
                onConfirm={handleConfirmDelete}
                disabled={anyBusy}
            />

            {/* NotificationBar removed: notifications are handled by NotificationProvider */}
        </div>
    );
}

export default EditableList;
