import { create } from 'zustand';
import { toast } from 'react-toastify';
import { graphqlClient } from '../../services/client';
import { GET_PROFILE_DATA } from '../../services/query';
import { configInit } from '../../components/layout/globalvariable';

const useAdminPasswordStore = create((set) => ({
  userid: "",
  adminPassword: "",
  viewerPassword: "",
  isLoading: false,
  error: null,

  fetchAdminPassword: async () => {
    set({ isLoading: true, error: null }); 

    try {
      const response = await fetch(`${configInit.appBaseUrl}/api/profiles`);
      const data = await response.json();

      console.log("AdminPasswordStore_data:", data);

      if (data?.adminPassword) {
        set({
          adminPassword: data.adminPassword,
          viewerPassword: data.viewerPassword,
          userid: data.userid,
          isLoading: false,
        });
      } else {
        set({
          error: "Could not retrieve admin password",
          isLoading: false,
        });
        toast.error("Could not retrieve admin password for confirmation.");
      }
    } catch (error) {
      console.error("Error fetching admin password:", error);
      set({ error: error.message, isLoading: false });
      toast.error("Failed to fetch admin password.");
    }
  },

  clearAdminPassword: () => {
    set({
      adminPassword: "",
      viewerPassword: "",
      userid: "",
      error: null,
    });
  },
}));

export default useAdminPasswordStore; 