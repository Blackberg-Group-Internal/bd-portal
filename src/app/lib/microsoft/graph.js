import { Client } from "@microsoft/microsoft-graph-client";

async function getClient(accessToken) {
    if (!accessToken) {
        throw new Error("No valid access token found");
    }

    return Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
}

export async function getUserProfile(accessToken) {
    try {
        const client = await getClient(accessToken);
        const profile = await client.api('/me').get();
        return profile;
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return null; 
    }
}

export async function getRecentFiles(accessToken) {
    try {
        const client = await getClient(accessToken);
        const recentFiles = await client.api('/me/drive/recent').get();
        console.log('Recent Files: ', recentFiles);
        return recentFiles.value; 
    } catch (error) {
        console.error("Error fetching recent files:", error);
        throw new Error('Failed to fetch recent files.');
    }
}

export async function getUserPhoto(accessToken) {
    try {
        const client = await getClient(accessToken);
        const photoResponse = await client
            .api('/me/photo/$value')
            .responseType('blob')
            .get();
        
        const photoUrl = URL.createObjectURL(photoResponse);
        return photoUrl;
    } catch (error) {
        console.error('Failed to fetch user photo:', error);
        return null; 
    }
}

export async function getFileDownloadUrl(accessToken, siteId, driveId, itemId) {
    try {
        const client = await getClient(accessToken);

        const fileMetadata = await client
            .api(`/sites/${siteId}/drives/${driveId}/items/${itemId}`)
            .select('@microsoft.graph.downloadUrl')
            .get();

        if (!fileMetadata['@microsoft.graph.downloadUrl']) {
            throw new Error('No download URL found for this file.');
        }

        return fileMetadata['@microsoft.graph.downloadUrl'];
    } catch (error) {
        console.error("Error fetching download URL for file:", error);
        throw new Error('Failed to fetch download URL for the file.');
    }
}
