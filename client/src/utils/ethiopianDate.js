/**
 * @module utils/ethiopianDate
 * @description Client-side bidirectional mathematical converter between Gregorian UTC dates and the Ethiopian Calendar.
 * Pure arithmetic Julian Day Number (JDN) algorithms ensuring zero external dependencies.
 */

const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856;

export const ETHIOPIAN_MONTH_NAMES = Object.freeze([
  'መስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜ',
]);

export const ETHIOPIAN_MONTH_NAMES_EN = Object.freeze([
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'Pagume',
]);

/**
 * Converts a Gregorian calendar date to Julian Day Number (JDN).
 *
 * @param {number} year - Gregorian year (e.g. 2024).
 * @param {number} month - Gregorian month (1-12).
 * @param {number} day - Gregorian day of month (1-31).
 * @returns {number} Julian Day Number.
 */
export const gregorianToJdn = (year, month, day) => {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
};

/**
 * Converts a Julian Day Number (JDN) to an Ethiopian calendar date.
 *
 * @param {number} jdn - Julian Day Number.
 * @returns {{ year: number, month: number, day: number }} Ethiopian date parts.
 */
export const jdnToEthiopian = (jdn) => {
  const r = (jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor((jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
};

/**
 * Converts an Ethiopian calendar date to Julian Day Number (JDN).
 *
 * @param {number} year - Ethiopian year (e.g. 2017).
 * @param {number} month - Ethiopian month (1-13).
 * @param {number} day - Ethiopian day of month (1-30, or 1-6 for Pagume).
 * @returns {number} Julian Day Number.
 */
export const ethiopianToJdn = (year, month, day) => {
  return (
    JD_EPOCH_OFFSET_AMETE_MIHRET +
    365 * Math.floor(year) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day -
    1
  );
};

/**
 * Converts a Julian Day Number (JDN) to a Gregorian calendar date.
 *
 * @param {number} jdn - Julian Day Number.
 * @returns {{ year: number, month: number, day: number }} Gregorian date parts.
 */
export const jdnToGregorian = (jdn) => {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
};

/**
 * Converts a Gregorian date (Date object, timestamp, or ISO string) to Ethiopian Calendar representation.
 *
 * @param {Date|string|number} inputDate - Gregorian date input.
 * @returns {{
 *   year: number,
 *   month: number,
 *   day: number,
 *   monthName: string,
 *   formattedDate: string,
 *   formattedFullDate: string
 * }} Ethiopian date object.
 */
export const gregorianToEthiopian = (inputDate) => {
  if (!inputDate) {
    return {
      year: 2019,
      month: 1,
      day: 1,
      monthName: ETHIOPIAN_MONTH_NAMES[0],
      formattedDate: '01-01-19',
      formattedFullDate: '01-01-2019 ዓ.ም',
    };
  }
  if (typeof inputDate === 'string' && /^\d{1,2}-\d{1,2}-\d{2,4}$/.test(inputDate.trim())) {
    const parsed = parseEthiopianDateString(inputDate);
    if (parsed) {
      const dd = String(parsed.day).padStart(2, '0');
      const mm = String(parsed.month).padStart(2, '0');
      const yy = String(parsed.year % 100).padStart(2, '0');
      const monthName = ETHIOPIAN_MONTH_NAMES[parsed.month - 1] || '';
      return {
        year: parsed.year,
        month: parsed.month,
        day: parsed.day,
        monthName,
        formattedDate: `${dd}-${mm}-${yy}`,
        formattedFullDate: `${dd}-${mm}-${parsed.year} ዓ.ም`,
      };
    }
  }
  const d = inputDate instanceof Date ? inputDate : new Date(inputDate);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  const jdn = gregorianToJdn(y, m, day);
  const eth = jdnToEthiopian(jdn);

  const dd = String(eth.day).padStart(2, '0');
  const mm = String(eth.month).padStart(2, '0');
  const yy = String(eth.year % 100).padStart(2, '0');
  const monthName = ETHIOPIAN_MONTH_NAMES[eth.month - 1] || '';

  return {
    year: eth.year,
    month: eth.month,
    day: eth.day,
    monthName,
    formattedDate: `${dd}-${mm}-${yy}`,
    formattedFullDate: `${dd}-${mm}-${eth.year} ዓ.ም`,
  };
};

/**
 * Converts an Ethiopian Calendar date to a UTC midnight Gregorian Date instance.
 *
 * @param {number} year - Ethiopian year.
 * @param {number} month - Ethiopian month (1-13).
 * @param {number} day - Ethiopian day of month.
 * @returns {Date} UTC midnight Gregorian Date.
 */
export const ethiopianToGregorian = (year, month, day) => {
  const jdn = ethiopianToJdn(year, month, day);
  const greg = jdnToGregorian(jdn);
  return new Date(Date.UTC(greg.year, greg.month - 1, greg.day, 0, 0, 0, 0));
};

/**
 * Formats a Gregorian date into the strict Amharic report header date: DD-MM-YY.
 *
 * @param {Date|string|number} inputDate - Gregorian date input or DD-MM-YY string.
 * @returns {string} Formatted Ethiopian date string (DD-MM-YY).
 */
export const formatEthiopianReportHeaderDate = (inputDate) => {
  if (!inputDate) return 'DD-MM-YY';
  if (typeof inputDate === 'string' && /^\d{1,2}-\d{1,2}-\d{2,4}$/.test(inputDate.trim())) {
    const parsed = parseEthiopianDateString(inputDate);
    if (parsed) {
      const dd = String(parsed.day).padStart(2, '0');
      const mm = String(parsed.month).padStart(2, '0');
      const yy = String(parsed.year % 100).padStart(2, '0');
      return `${dd}-${mm}-${yy}`;
    }
  }
  const eth = gregorianToEthiopian(inputDate);
  return eth.formattedDate;
};

/**
 * Returns today's Ethiopian date formatted as DD-MM-YY.
 *
 * @returns {string} Today's Ethiopian date (e.g. 12-01-19).
 */
export const getTodayEthiopianDate = () => {
  return formatEthiopianReportHeaderDate(new Date());
};

/**
 * Parses a DD-MM-YY or DD-MM-YYYY Ethiopian date string.
 *
 * @param {string} str - Ethiopian date string (DD-MM-YY or DD-MM-YYYY).
 * @returns {{ year: number, month: number, day: number }|null} Parsed parts or null.
 */
export const parseEthiopianDateString = (str) => {
  if (!str || typeof str !== 'string') return null;
  const parts = str.trim().split('-');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (year < 100) {
    year += 2000;
  }
  return { year, month, day };
};
