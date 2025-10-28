import { create } from 'zustand';

const useRole = create((set, get) => ({
  role: null,
  setRole: (role) => {
    console.log('Setting role in store:', role, 'Current role:', get().role);
    // Only set role if it's not empty and different from current
    if (role && role !== get().role) {
      set({ role });
      console.log('Role updated in store to:', role);
    } else if (!role) {
      console.log('Ignoring empty role value');
    } else {
      console.log('Role unchanged, already set to:', role);
    }
  },
}));

export default useRole; 