import { configInit } from '../component/global/globalvariable'; 

export const setGrafanaRole = async (userRole, roleUpdateRef) => {
  if (roleUpdateRef.current) {
   // console.log('Role already updated, skipping...');
    return;
  }

  const grafanaBaseUrl = configInit.appBaseUrl; 

  try {
    // Use the constructed grafanaBaseUrl
    const response = await fetch(`${grafanaBaseUrl}/d/main/page/dashboards/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Grafana-Org-Id': '1'
        // Add authentication headers if Grafana requires them and is not using cookie-based auth
        // e.g., 'Authorization': 'Bearer YOUR_GRAFANA_API_KEY'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Grafana API error:', errorData);
      
      if (response.status === 401) {
        console.warn('Grafana authentication failed - continuing without role update');
        roleUpdateRef.current = true;
        return;
      }
      if (response.status === 403) {
        console.warn('Grafana API access denied - continuing without role update');
        roleUpdateRef.current = true;
        return;
      }
      console.warn(`Grafana API error: ${response.status} - continuing without role update`);
      roleUpdateRef.current = true;
      return;
    }

    const users = await response.json();
    const adminUser = users.find(user => user.id === 1); // Assuming admin user ID is 1
    
    if (adminUser) {
      try {
        // Use the constructed grafanaBaseUrl for update
        const updateResponse = await fetch(`${grafanaBaseUrl}/d/main/page/dashboards/api/org/users/${adminUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Grafana-Org-Id': '1'
            // Add authentication headers if needed
          },
          body: JSON.stringify({
            role: userRole === 'ADMIN' ? 'Editor' : 'Viewer' // Map your app roles to Grafana roles
          })
        });

        if (!updateResponse.ok) {
          console.warn('Failed to update Grafana role - continuing without role update');
          roleUpdateRef.current = true;
          return;
        }

        roleUpdateRef.current = true;
     //   console.log('Grafana role updated successfully');
      } catch (error) {
        console.warn('Error updating Grafana role:', error);
        roleUpdateRef.current = true;
      }
    } else {
      console.warn('Admin user not found in Grafana - continuing without role update');
      roleUpdateRef.current = true;
    }
  } catch (error) {
    console.warn('Grafana service error:', error);
    // This could be a network error if Grafana is not reachable at grafanaBaseUrl
    roleUpdateRef.current = true;
  }
};