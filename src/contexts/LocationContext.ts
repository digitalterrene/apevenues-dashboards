import { create } from "zustand";

export const useLocationContext = create((set: any) => ({
  inputs: {
    province: "",
    city: "",
    suburb: "",
  },

  setInputs: (newInputs: any) =>
    set((state: any) => ({
      inputs: {
        ...state.inputs,
        ...newInputs,
      },
    })),
}));
