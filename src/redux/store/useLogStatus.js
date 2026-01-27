import { create } from "zustand";
import { graphqlClient } from '../../client/client';
import { UPDATE_PROFILE } from '../../client/query';
import { toast } from 'react-toastify';

export const useLogStatus = create((set, get) => ({
    logStat: undefined,
    setLogStat: (newVal) => set({ logStat: newVal }),
    updateLogStat: async (nodeId, newStatus, role, userid) => {
        try {
            console.log('Attempting to update log status to:', newStatus, 'with role:', role, 'for nodeId:', nodeId);
            const data = await graphqlClient.request(UPDATE_PROFILE, {
                input: {
                    nodeId: nodeId,
                    profilePatch: {
                        logStatus: newStatus,
                        role: role,
                        userid: userid
                    }
                }
            });

            console.log("Return profile from mutation:", data.updateProfile.profile);
            

            if (data?.updateProfile?.profile) {
                const updatedLogStatus = data.updateProfile.profile.logStatus;
                set({ logStat: updatedLogStatus });
                console.log("Log status updated via GraphQL:", data);
            } else {
                toast.error("Failed to update log status: No returning data.");
                console.error("Failed to update log status: No returning data from mutation.", data);
            }
            return data;
        } catch (error) {
            toast.error("Error updating log status.");
            console.error("Error updating log status via GraphQL:", error);
            throw error;
        }
    },
}));