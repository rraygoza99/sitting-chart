/**
 * User Role and Permissions Helper
 * Supported roles:
 * - 'planner': Full access (Dashboard, Create Weddings, Settings, Account, Help, Backups, Branding)
 * - 'client' (The Bride/Groom): Access only to their assigned wedding seating chart; restricted from creating/deleting weddings, Account, Settings, and Help.
 */

const ROLE_STORAGE_KEY = 'userRole';

export const ROLES = {
    PLANNER: 'planner',
    CLIENT: 'client', // The Bride/Groom
};

/**
 * Determine user role from profile claims or local storage.
 * @param {object} [userProfile] - auth.user?.profile
 * @returns {string} 'planner' | 'client'
 */
export function getUserRole(userProfile) {
    if (!userProfile) return ROLES.PLANNER;

    // Check OIDC / Cognito custom attributes or groups
    if (userProfile['custom:role'] === 'client' || userProfile['custom:role'] === 'couple' || userProfile['custom:role'] === 'bride_groom') {
        return ROLES.CLIENT;
    }
    if (Array.isArray(userProfile['cognito:groups']) && userProfile['cognito:groups'].includes('client')) {
        return ROLES.CLIENT;
    }

    // Check local client list / overrides
    try {
        const clientUsers = JSON.parse(localStorage.getItem('clientUsersList') || '[]');
        const userEmail = (userProfile.email || '').toLowerCase().trim();
        if (userEmail && clientUsers.some(u => (u.email || '').toLowerCase().trim() === userEmail)) {
            return ROLES.CLIENT;
        }

        const localRole = localStorage.getItem(ROLE_STORAGE_KEY);
        if (localRole === ROLES.CLIENT) {
            return ROLES.CLIENT;
        }
    } catch (_) {}

    return ROLES.PLANNER;
}

/**
 * Check if the user is a Bride/Groom client role.
 * @param {object} [userProfile]
 * @returns {boolean}
 */
export function isClientUser(userProfile) {
    return getUserRole(userProfile) === ROLES.CLIENT;
}

/**
 * Register a client user (Bride/Groom) locally with an assigned wedding slug.
 * @param {string} email
 * @param {string} weddingSlug
 * @param {string} [clientName]
 */
export function registerClientUser(email, weddingSlug, clientName = '') {
    try {
        const list = JSON.parse(localStorage.getItem('clientUsersList') || '[]');
        const cleanEmail = email.toLowerCase().trim();
        const existingIndex = list.findIndex(u => (u.email || '').toLowerCase().trim() === cleanEmail);
        
        const entry = {
            email: cleanEmail,
            weddingSlug,
            clientName,
            createdAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            list[existingIndex] = entry;
        } else {
            list.push(entry);
        }

        localStorage.setItem('clientUsersList', JSON.stringify(list));
        return true;
    } catch (e) {
        console.error('Error saving client user:', e);
        return false;
    }
}

/**
 * Get the list of client users registered by the planner.
 * @returns {Array<{ email: string, weddingSlug: string, clientName: string, createdAt: string }>}
 */
export function getRegisteredClientUsers() {
    try {
        return JSON.parse(localStorage.getItem('clientUsersList') || '[]');
    } catch (_) {
        return [];
    }
}

/**
 * Remove a registered client user.
 * @param {string} email
 */
export function removeRegisteredClientUser(email) {
    try {
        const list = JSON.parse(localStorage.getItem('clientUsersList') || '[]');
        const cleanEmail = email.toLowerCase().trim();
        const filtered = list.filter(u => (u.email || '').toLowerCase().trim() !== cleanEmail);
        localStorage.setItem('clientUsersList', JSON.stringify(filtered));
        return true;
    } catch (e) {
        console.error('Error removing client user:', e);
        return false;
    }
}

/**
 * Get assigned wedding slug for a client user.
 * @param {string} email
 * @returns {string|null}
 */
export function getClientAssignedWedding(email) {
    try {
        const list = getRegisteredClientUsers();
        const cleanEmail = (email || '').toLowerCase().trim();
        const found = list.find(u => (u.email || '').toLowerCase().trim() === cleanEmail);
        return found ? found.weddingSlug : null;
    } catch (_) {
        return null;
    }
}
