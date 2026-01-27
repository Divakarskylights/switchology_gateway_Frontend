import { toast } from "react-toastify";
import { configInit } from "./globalvariable";
import { TOAST_IDS } from "../../constants/toastIds";

export const controlDocker = async (containerName, action) => {
  
  const requestPromise = fetch(`${configInit.appBaseUrl}/api/docker/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ containerName, action }),
  }).then(async (res) => {
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const errMsg =
        data?.detail?.error ||
        data?.error ||
        `Failed to ${action} ${containerName}`;
      const errDetails = data?.detail?.details || '';
      throw new Error([errMsg, errDetails].filter(Boolean).join(' - '));
    }

    return data || { message: action };
  });

  return toast.promise(requestPromise, {
    toastId: TOAST_IDS.DOCKER_OPERATION,
    pending: `Processing ${action}...`,
    success: (data) => `Data Capture ${data.message}ed successfully`,
    error: (err) => `${err.message}`,
  });
};