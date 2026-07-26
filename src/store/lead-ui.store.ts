import { create } from "zustand";

/**
 * Local UI-only state for the leads screen: which filters are showing,
 * which dialog is open, which lead is selected for a quick action.
 * Nothing here is server data - that stays in React Query-free server
 * components / route handlers, fetched fresh on navigation.
 */
type LeadUiState = {
  isCreateDialogOpen: boolean;
  isAssignDialogOpen: boolean;
  selectedLeadId: string | null;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  openAssignDialog: (leadId: string) => void;
  closeAssignDialog: () => void;
};

export const useLeadUiStore = create<LeadUiState>((set) => ({
  isCreateDialogOpen: false,
  isAssignDialogOpen: false,
  selectedLeadId: null,
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),
  openAssignDialog: (leadId) => set({ isAssignDialogOpen: true, selectedLeadId: leadId }),
  closeAssignDialog: () => set({ isAssignDialogOpen: false, selectedLeadId: null }),
}));
