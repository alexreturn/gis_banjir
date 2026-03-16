import db from "@/lib/db";
import { NextResponse } from "next/server";

// =====================
// GET KOMENTAR
// =====================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const flood_id = searchParams.get("flood_id");

    if (!flood_id) {
      return NextResponse.json(
        { error: "flood_id wajib dikirim" },
        { status: 400 },
      );
    }

    const [rows]: any = await db.query(
      `SELECT id,
              route_log_id,
              user_name,
              comment,
              is_admin,
              created_at
       FROM tb_komentar
       WHERE route_log_id = ?
       ORDER BY created_at DESC`,
      [flood_id],
    );

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =====================
// POST KOMENTAR
// =====================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { route_log_id, user_name, comment, is_admin } = body;

    if (!route_log_id || !user_name || !comment) {
      return NextResponse.json(
        { error: "Data komentar tidak lengkap" },
        { status: 400 },
      );
    }

    await db.query(
      `INSERT INTO tb_komentar
       (route_log_id, user_name, comment, is_admin)
       VALUES (?, ?, ?, ?)`,
      [route_log_id, user_name, comment, is_admin ? 1 : 0],
    );

    return NextResponse.json({
      success: true,
      message: "Komentar berhasil ditambahkan",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id)
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    await db.query("DELETE FROM tb_komentar WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
