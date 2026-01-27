import { create } from 'zustand';
import axios from 'axios';
import { graphqlClient } from '../../client/client';
import { GET_RELAY_STATUS } from '../../client/query';
import { configInit } from '../../component/global/globalvariable';

let pollingInterval = null;

const useRelayStatusStore = create((set) => ({
  relayStatus: null,
  useRelayStatus: false,
  relayError: null,
  relayStateUpdate: null,
  relayStateUpdateError: null,

  setUseRelayStatus: (newVal) => {
    set({ useRelayStatus: newVal });
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }

    if (newVal) {
      const fetchStatus = async () => {
        try {
          const { relayStatuses } = await graphqlClient.request(GET_RELAY_STATUS);
          const statusRecord = relayStatuses?.[0] || null;
          set({ relayStatus: statusRecord, relayError: null });
        } catch (error) {
          console.error('Error fetching relay status:', error);
          set({ relayError: error });
        }
      };

      fetchStatus();
      pollingInterval = setInterval(fetchStatus, 5000);
    }
  },

  setUpdateRelayState: async (newVal, relayNumber, action) => {
    if (newVal) {
      try {
        await axios.post(`${configInit.appBaseUrl}/v1/api/control-relay`, {
          relayNumber,
          action
        });
        set({ relayStateUpdate: true });
      } catch (error) {
        console.error('Error updating relay state:', error);
        set({ relayStateUpdateError: error });
      }
    }
  }
}));

export default useRelayStatusStore;