/**
 * @module utils/reportFormatter
 * @description Client-side deterministic plain-text Amharic report assembly engine.
 * Synchronously compiles form field changes into the exact Section 3 Amharic plain-text layout.
 */
import { formatEthiopianReportHeaderDate } from './ethiopianDate.js';

export const NO_ISSUE_STANDARDIZED_TEXT = 'በዕለቱ በብራንቹ አፋጣኝ መፍትሄ የሚፈልግ የተለየ ጉዳይ አልነበረም።';
export const DEFAULT_COMMENTS_FALLBACK_TEXT = 'በዕለቱ በብራንቹ የነበረው አጠቃላይ የስራ እንቅስቃሴ ደህና ነበር።';

/**
 * Strips forbidden markdown characters from a text string.
 *
 * @param {string} text - Raw text string.
 * @returns {string} Sanitized plain text string.
 */
const sanitizePlainText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[#*`_~[\]]/g, '').trim();
};

/**
 * Joins an array of branch names with Amharic conjunctions ('፣' and 'እና').
 *
 * @param {Array<string>} names - Branch names.
 * @returns {string} Formatted joined string.
 */
const joinBranchNamesAmharic = (names) => {
  const uniqueNames = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  if (uniqueNames.length === 0) return '';
  if (uniqueNames.length === 1) return uniqueNames[0];
  if (uniqueNames.length === 2) return `${uniqueNames[0]} እና ${uniqueNames[1]}`;

  const allExceptLast = uniqueNames.slice(0, -1).join('፣ ');
  const last = uniqueNames[uniqueNames.length - 1];
  return `${allExceptLast} እና ${last}`;
};

/**
 * Deterministically renders report form state into locked plain-text Amharic.
 *
 * @param {object} report - Form state object.
 * @param {string|Date} [report.date] - Gregorian date.
 * @param {string} [report.branchName] - Primary branch name snapshot.
 * @param {string} [report.supervisorName] - Supervisor full name.
 * @param {string} [report.clockIn] - Shift arrival time (HH:mm).
 * @param {string} [report.clockOut] - Shift departure time (HH:mm).
 * @param {Array<object>} [report.visits=[]] - Visited branch intervals.
 * @param {Array<object|string>} [report.activities=[]] - Activities documented.
 * @param {Array<object|string>} [report.issues=[]] - Issues documented.
 * @param {Array<string>|string} [report.comments=[]] - Supervisory general comments.
 * @returns {string} Complete, locked plain-text Amharic report string.
 */
export const renderReportText = (report) => {
  if (!report) return '';

  const blocks = [];

  // 1. DATE LINE (DD-MM-YY)
  const dateFormatted = report.date ? formatEthiopianReportHeaderDate(report.date) : 'DD-MM-YY';
  const dateLine = `ቀን: ${dateFormatted}`;

  // 2. BRANCH LINE
  const visits = Array.isArray(report.visits) ? report.visits : [];
  let branchLine;
  if (visits.length > 0) {
    const branchNames = visits
      .map((v) => v.branchName || (v.branch && v.branch.name) || '')
      .filter(Boolean);
    if (report.branchName && !branchNames.includes(report.branchName)) {
      branchNames.push(report.branchName);
    }
    branchLine = `ብራንች: ${joinBranchNamesAmharic(branchNames) || '...'}`;
  } else {
    branchLine = `ብራንች: ${sanitizePlainText(report.branchName || '...')}`;
  }

  // 3. SUPERVISOR NAME LINE
  const nameLine = `ስም: ${sanitizePlainText(report.supervisorName || '...')}`;

  // 4. CLOCK-IN TIME LINE
  const clockInTime = (report.clockIn || 'HH:mm').trim();
  const clockInLine = `ስራ የገባሁበት ሰዓት: ${clockInTime}`;

  // Assemble Header Block
  const headerLines = [dateLine, branchLine, nameLine, clockInLine];

  // 5. MULTI-BRANCH VISIT TIMELINE INTERVALS
  if (visits.length > 0) {
    const sortedVisits = [...visits].sort((a, b) =>
      (a.clockIn || '').localeCompare(b.clockIn || '')
    );
    for (const v of sortedVisits) {
      const vName = sanitizePlainText(v.branchName || (v.branch && v.branch.name) || '');
      const vIn = (v.clockIn || '').trim();
      const vOut = (v.clockOut || '').trim();
      if (vName && vIn && vOut) {
        headerLines.push(`ከ ${vIn} – ${vOut} (${vName} ብራንች)`);
      }
    }
  }

  blocks.push(headerLines.join('\n'));

  // 6. ACTIVITIES SECTION (የተሰሩ ስራዎች)
  const activityLines = ['የተሰሩ ስራዎች:'];
  const rawActivities = Array.isArray(report.activities) ? report.activities : [];
  const activityItems = rawActivities
    .map((act) => (typeof act === 'string' ? act : act.text || act.description || ''))
    .map(sanitizePlainText)
    .filter(Boolean);

  if (activityItems.length > 0) {
    for (const item of activityItems) {
      activityLines.push(` - ${item}`);
    }
  } else {
    activityLines.push(' - በዕለቱ መደበኛ የክትትል እና የቁጥጥር ስራዎች ተከናውነዋል።');
  }
  blocks.push(activityLines.join('\n'));

  // 7. ISSUES SECTION (መፍትሄ የሚፈልጉ ጉዳዮች)
  const issueLines = ['መፍትሄ የሚፈልጉ ጉዳዮች:'];
  const rawIssues = Array.isArray(report.issues) ? report.issues : [];

  const hasNoIssueStatus = rawIssues.some(
    (iss) => iss && typeof iss === 'object' && iss.status === 'no_issue'
  );

  const issueItems = rawIssues
    .filter((iss) => !(iss && typeof iss === 'object' && iss.status === 'no_issue'))
    .map((iss) => (typeof iss === 'string' ? iss : iss.text || iss.description || ''))
    .map(sanitizePlainText)
    .filter(Boolean);

  if (hasNoIssueStatus || issueItems.length === 0) {
    issueLines.push(` - ${NO_ISSUE_STANDARDIZED_TEXT}`);
  } else {
    for (const item of issueItems) {
      issueLines.push(` - ${item}`);
    }
  }
  blocks.push(issueLines.join('\n'));

  // 8. GENERAL COMMENTS SECTION (አጠቃላይ አስተያየት)
  const commentLines = ['አጠቃላይ አስተያየት:'];
  let rawComments = [];
  if (Array.isArray(report.comments)) {
    rawComments = report.comments;
  } else if (typeof report.comments === 'string' && report.comments.trim()) {
    rawComments = [report.comments];
  }

  const commentItems = rawComments
    .map((c) => (typeof c === 'string' ? c : c.text || ''))
    .map(sanitizePlainText)
    .filter(Boolean);

  if (commentItems.length > 0) {
    for (const item of commentItems) {
      commentLines.push(` - ${item}`);
    }
  } else {
    commentLines.push(` - ${DEFAULT_COMMENTS_FALLBACK_TEXT}`);
  }
  blocks.push(commentLines.join('\n'));

  // 9. FOOTER BLOCK: CLOCK-OUT TIME LINE
  const clockOutTime = (report.clockOut || 'HH:mm').trim();
  const footerLine = `ከስራ የወጣሁበት ሰዓት: ${clockOutTime}`;
  blocks.push(footerLine);

  return blocks.join('\n\n');
};
