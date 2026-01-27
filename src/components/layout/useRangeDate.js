import { create } from "zustand";

export const useDateRange = create((set) => ({
  dateRange:{
    startDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() - 1, // Start date as the day before
      0, // 12:00 AM
      0,
      0,
      0
    ),
    label: 'Default',
    endDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      23,
      59,
      59,
      999
    )
  },

  setDateRange: (newValue) => set({ dateRange: newValue }),
}));