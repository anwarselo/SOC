// POST body: { status, callbackDate?, result?, comments? }
export async function POST() {
  // zod validate; enforce status rules
  // write to DB; return updated record
  return Response.json({ ok: true })
}