/**
 * @module redux/features/branches/branchSlice
 * @description Redux slice managing local UI state for company branches directory,
 * including search filter, active/archived toggle, view mode, and dialog state.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  searchQuery: '',
  isArchivedFilter: false,
  viewMode: 'grid', // 'grid' | 'card'
  page: 1,
  limit: 10,
  sort: '-createdAt',
  isDialogOpen: false,
  dialogMode: 'create', // 'create' | 'edit'
  selectedBranch: null,
};

export const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.page = 1; // Reset to first page on search change
    },
    setIsArchivedFilter: (state, action) => {
      state.isArchivedFilter = action.payload;
      state.page = 1; // Reset to first page on archive toggle
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setPagination: (state, action) => {
      if (action.payload.page !== undefined) {
        state.page = action.payload.page;
      }
      if (action.payload.limit !== undefined) {
        state.limit = action.payload.limit;
      }
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    openCreateDialog: (state) => {
      state.isDialogOpen = true;
      state.dialogMode = 'create';
      state.selectedBranch = null;
    },
    openEditDialog: (state, action) => {
      state.isDialogOpen = true;
      state.dialogMode = 'edit';
      state.selectedBranch = action.payload;
    },
    closeDialog: (state) => {
      state.isDialogOpen = false;
      state.selectedBranch = null;
    },
    resetBranchFilters: (state) => {
      state.searchQuery = '';
      state.isArchivedFilter = false;
      state.page = 1;
      state.sort = '-createdAt';
    },
  },
});

export const {
  setSearchQuery,
  setIsArchivedFilter,
  setViewMode,
  setPagination,
  setSort,
  openCreateDialog,
  openEditDialog,
  closeDialog,
  resetBranchFilters,
} = branchSlice.actions;

export default branchSlice.reducer;
