import { getRepositories } from "@/lib/data";
import { getApiSession, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const repos = getRepositories();
    const data = await repos.assets.getWithMetricsById(id);

    if (!data) {
      return Response.json({ error: "Asset not found" }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("[assets-get]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const repos = getRepositories();
    const body = await req.json();
    const updated = await repos.assets.update(id, body);

    if (!updated) {
      return Response.json({ error: "Asset not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    console.error("[assets-update]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession();
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const repos = getRepositories();
    const deleted = await repos.assets.delete(id);

    if (!deleted) {
      return Response.json({ error: "Asset not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[assets-delete]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
