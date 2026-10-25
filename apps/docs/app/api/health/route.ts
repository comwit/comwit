export function GET() {
  return Response.json(
    { status: 'ok', revision: process.env.NEXT_PUBLIC_BUILD_REVISION || 'local' },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
