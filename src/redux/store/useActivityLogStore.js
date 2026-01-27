
import { create } from 'zustand';
import { INSERT_ACTIVITY_LOG_MUTATION } from '../../services/query';
import { toast } from 'react-toastify';
import { graphqlClient } from '../../services/client';

// The store will now primarily be for the addLogEntry action.
// The actual logs will be fetched and managed by the ActivityLogTab component via subscription.
const useActivityLogStore = create((set) => ({
  addLogEntry: async (logEntryData) => {
    // Prepare variables for the mutation, ensuring all required fields are present
    const variables = {
      source: logEntryData.source,
      item_name: logEntryData.item_name || null, // Optional
      action: logEntryData.action,
      details: logEntryData.details || null, // Optional
      item_type: logEntryData.item_type || null, // Optional
      item_id: logEntryData.item_id || null, // Optional
      // user_id: logEntryData.user_id || null, // Optional, if you implement user tracking
    };

    try {
     // console.log('Attempting to insert activity log:', variables);
      const data = await graphqlClient.request(INSERT_ACTIVITY_LOG_MUTATION, {
        input: {
          activityLog: {
            source: logEntryData.source,
            itemName: logEntryData.item_name || null,
            action: logEntryData.action,
            details: logEntryData.details || null,
            itemType: logEntryData.item_type || null,
            itemId: logEntryData.item_id || null,
          }
        }
      });
      if (data?.createActivityLog?.activityLog?.id) {
       // console.log('Activity log inserted successfully:', data.insert_activity_log_one);
        // No need to update local state here, subscription in ActivityLogTab will handle UI update.
      } else {
        toast.error('Failed to insert activity log: No ID returned.');
        //console.error('Failed to insert activity log, response:', data);
      }
    } catch (error) {
      toast.error('Error inserting activity log.');
      console.error('Error inserting activity log via GraphQL:', error);
      // Optionally re-throw or handle more gracefully
    }
  },
}));

export default useActivityLogStore;
