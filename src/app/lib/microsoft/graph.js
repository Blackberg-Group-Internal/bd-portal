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

