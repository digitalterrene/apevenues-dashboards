//contexts/ServicesContext.ts
import { create } from "zustand";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  category: string;
  isCustom?: boolean;
}

interface ServicesContextState {
  selectedServices: Service[];
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  clearServices: () => void;
}

export const useServicesContext = create<ServicesContextState>((set) => ({
  selectedServices: [],
  addService: (service) =>
    set((state) => ({
      selectedServices: [...state.selectedServices, service],
    })),
  removeService: (serviceId) =>
    set((state) => ({
      selectedServices: state.selectedServices.filter(
        (s) => s.id !== serviceId
      ),
    })),
  updateService: (serviceId, updates) =>
    set((state) => ({
      selectedServices: state.selectedServices.map((service) =>
        service.id === serviceId ? { ...service, ...updates } : service
      ),
    })),
  clearServices: () => set({ selectedServices: [] }),
}));
