import { create } from 'zustand';
import { toast } from 'react-toastify';
import { fetchFirstProfile } from '../../services/profileService';

const useAdminPasswordStore = create((set) => ({
  userid: "",
  adminPassword: "",
  viewerPassword: "",
  isLoading: false,
  error: null,

  fetchAdminPassword: async (options = {}) => {
    set({ isLoading: true, error: null }); 

    try {
      const profile = await fetchFirstProfile(options);

      console.log("AdminPasswordStore_data:", profile);

      if (profile?.adminPassword || profile?.admin_password) {
        set({
          adminPassword: profile.adminPassword || profile.admin_password || "",
          viewerPassword: profile.viewerPassword || profile.viewer_password || "",
          userid: profile.userid || "",
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
      throw error;
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