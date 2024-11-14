import { getGroupMemberships } from '@/app/lib/microsoft/graphHelper';

export async function GET(req) {
    try {
        const userId = req.nextUrl.searchParams.get('userId');
    
        if (!userId) {
          return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }
    
        console.log('User ID:', userId);
        const groups = await getGroupMemberships(userId);
        return new Response(JSON.stringify(groups), { status: 200 });
  } catch (error) {
    console.error('Error fetching group memberships:', error);
    return new Response('Failed to fetch group memberships', { status: 500 });
  }
}
