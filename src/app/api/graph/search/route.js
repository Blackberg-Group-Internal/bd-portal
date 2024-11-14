import { searchSharePoint } from '@/app/lib/microsoft/graphHelper';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { query, folder } = await req.json();

    const searchResults = await searchSharePoint(query, folder);

    return NextResponse.json({ success: true, data: searchResults });
  } catch (error) {
    console.error('Error searching SharePoint:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
