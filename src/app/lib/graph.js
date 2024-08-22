// src/lib/graph.js
import { Client } from "@microsoft/microsoft-graph-client";
import { getSession } from "next-auth/react";

// Function to get the Graph client initialized with the access token
async function getClient() {
    const session = await getSession();
    console.log('Session: ', session);

    if (!session || !session.accessToken) {
        throw new Error("No valid session or access token found");
    }

    const accessToken = session.accessToken;

    return Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
}

// Function to get the user profile
export async function getUserProfile() {
    const client = await getClient();
    return client.api('/me').get();
}

// Function to get the user photo
export async function getUserPhoto() {
    const client = await getClient();
    try {
        const photo = await client.api('/me/photo/$value').get();
        const blob = await photo.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Failed to fetch user photo:', error);
        return null; // Return null if photo is not available or if there's an error
    }
}
