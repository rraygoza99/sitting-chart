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
import { isClientUser, getClientAssignedWedding } from "../../utils/userRoleService";

function EditableList() {
    const auth = useAuth();
    const isClient = isClientUser(auth.user?.profile);
    const assignedWedding = isClient ? getClientAssignedWedding(auth.user?.profile?.email) : null;

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
    } = useWeddings({ ownerEmail: auth.user?.profile?.email || undefined });
    const navigate = useNavigate();
    const [confirm, setConfirm] = useState({ open: false, name: null });
    const notify = useNotification();
    
    // Automatically redirect client to their assigned wedding if available
    useEffect(() => {
        if (isClient && assignedWedding) {
            navigate(`/wedding/${assignedWedding}`, { replace: true });
        }
    }, [isClient, assignedWedding, navigate]);

    // For clients, filter the weddings list to only their assigned wedding
    const displayItems = isClient && assignedWedding
        ? items.filter(w => w === assignedWedding)
        : items;

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
            {/* Create wedding (planners only) */}
            {!isClient && (
                <CreateWeddingForm
                    onCreate={async ({ partner1Name, partner2Name, weddingDate, venue }) => {
                        try {
                            const slug = await addWedding({ partner1Name, partner2Name, weddingDate, venue });
                            notify.success(t('createdWedding', { name: `${partner1Name} & ${partner2Name}` }));
                            return slug;
                        } catch (err) {
                            if (err?.code === 'PLAN_LIMIT_REACHED' || err?.message?.startsWith('PLAN_LIMIT_REACHED')) {
                                const limit = err.limit || (err.message.split(':')[1]) || 8;
                                notify.error(t('planLimitReached', { limit }));
                            } else {
                                notify.error(err?.message || t('failedSaveWedding'));
                            }
                            throw err; // preserve form's submitting state logic
                        }
                    }}
                    disabled={loading || saving}
                    onError={() => notify.error(t('failedSaveWedding'))}
                />
            )}

            {/* Weddings list */}
            <WeddingList
                items={displayItems}
                disabled={anyBusy}
                deletingName={deletingName}
                onOpen={handleRedirect}
                onDelete={isClient ? undefined : handleDeleteRequest}
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
