import { create } from 'zustand';
import { toast } from 'react-toastify';
import { graphqlClient } from '../../services/client';
import { GET_PROFILE_DATA } from '../../services/query';

const useAdminPasswordStore = create((set) => ({
  nodeId: '',
  userid: '',
  adminPassword: '',
  viewerPassword: '',
  isLoading: false,
  error: null,

  fetchAdminPassword: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await graphqlClient.request(GET_PROFILE_DATA);
      console.log("cddfd", data);
      if (data?.allProfiles?.nodes[0]?.adminPassword) {
        set({ adminPassword: data.allProfiles.nodes[0].adminPassword, 
          viewerPassword: data.allProfiles.nodes[0].viewerPassword, 
          nodeId: data.allProfiles.nodes[0].nodeId,
          userid: data.allProfiles.nodes[0].userid,
          isLoading: false });
      } else {
        set({ error: "Could not retrieve admin password", isLoading: false });
        toast.error("Could not retrieve admin password for confirmation.");
      }
    } catch (error) {
      console.error("Error fetching admin password:", error);
      set({ error: error.message, isLoading: false });
      toast.error("Failed to fetch admin password.");
    }
  },

  clearAdminPassword: () => {
    set({ adminPassword: '', viewerPassword: '', nodeId: '', userid: '', error: null });
  }
}));

export default useAdminPasswordStore; 