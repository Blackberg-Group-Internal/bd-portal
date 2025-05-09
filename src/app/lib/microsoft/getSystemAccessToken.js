import axios from 'axios';

export async function getSystemAccessToken() {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  console.log('Get System Access Token');

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Missing Azure environment variables');
  }

  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'client_credentials');

  try {
    const response = await axios.post(tokenEndpoint, params);
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching system access token:', error.response?.data || error.message);
    throw new Error('Failed to fetch system access token');
  }
}