import { NextRequest, NextResponse } from 'next/server';

/**
 * SDF Data Proxy API Route
 *
 * Fetches SDF (Structure Data File) from PubChem on the server side
 * and returns it to the client. This avoids any potential browser-level
 * issues with direct PubChem fetching (CORS, referrer policy, etc.)
 *
 * POST /api/structure/sdf
 * Body: { cid: number, record_type?: '3d' | '2d' }
 * Returns: { sdf: string, recordType: string } | { error: string }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cid, record_type } = body;

    if (!cid || typeof cid !== 'number' || cid <= 0) {
      return NextResponse.json({ error: 'Valid PubChem CID is required.' }, { status: 400 });
    }

    const requestedType = record_type === '2d' ? '2d' : '3d';

    // Try 3D SDF first (if requested), then fallback to 2D
    let sdfData = '';
    let actualType = '';

    if (requestedType === '3d') {
      try {
        const url3d = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`;
        const res3d = await fetch(url3d, { signal: AbortSignal.timeout(20000) });
        if (res3d.ok) {
          const text = await res3d.text();
          if (text.trim().length > 50 && (text.includes('ATOM') || text.includes('M  END'))) {
            sdfData = text;
            actualType = '3d';
          }
        }
      } catch {
        // 3D fetch failed, try 2D fallback
      }
    }

    // Fallback to 2D SDF if 3D not available or not requested
    if (!sdfData) {
      try {
        const url2d = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=2d`;
        const res2d = await fetch(url2d, { signal: AbortSignal.timeout(15000) });
        if (res2d.ok) {
          const text = await res2d.text();
          if (text.trim().length > 50 && (text.includes('ATOM') || text.includes('M  END'))) {
            sdfData = text;
            actualType = '2d';
          }
        }
      } catch {
        // 2D fetch also failed
      }
    }

    if (!sdfData) {
      return NextResponse.json({
        error: `No SDF data available for CID ${cid}. This compound may not have 3D conformer data in PubChem.`,
        sdf: '',
        recordType: '',
      }, { status: 404 });
    }

    return NextResponse.json({
      sdf: sdfData,
      recordType: actualType,
    });
  } catch (error) {
    console.error('SDF proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch SDF data.' }, { status: 500 });
  }
}
