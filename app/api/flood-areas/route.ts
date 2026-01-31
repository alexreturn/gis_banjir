// app/api/flood-areas/route.ts
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [rows]: any = await db.query(
    "SELECT id, name, lat, lng, radius FROM flood_areas",
  );

  const fixed = rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    lat: Number(r.lat),
    lng: Number(r.lng),
    radius: Number(r.radius),
  }));

  return NextResponse.json(fixed);
}

export async function POST(request: Request) {
  try {
    const { name, lat, lng, radius } = await request.json();

    if (!name || !lat || !lng || !radius) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    const [result] = await db.query(
      "INSERT INTO flood_areas (name, lat, lng, radius) VALUES (?, ?, ?, ?)",
      [name, lat, lng, radius],
    );

    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE data banjir
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id)
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    await db.query("DELETE FROM flood_areas WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT untuk edit
export async function PUT(request: Request) {
  try {
    const { id, name, lat, lng, radius } = await request.json();
    if (!id || !name || !lat || !lng || !radius) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 },
      );
    }

    await db.query(
      "UPDATE flood_areas SET name = ?, lat = ?, lng = ?, radius = ? WHERE id = ?",
      [name, lat, lng, radius, id],
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
