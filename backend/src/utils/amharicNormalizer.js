/**
 * @module utils/amharicNormalizer
 * @description Canonical Ge'ez homophone normalizer, workplace transliteration registry, and Latin script linter.
 * Conforms to Master Technical Specification Section 8.
 */

/**
 * Normalizes homophonous Ge'ez characters into canonical forms for consistent search, indexing, and comparison.
 * Maps:
 * - ሐ, ኀ series -> ሀ series
 * - ሠ series -> ሰ series
 * - ዐ series -> አ series
 * - ፀ series -> ጸ series
 *
 * @param {string} text - Raw Amharic text string.
 * @returns {string} Normalized Amharic text.
 */
export const normalizeAmharicPhonetics = (text) => {
  if (!text || typeof text !== 'string') return '';

  return (
    text
      // Normalize H-series (ሐ, ኀ -> ሀ)
      .replace(/[ሐኀ]/g, 'ሀ')
      .replace(/[ሑኁ]/g, 'ሁ')
      .replace(/[ሒኂ]/g, 'ሂ')
      .replace(/[ሓኃ]/g, 'ሃ')
      .replace(/[ሔኄ]/g, 'ሔ')
      .replace(/[ሕኅ]/g, 'ህ')
      .replace(/[ሖኆ]/g, 'ሆ')
      // Normalize S-series (ሠ -> ሰ)
      .replace(/ሠ/g, 'ሰ')
      .replace(/ሡ/g, 'ሱ')
      .replace(/ሢ/g, 'ሲ')
      .replace(/ሣ/g, 'ሳ')
      .replace(/ሤ/g, 'ሴ')
      .replace(/ሥ/g, 'ስ')
      .replace(/ሦ/g, 'ሶ')
      // Normalize A-series (ዐ -> አ)
      .replace(/ዐ/g, 'አ')
      .replace(/ዑ/g, 'ኡ')
      .replace(/ዒ/g, 'ኢ')
      .replace(/ዓ/g, 'ኣ')
      .replace(/ዔ/g, 'ኤ')
      .replace(/ዕ/g, 'እ')
      .replace(/ዖ/g, 'ኦ')
      // Normalize Tse-series (ፀ -> ጸ)
      .replace(/ፀ/g, 'ጸ')
      .replace(/ፁ/g, 'ጹ')
      .replace(/ፂ/g, 'ጺ')
      .replace(/ፃ/g, 'ጻ')
      .replace(/ፄ/g, 'ጼ')
      .replace(/ፅ/g, 'ጽ')
      .replace(/ፆ/g, 'ጾ')
  );
};

/**
 * Canonical dictionary mapping common English technical loanwords to standard Ge'ez transliterations.
 * Strictly prevents literal dictionary translations per Master Specification Section 8.3.
 */
export const WORKPLACE_TRANSLITERATION_MAP = Object.freeze({
  'deep fryer': 'ዲፕ ፍራየር',
  fryer: 'ፍራየር',
  chiller: 'ቺለር',
  freezer: 'ፍሪዘር',
  'deep freezer': 'ዲፕ ፍሪዘር',
  'display warmer': 'ዲስፕሌይ ዋርመር',
  'bain-marie': 'ቤንማሪ',
  'espresso machine': 'ኤስፕሬሶ ማሽን',
  microwave: 'ማይክሮዌቭ',
  grill: 'ግሪል',
  'ice cream machine': 'አይስክሬም ማሽን',
  'exhaust fan': 'ኤግዞስት ፋን',
  blender: 'ብሌንደር',
  mixer: 'ሚክሰር',
  slicer: 'ስላይሰር',
  'grease trap': 'ግሪስ ትራፕ',
  'pos machine': 'ፒኦኤስ ማሽን',
  pos: 'ፒኦኤስ',
  generator: 'ጀነሬተር',
  stabilizer: 'ስታብላይዘር',
  wifi: 'ዋይፋይ',
  router: 'ራውተር',
  cctv: 'ሲሲቲቪ',
  ups: 'ዩፒኤስ',
  'water pump': 'ዋተር ፓምፕ',
  'water filter': 'ዋተር ፊልተር',
  foil: 'ፎይል',
  stock: 'ስቶክ',
  stockout: 'ስቶክ አውት',
  cashier: 'ካሺየር',
  'shift leader': 'ሺፍት ሊደር',
  'order taker': 'ኦርደር ቴከር',
  'store keeper': 'ስቶር ኪፐር',
});

/**
 * Checks whether a text string contains Latin characters (A-Z, a-z).
 * Used for zero-Latin quality gate in reports.
 *
 * @param {string} text - Text string to inspect.
 * @returns {boolean} True if Latin characters are present.
 */
export const hasLatinCharacters = (text) => {
  if (!text || typeof text !== 'string') return false;
  return /[a-zA-Z]/.test(text);
};
