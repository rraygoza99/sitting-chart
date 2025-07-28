// Translation index - combines all language dictionaries
import { englishTranslations } from './english';
import { spanishTranslations } from './spanish';

// Combined translations object
export const translations = {
    english: englishTranslations,
    spanish: spanishTranslations
};

// Export individual language dictionaries for direct access if needed
export { englishTranslations } from './english';
export { spanishTranslations } from './spanish';

export default translations;
