// import { create } from 'zustand';
// import { graphqlClient } from '../../services/client';
// import { UPDATE_LOGSTATUS } from '../../services/query';
// import { toast } from 'react-toastify';

// export const useLogStatus = create((set, get) => ({
//     logStat: false,
//     setLogStat: (newVal) => set({ logStat: newVal }),
//     updateLogStat: async (newStatus, role) => {
//         try {
//             console.log('Attempting to update log status to:', newStatus, 'with role:', role);
//             const data = await graphqlClient.request(UPDATE_LOGSTATUS, { 
//               logStatus: newStatus, 
//               role: role 
//             });
            
//             if (data && data.update_profiles && data.update_profiles.returning && data.update_profiles.returning.length > 0) {
//                 const updatedLogStatus = data.update_profiles.returning[0].logStatus;
//                 set({ logStat: updatedLogStatus });
//                 console.log("Log status updated via GraphQL:", data);
//                 // window.location.reload(); // Consider if this is always necessary
//             } else {
//                 toast.error("Failed to update log status: No returning data.");
//                 console.error("Failed to update log status: No returning data from mutation.", data);
//             }
//             return data;
//         } catch (error) {
//             toast.error("Error updating log status.");
//             console.error("Error updating log status via GraphQL:", error);
//             throw error;
//         }
//     },
// }));
