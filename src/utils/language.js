// Language system for the wedding seating application
import { translations } from './translations';

// Translation function
export const translate = (key, language = 'english', replacements = {}) => {
    let translation = translations[language]?.[key] || translations['english'][key] || key;
    
    // Handle replacements like {count}, {name}, etc.
    Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        translation = translation.replace(regex, replacements[placeholder]);
    });
    
    return translation;
};

// Hook for using translations in components
export const useTranslation = (currentLanguage = 'english') => {
    const t = (key, replacements = {}) => translate(key, currentLanguage, replacements);
    return { t, translate: t };
};

// Helper function to get available languages
export const getAvailableLanguages = () => {
    return Object.keys(translations);
};

// Helper function to check if a language is supported
export const isLanguageSupported = (language) => {
    return translations.hasOwnProperty(language);
};

// Export translations for direct access if needed
export { translations } from './translations';

// Default export with all language utilities
const languageUtils = { translate, useTranslation, getAvailableLanguages, isLanguageSupported, translations };
export default languageUtils;
