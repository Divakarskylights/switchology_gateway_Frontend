import { create } from "zustand";

const useRelayData = create((set) => ({
  relayClickedData: {},
  setRelayClickedData: (newData) => set({ relayClickedData: newData }),
}));

export default useRelayData;
