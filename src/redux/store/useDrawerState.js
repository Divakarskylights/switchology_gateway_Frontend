// src/zustand/useDrawerState.js
import {create} from 'zustand';

const useDrawerState = create((set) => ({
  open: true,
  setOpen: (isOpen) => set({ open: isOpen }),
}));

export default useDrawerState;
