/**
 * LocaleService
 */
class LocaleService {
  /**
   * @param {Object} i18nProvider - The i18n provider
   */
  constructor(i18nProvider) {
    this.i18nProvider = i18nProvider;
  }

  /** @returns {string} The current locale code */
  getCurrentLocale() {
    return this.i18nProvider.getLocale();
  }

  /** @returns {string[]} The list of available locale codes */
  getLocales() {
    return this.i18nProvider.getLocales();
  }

  /**
   * @param {string} locale - The locale to set. Must be from the list of available locales.
   */
  setLocale(locale) {
    if (this.isValidLocale(locale)) {
      this.i18nProvider.setLocale(locale);
    } else {
      throw new Error(`Invalid locale: ${locale}`);
    }
  }

  /**
   * @param {string} string - String to translate
   * @param {Record<string, any>} [args] - Extra parameters
   * @returns {string} Translated string
   */
  translate(string, args = {}) {
    return this.i18nProvider.translate(string, args);
  }

  /**
   * @param {string|Object} phrase - Object/string to translate
   * @param {number} count - The plural number
   * @param {Record<string, any>} [args] - Extra parameters
   * @returns {string} Translated plural string
   */
  translatePlurals(phrase, count, args = {}) {
    return this.i18nProvider.translateN(phrase, count, args);
  }

  /**
   * @param {string} locale - Locale code
   * @returns {boolean} Whether the locale is valid
   */
  isValidLocale(locale) {
    return this.getLocales().includes(locale);
  }
}

export { LocaleService };
