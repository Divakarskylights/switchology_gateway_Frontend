import { create } from "zustand";

const useGateWayName = create((set) => ({
  gateWayId: {},
  setGateWayId: (newData) => set({ gateWayId: newData }),
}));

export default useGateWayName;
