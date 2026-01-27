// store.js
import { create } from 'zustand';

const useBillStore = create((set) => ({
  adjNetConsumption: 0,
  setAdjustmentNetConsumption: (value) =>
    set({ adjNetConsumption: value }),
}));

export default useBillStore;
