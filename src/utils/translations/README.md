# Translation System

This directory contains the translation dictionaries for the wedding seating arrangement application.

## Structure

```
src/utils/translations/
├── index.js        # Main entry point, combines all translations
├── english.js      # English translations dictionary
├── spanish.js      # Spanish translations dictionary
└── README.md       # This documentation
```

## Files

### `index.js`
- **Purpose**: Main entry point for all translations
- **Exports**: Combined `translations` object and individual language dictionaries
- **Usage**: Import the main translations object or specific language dictionaries

### `english.js`
- **Purpose**: Contains all English translations
- **Export**: `englishTranslations` object
- **Format**: Key-value pairs where keys are translation IDs and values are English text

### `spanish.js`
- **Purpose**: Contains all Spanish translations
- **Export**: `spanishTranslations` object
- **Format**: Key-value pairs where keys are translation IDs and values are Spanish text

## Usage Examples

### Import Combined Translations
```javascript
import { translations } from './translations';
// Access: translations.english['save'] or translations.spanish['save']
```

### Import Specific Language
```javascript
import { englishTranslations } from './translations/english';
import { spanishTranslations } from './translations/spanish';
```

### Use with Translation System
```javascript
// The main language.js file automatically imports from this directory
import { useSeatingTranslation } from '../hooks/useSeatingTranslation';

const { t } = useSeatingTranslation(currentLanguage);
const saveText = t('save'); // Returns "Save" or "Guardar"
```

## Adding New Translations

### 1. Add to English Dictionary
```javascript
// In english.js
'newTranslationKey': 'English Text Here',
```

### 2. Add to Spanish Dictionary
```javascript
// In spanish.js
'newTranslationKey': 'Texto en Español Aquí',
```

### 3. Use in Components
```javascript
const translatedText = t('newTranslationKey');
```

## Adding New Languages

To add a new language (e.g., French):

1. **Create new language file**: `french.js`
```javascript
export const frenchTranslations = {
    'save': 'Enregistrer',
    'cancel': 'Annuler',
    // ... all other translations
};

export default frenchTranslations;
```

2. **Update index.js**:
```javascript
import { frenchTranslations } from './french';

export const translations = {
    english: englishTranslations,
    spanish: spanishTranslations,
    french: frenchTranslations
};
```

3. **Update language selection UI** to include the new language option.

## Translation Key Categories

- **General**: Basic UI elements (save, cancel, delete, etc.)
- **Navigation**: Navigation and action items
- **Wedding Seating**: Wedding-specific terms
- **Guest Management**: Guest-related operations
- **Tables**: Table configuration and management
- **Actions and Buttons**: User interface actions
- **Export Options**: Export and import functionality
- **CSV Import**: CSV import specific terms
- **Language Settings**: Language switching interface
- **Modal Titles**: Modal and dialog titles
- **Success Messages**: Success notification texts
- **Error Messages**: Error notification texts
- **Undo Actions**: Undo operation descriptions
- **PDF Export**: PDF generation terms
- **Search and Filtering**: Search functionality
- **Context Menu**: Right-click menu options
- **Validation**: Form validation messages
- **Drag and Drop**: Drag and drop interface text
- **Status Messages**: Status and progress indicators
- **Accessibility**: Screen reader and accessibility labels

## Best Practices

1. **Consistent Keys**: Use descriptive, consistent key names across all languages
2. **Parameter Support**: Use `{placeholder}` syntax for dynamic content
3. **Fallback**: English is used as fallback if translation is missing
4. **Alphabetical Order**: Keep translations roughly organized by category
5. **No Duplicates**: Ensure no duplicate keys within a language file
6. **Complete Coverage**: Every key in English should have a corresponding Spanish translation

## Parameter Replacement

The translation system supports parameter replacement:

```javascript
// Translation with parameters
'guestAdded': 'Successfully added {count} guest(s)'

// Usage with parameters
t('guestAdded', { count: 5 })
// Returns: "Successfully added 5 guest(s)"
```

Common parameter patterns:
- `{count}`: Numeric values
- `{name}`: Names or identifiers  
- `{guest}`: Guest names
- `{table}`: Table numbers
- `{group}`: Group names
