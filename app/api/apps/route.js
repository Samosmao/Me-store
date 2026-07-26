import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApps, saveApps } from "@/lib/store";
import { isValidSession, ADMIN_COOKIE_NAME } from "@/lib/auth";

function requireAdmin() {
  const cookieStore = cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return isValidSession(session);
}

export async function GET() {
  try {
    const apps = await getApps();
    return NextResponse.json({ apps });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const newApp = await req.json();
    const apps = await getApps();
    const id =
      newApp.id ||
      newApp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString(36);
    apps.push({ ...newApp, id });
    await saveApps(apps);
    return NextResponse.json({ apps });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const updatedApp = await req.json();
    const apps = await getApps();
    const idx = apps.findIndex((a) => a.id === updatedApp.id);
    if (idx === -1) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }
    apps[idx] = updatedApp;
    await saveApps(apps);
    return NextResponse.json({ apps });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    const apps = await getApps();
    const filtered = apps.filter((a) => a.id !== id);
    await saveApps(filtered);
    return NextResponse.json({ apps: filtered });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
