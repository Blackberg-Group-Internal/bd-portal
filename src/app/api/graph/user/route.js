import { getUserProfile, getUserPhoto } from '@/app/lib/microsoft/graph';

export async function GET(request) {
    try {

        const { searchParams } = new URL(request.url);
        const accessToken = searchParams.get('accessToken');

        if (!accessToken) {
            return new Response(JSON.stringify({ error: 'Access token is required' }), {
                status: 400,
            });
        }

        const userProfile = await getUserProfile(accessToken);
        const userPhoto = await getUserPhoto(accessToken);

        return new Response(
            JSON.stringify({
                userProfile,
                userPhoto,
            }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
