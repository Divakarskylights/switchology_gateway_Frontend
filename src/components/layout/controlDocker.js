import { toast } from "react-toastify";
import { configInit } from "./globalvariable";

export const controlDocker = async (containerName, action) => {
  
  const requestPromise = fetch(`${configInit.appBaseUrl}/v2/api/docker/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ containerName, action }),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Failed to ${action} ${containerName}`);
    }
    return data;
  });

  return toast.promise(requestPromise, {
    pending: `Processing ${action}...`,
    success: (data) => `Data Capture ${data.message}ed successfully`,
    error: (err) => `${err.message}`,
  });
};
