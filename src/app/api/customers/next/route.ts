// GET /api/customers/next?view=pending|callbacks
export async function GET() {
  // server session check (Better Auth)
  // query next record by city & view; LIMIT 1
  // return JSON
  return Response.json({ ok: true })
}