/**
 * @module redux/features/reports/reportSlice
 * @description Redux slice managing report creation form state, active drafts, and in-canvas mounting.
 */
import { createSlice } from '@reduxjs/toolkit';
import { getTodayEthiopianDate } from '../../../utils/ethiopianDate.js';

const initialDraft = {
  date: getTodayEthiopianDate(),
  clockIn: '08:30',
  clockOut: '17:00',
  shiftPreset: 'morning',
  branch: null,
  branchName: '',
  preset: 'default-standard-inspection',
  presetName: 'Standard Operational Inspection (መደበኛ የቁጥጥር መመሪያ)',
  visits: [],
  activities: [],
  issues: [],
  comments: '',
  noIssue: false,
  audioFiles: [],
};

const initialState = {
  isFormOpen: false,
  isDirty: false,
  draft: { ...initialDraft },
  messages: [],
};

export const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    openReportForm: (state, action) => {
      state.isFormOpen = true;
      if (action.payload) {
        state.draft = { ...initialDraft, ...action.payload };
      }
      state.isDirty = false;
    },
    closeReportForm: (state) => {
      state.isFormOpen = false;
      state.isDirty = false;
    },
    resetDraft: (state) => {
      state.draft = { ...initialDraft, date: getTodayEthiopianDate() };
      state.isDirty = false;
    },
    addChatMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setReportConversation: (state, action) => {
      const { report, userRequestText } = action.payload;
      state.messages = [
        {
          id: `user-${Date.now()}`,
          role: 'user',
          type: 'report_request',
          report,
          text:
            userRequestText ||
            `Compile Daily Supervisory Report for ${report?.branchName || 'Branch'} (${report?.ethiopianDate?.formattedDate || report?.date || ''})`,
          timestamp: new Date().toISOString(),
        },
        {
          id: `ai-${Date.now() + 1}`,
          role: 'assistant',
          type: 'report_response',
          report,
          text: report?.generated || '',
          timestamp: new Date().toISOString(),
        },
      ];
    },
    clearChatMessages: (state) => {
      state.messages = [];
    },
    setDraftField: (state, action) => {
      const { field, value } = action.payload;
      state.draft[field] = value;
      state.isDirty = true;
    },
    setShiftPreset: (state, action) => {
      const preset = action.payload;
      state.draft.shiftPreset = preset;
      state.isDirty = true;
      if (preset === 'morning') {
        state.draft.clockIn = '08:30';
        state.draft.clockOut = '17:00';
      } else if (preset === 'afternoon') {
        state.draft.clockIn = '13:00';
        state.draft.clockOut = '21:00';
      } else if (preset === 'night') {
        state.draft.clockIn = '20:00';
        state.draft.clockOut = '04:00';
      }
    },
    addVisit: (state, action) => {
      state.draft.visits.push(action.payload);
      // Automatically synchronize shift boundary clockIn and clockOut
      const sorted = [...state.draft.visits].sort((a, b) => (a.clockIn || '').localeCompare(b.clockIn || ''));
      if (sorted.length > 0) {
        state.draft.clockIn = sorted[0].clockIn;
        state.draft.clockOut = sorted[sorted.length - 1].clockOut;
      }
      state.isDirty = true;
    },
    updateVisit: (state, action) => {
      const { index, visit } = action.payload;
      if (state.draft.visits[index]) {
        state.draft.visits[index] = visit;
        const sorted = [...state.draft.visits].sort((a, b) => (a.clockIn || '').localeCompare(b.clockIn || ''));
        if (sorted.length > 0) {
          state.draft.clockIn = sorted[0].clockIn;
          state.draft.clockOut = sorted[sorted.length - 1].clockOut;
        }
        state.isDirty = true;
      }
    },
    removeVisit: (state, action) => {
      state.draft.visits.splice(action.payload, 1);
      const sorted = [...state.draft.visits].sort((a, b) => (a.clockIn || '').localeCompare(b.clockIn || ''));
      if (sorted.length > 0) {
        state.draft.clockIn = sorted[0].clockIn;
        state.draft.clockOut = sorted[sorted.length - 1].clockOut;
      }
      state.isDirty = true;
    },
    addActivity: (state, action) => {
      state.draft.activities.push(action.payload);
      state.isDirty = true;
    },
    removeActivity: (state, action) => {
      state.draft.activities.splice(action.payload, 1);
      state.isDirty = true;
    },
    addIssue: (state, action) => {
      state.draft.issues.push(action.payload);
      state.isDirty = true;
    },
    removeIssue: (state, action) => {
      state.draft.issues.splice(action.payload, 1);
      state.isDirty = true;
    },
    toggleNoIssue: (state) => {
      state.draft.noIssue = !state.draft.noIssue;
      state.isDirty = true;
    },
    addAudioFile: (state, action) => {
      if (!state.draft.audioFiles) {
        state.draft.audioFiles = [];
      }
      state.draft.audioFiles.push(action.payload);
      state.isDirty = true;
    },
    removeAudioFile: (state, action) => {
      if (state.draft.audioFiles) {
        if (typeof action.payload === 'number') {
          state.draft.audioFiles.splice(action.payload, 1);
        } else if (action.payload?.id) {
          state.draft.audioFiles = state.draft.audioFiles.filter(
            (item) => item.id !== action.payload.id
          );
        } else {
          state.draft.audioFiles = state.draft.audioFiles.filter(
            (item, idx) => idx !== action.payload
          );
        }
        state.isDirty = true;
      }
    },
    clearAudioFiles: (state) => {
      if (state.draft.audioFiles) {
        state.draft.audioFiles = [];
        state.isDirty = true;
      }
    },
  },
});

export const {
  openReportForm,
  closeReportForm,
  resetDraft,
  setDraftField,
  setShiftPreset,
  addVisit,
  updateVisit,
  removeVisit,
  addActivity,
  removeActivity,
  addIssue,
  removeIssue,
  toggleNoIssue,
  addAudioFile,
  removeAudioFile,
  clearAudioFiles,
  addChatMessage,
  setReportConversation,
  clearChatMessages,
} = reportSlice.actions;

export default reportSlice.reducer;
