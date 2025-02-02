// app/api/flows/[id]/route.ts
import { NextResponse } from 'next/server';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5001';

/** GET /api/flows/:id => proxy to GET /api/v1/flows/:id */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const externalUrl = `${SERVER_URL}/api/v1/flows/${id}`;
    const res = await fetch(externalUrl, { method: 'GET' });

    if (res.status === 404) {
      return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch flow: ${res.status} ${res.statusText}`);
    }

    const flow = await res.json();
    return NextResponse.json(flow, { status: 200 });
  } catch (error: any) {
    console.error(`[GET /api/flows/${params.id}] Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** PUT /api/flows/:id => proxy to PUT /api/v1/flows/:id */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await req.json();

    const externalUrl = `${SERVER_URL}/api/v1/flows/${id}`;
    const res = await fetch(externalUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 404) {
      return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
    }
    if (!res.ok) {
      throw new Error(`Failed to update flow: ${res.status} ${res.statusText}`);
    }

    const updatedFlow = await res.json();
    return NextResponse.json(updatedFlow, { status: 200 });
  } catch (error: any) {
    console.error(`[PUT /api/flows/${params.id}] Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** DELETE /api/flows/:id => proxy to DELETE /api/v1/flows/:id */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const externalUrl = `${SERVER_URL}/api/v1/flows/${id}`;
    const res = await fetch(externalUrl, { method: 'DELETE' });

    if (res.status === 404) {
      return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
    }
    if (!res.ok) {
      throw new Error(`Failed to delete flow: ${res.status} ${res.statusText}`);
    }

    // External server returns 204 => no content
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(`[DELETE /api/flows/${params.id}] Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
