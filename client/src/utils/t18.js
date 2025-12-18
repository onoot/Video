// Импортируем все переводы
import allTranslations from './locales/all.json';

// Доступные языки
const AVAILABLE_LANGUAGES = ['ru', 'en']; // Укажите все поддерживаемые языки

// Текущий язык (по умолчанию - русский)
let currentLang = 'en';

// Кэш текущего словаря
let currentDict = allTranslations[currentLang] || {};

/**
 * Установка языка
 * @param {string} lang - Код языка (например, 'ru', 'en')
 */
export const setLanguage = (lang) => {
  if (AVAILABLE_LANGUAGES.includes(lang) && allTranslations[lang]) {
    currentLang = lang;
    currentDict = allTranslations[lang];
    localStorage.setItem('language', lang);
  } else {
    console.warn(`Language "${lang}" is not available. Using "${currentLang}".`);
  }
};

/**
 * Инициализация языка при запуске
 */
const initLanguage = () => {
  const savedLang = localStorage.getItem('language');
  if (savedLang && AVAILABLE_LANGUAGES.includes(savedLang)) {
    currentLang = savedLang;
    currentDict = allTranslations[currentLang] || {};
  }
};

// Выполняем инициализацию сразу при импорте модуля
initLanguage();

/**
 * Функция перевода
 * @param {string} key - Ключ перевода
 * @returns {string} Переведенная строка или ключ с пометкой об ошибке
 */
export const t = (key) => {
  if (currentDict.hasOwnProperty(key)) {
    return currentDict[key];
  }

  const fallback = `${key} (translation not found)`;
  console.warn('Translation not found:', key, 'in language:', currentLang);
  return fallback;
};

// Экспортируем для использования в компонентах
export default t;