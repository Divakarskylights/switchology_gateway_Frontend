import { useState } from 'react';

const useAuthKey = ({ validKey, onSuccessRedirect = '/' }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setApiKey(e.target.value);
    setError(null); // Clear error on input change
  };

  const handleSubmit = async () => {
    console.log('AuthKeyPage - handleSubmit called');
    console.log('AuthKeyPage - apiKey:', apiKey);
    console.log('AuthKeyPage - validKey:', validKey);
    console.log('AuthKeyPage - onSuccessRedirect:', onSuccessRedirect);
    
    if (apiKey === validKey) {
      console.log('AuthKeyPage - Key matches, authentication successful');
      
      try {
        // For now, we'll just reload the page to reflect the updated gatewayAuth.json
        // In a real application, you would call an API to update the file
        console.log('Authentication successful - gateway lock should be updated to true');
        
        // Reload the page to reflect the updated gatewayAuth.json
        window.location.reload();
      } catch (err) {
        console.warn('Error updating gateway lock:', err);
        // Still redirect even if update fails
        window.location.href = onSuccessRedirect;
      }
    } else {
      console.log('AuthKeyPage - Key does not match');
      setError('Invalid authentication key');
    }
  };

  return { apiKey, error, handleInputChange, handleSubmit };
};

export default useAuthKey;
