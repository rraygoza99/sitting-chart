/**
 * Planner Branding Service
 * Stores and retrieves custom branding (logo, company name, tagline/footer)
 * in localStorage key `plannerBranding`.
 */

const BRANDING_STORAGE_KEY = 'plannerBranding';

export function getPlannerBranding() {
    try {
        const stored = localStorage.getItem(BRANDING_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading planner branding:', e);
    }
    return {
        companyName: '',
        tagline: '',
        logoDataUrl: '',
    };
}

export function savePlannerBranding(branding) {
    try {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
        return true;
    } catch (e) {
        console.error('Error saving planner branding:', e);
        return false;
    }
}
