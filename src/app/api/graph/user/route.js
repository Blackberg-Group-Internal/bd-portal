//import { getUserProfile, getUserPhoto} from "@/app/lib/graph";
import { getUserProfile, getUserPhoto } from '../../../lib/graph';

export async function GET(request) {
    try {
        const userProfile = await getUserProfile();
        const userPhoto = await getUserPhoto();
        
        return new Response(JSON.stringify({
            userProfile,
            userPhoto,
        }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}