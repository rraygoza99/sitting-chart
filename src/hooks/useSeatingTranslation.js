import { useTranslation } from '../utils/language';

// Custom hook that integrates with the current language state from SeatingCanvas
export const useSeatingTranslation = (currentLanguage = 'english') => {
    const { t } = useTranslation(currentLanguage);
    
    // Additional helper functions specific to the seating application
    const formatGuestName = (guest) => {
        if (!guest) return '';
        const firstName = guest.firstName || '';
        const lastName = guest.lastName || '';
        return `${firstName} ${lastName}`.trim();
    };
    
    const getTableDisplay = (tableIndex, tableAlias, customNumber) => {
        if (tableAlias) {
            return `${tableAlias} (${t('tableNumber')}${customNumber || tableIndex + 1})`;
        }
        return `${t('table')} ${customNumber || tableIndex + 1}`;
    };
    
    const getGuestCount = (count) => {
        return t('guestsCount', { count });
    };
    
    const getSuccessMessage = (key, replacements = {}) => {
        return t(key, replacements);
    };
    
    const getErrorMessage = (key, replacements = {}) => {
        return t(key, replacements);
    };
    
    return {
        t,
        formatGuestName,
        getTableDisplay,
        getGuestCount,
        getSuccessMessage,
        getErrorMessage,
        currentLanguage
    };
};

export default useSeatingTranslation;
