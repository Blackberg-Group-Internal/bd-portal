import { getGroupOwners } from '@/app/lib/microsoft/graphHelper';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const groupId = req.nextUrl.searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ error: 'groupId is required' }, { status: 400 });
    }

    console.log('Group ID:', groupId);
    const owners = await getGroupOwners(groupId);

    return new Response(JSON.stringify(owners), { status: 200 });
  } catch (error) {
    console.error('Error fetching group owners:', error);
    return new Response('Failed to fetch group owners', { status: 500 });
  }
}
