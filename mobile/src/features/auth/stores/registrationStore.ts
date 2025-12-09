// src/features/auth/stores/registrationStore.ts
// Registration form data persistence store
// Keeps form data across step changes and component re-renders

import { create } from 'zustand';

interface RegistrationFormData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;

  // Step 2: Professional Info
  sectorId: number | null;
  professionId: number | null;
  customProfession: string;

  // Step 3: Account Info
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface RegistrationStore {
  formData: RegistrationFormData;
  currentStep: number;

  // Update individual fields
  updateField: <K extends keyof RegistrationFormData>(
    field: K,
    value: RegistrationFormData[K],
  ) => void;

  // Update multiple fields at once
  updateFields: (fields: Partial<RegistrationFormData>) => void;

  // Step management
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Reset all data
  reset: () => void;

  // Get complete form data for submission
  getSubmitData: () => RegistrationFormData;
}

const initialFormData: RegistrationFormData = {
  firstName: '',
  lastName: '',
  sectorId: null,
  professionId: null,
  customProfession: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

/**
 * Registration Store
 *
 * Persists form data across step changes and component re-renders.
 * Solves React Hook Form's shouldUnregister issue in multi-step forms.
 */
export const useRegistrationStore = create<RegistrationStore>((set, get) => ({
  formData: initialFormData,
  currentStep: 1,

  updateField: (field, value) => {
    set(state => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
    }));
    console.log(`[RegistrationStore] Updated ${String(field)}:`, value);
  },

  updateFields: fields => {
    set(state => ({
      formData: {
        ...state.formData,
        ...fields,
      },
    }));
    console.log('[RegistrationStore] Updated fields:', Object.keys(fields));
  },

  setStep: step => {
    set({ currentStep: step });
    console.log('[RegistrationStore] Step set to:', step);
  },

  nextStep: () => {
    set(state => ({ currentStep: state.currentStep + 1 }));
    console.log('[RegistrationStore] Next step:', get().currentStep);
  },

  previousStep: () => {
    set(state => ({ currentStep: Math.max(1, state.currentStep - 1) }));
    console.log('[RegistrationStore] Previous step:', get().currentStep);
  },

  reset: () => {
    set({
      formData: initialFormData,
      currentStep: 1,
    });
    console.log('[RegistrationStore] Reset to initial state');
  },

  getSubmitData: () => {
    const data = get().formData;
    console.log('[RegistrationStore] Submit data:', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      sectorId: data.sectorId,
      professionId: data.professionId,
      acceptTerms: data.acceptTerms,
    });
    return data;
  },
}));
