import axios from 'axios';
import qs from 'qs';
import { getSession } from 'next-auth/react'; 

const { AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID } = process.env;

const getAccessToken = async (req) => {
  
  const tokenUrl = `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;

  const response = await axios.post(
    tokenUrl,
    qs.stringify({
      client_id: AZURE_AD_CLIENT_ID,
      scope: 'https://graph.microsoft.com/.default',
      client_secret: AZURE_AD_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
};

export const getGroupMemberships = async (userId) => {
  const token = await getAccessToken();
  const graphUrl = `https://graph.microsoft.com/v1.0/users/${userId}/memberOf`;

  const response = await axios.get(graphUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getDocumentLibraryContents = async (libraryId) => {
    const token = await getAccessToken();
    const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429"
    const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";
    const graphUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root/children`;
  
    const response = await axios.get(graphUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return response.data;
  };

  export const getDocumentLibraryFiles = async (libraryId) => {
    const token = await getAccessToken();
    const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429";
    const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";
    const graphUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root/children?$filter=file`;
    console.log('Files Bearer: ' + token);
    console.log('Files URL: ' + graphUrl);
    const response = await axios.get(graphUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return response.data;
  };

  export const getRecentFiles = async () => {
    try {
      const token = await getAccessToken();
      const graphUrl = 'https://graph.microsoft.com/v1.0/me/drive/recent';
  
      const response = await axios.get(graphUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response.data.value;
    } catch (error) {
      console.error('Error fetching recent files:', error);
      throw new Error('Failed to fetch recent files.');
    }
  };
  

  export async function getFolderContents(folderId) {
    const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429";
    const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";
    try {
      const accessToken = await getAccessToken(); 
  
      const url = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${folderId}/children`;
  
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      return response.data;
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      throw new Error('Failed to retrieve folder contents.');
    }
  }


  export async function uploadFileToSharePoint(folderPath, files, filesBuffer) {
    const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429";
    const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";
    console.log('Helper Folder Path: ' + folderPath);
    try {
      const accessToken = await getAccessToken();
      const uploadPromises = files.map((file, index) => {
        const fileContent = filesBuffer[index]; 
  

        const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${folderPath}:/${file.name}:/content
`
        console.log('Upload URL: ' + uploadUrl);
  
        return axios.put(uploadUrl, fileContent, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': file.type,
            'Content-Length': file.size,
          },
        });
      });
  
      const responses = await Promise.all(uploadPromises);
      return responses.map((res) => res.data);
    } catch (error) {
      console.error('Error uploading files to SharePoint:', error);
      throw new Error('Failed to upload files to SharePoint');
    }
  }
  


  export async function searchSharePoint(query, folder) {
    const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429"; 
    const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";
    try {
      const accessToken = await getAccessToken();
      
      console.log('Folder Path: ' + folder);
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${folder}/search(q='${query}')`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const files = response.data.value.filter(item => item.file);
    
      return files;

    } catch (error) {
      console.error('Error searching SharePoint:', error);
      throw new Error('Failed to search SharePoint');
    }
  }
  
export const addFolder = async (folderName, parentFolderId) => {
  const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429"; 
  const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";

  try {
    const accessToken = await getAccessToken();
    const url = parentFolderId !== ""
    ? `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${parentFolderId}/children`
    : `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/root/children`;


    console.log('Helper: Parent Folder ID: ' + parentFolderId);
    console.log('Helper API URL: ' + url);
  

    const response = await axios.post(
      url,
      {
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename', 
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating folder in SharePoint:', error);
    throw new Error('Failed to create folder in SharePoint');
  }
};

export const addTagsToFile = async (fileId, tags) => {
  const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429";
  const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";

  try {
    const accessToken = await getAccessToken();
    const url = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${fileId}/listItem/fields`;

    const response = await axios.patch(
      url,
      {
        Tags: tags 
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error adding tags to file in SharePoint:', error);
    throw new Error('Failed to add tags to file in SharePoint');
  }
};

export async function convertFileToPDF(fileId) {
  const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429";
  const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";
  try {
      const accessToken = await getAccessToken();  

      const url = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${fileId}/content?format=pdf`;

      const response = await axios.get(url, {
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/pdf'
          },
          responseType: 'arraybuffer'
      });

      return response.data;
  } catch (error) {
      console.error('Failed to convert file to PDF:', error);
      throw new Error('Failed to convert file to PDF');
  }
}

export async function getFileDetails(fileId) {
  const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429";
  const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";
  try {
    const accessToken = await getAccessToken();

    const url = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${fileId}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching file details from SharePoint:', error);
    throw new Error('Failed to retrieve file details.');
  }
}

export const getDocumentLibraryAllFiles = async (folderPath = 'root') => {
  const siteId = "871f4fc4-277d-44b7-8776-759d5c51c429";
  const driveId = "b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re";
  const token = await getAccessToken();
  const graphUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${folderPath}/children`;

  try {
    const response = await axios.get(graphUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const items = response.data.value;
    
    let allItems = items.filter(item => !item.folder);

    for (const item of items) {
      if (item.folder) {
        const subfolderItems = await getDocumentLibraryAllFiles(item.id);
        allItems = [...allItems, ...subfolderItems];
      }
    }

    return allItems;
  } catch (error) {
    console.error('Error fetching document library contents:', error);
    throw new Error('Failed to retrieve document library contents');
  }
};
