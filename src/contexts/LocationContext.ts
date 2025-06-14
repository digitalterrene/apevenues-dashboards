import { create } from "zustand";

export const useLocationContext = create((set: any) => ({
  inputs: {
    address: "",
    city: "",
    zipCode: "",
    province: "",
  },

  setInputs: (newInputs: any) =>
    set((state: any) => ({
      inputs: {
        ...state.inputs,
        ...newInputs,
      },
    })),
}));
