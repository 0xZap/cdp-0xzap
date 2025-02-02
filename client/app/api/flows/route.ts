// app/api/flows/route.ts
import { NextResponse } from 'next/server';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5001';

/** GET /api/flows => proxy to GET /api/v1/flows on external server */
export async function GET() {
  try {
    const externalUrl = `${SERVER_URL}/api/v1/flows`;
    const res = await fetch(externalUrl, { method: 'GET' });

    if (!res.ok) {
      throw new Error(`Failed to fetch flows: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/flows] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** POST /api/flows => proxy to POST /api/v1/flows on external server */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const externalUrl = `${SERVER_URL}/api/v1/flows`;
    const res = await fetch(externalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // Could parse res.json() or res.text() for more detail
      throw new Error(`Failed to create flow: ${res.status} ${res.statusText}`);
    }

    const createdFlow = await res.json();
    return NextResponse.json(createdFlow, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/flows] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
