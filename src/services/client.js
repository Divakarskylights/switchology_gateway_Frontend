import axios from 'axios';
import { GraphQLClient, gql } from 'graphql-request';
import { configInit } from '../components/layout/globalvariable';

// HTTP GraphQL Client with timeout
export const graphqlClient = new GraphQLClient(configInit.appBaseUrl + '/query/graphql', {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  credentials: 'omit',
  mode: 'cors',
});

console.log("appBaseUrl", configInit.appBaseUrl);
const fetchData = async () => {
  try {
    const response = await axios.get(`${configInit.appBaseUrl}/v2/api/os`);
    return response;
  } catch (error) {
    console.error("fetchData error:", error);
    return null;
  }
};

export { fetchData, gql };