import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";
export async function GET(req: Request) {
  try {
    const { user, admin } = await requireUpdatesAdmin(req);
    return Response.json(
      { ok: true, email: user.email, role: admin.role },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e?.message || "unauthorized" },
      { status: e?.status || 403 },
    );
  }
}
