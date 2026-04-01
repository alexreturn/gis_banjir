import db from "@/lib/db";
import { NextResponse } from "next/server";

// =============================
// GET - Ambil Semua News
// =============================
export async function GET() {
  try {
    const [rows]: any = await db.query(
      "SELECT id, admin_id, title, content, image, created_at FROM tb_news ORDER BY created_at DESC",
    );

    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =============================
// POST - Tambah News
// =============================
export async function POST(request: Request) {
  try {
    const { admin_id, title, content, image } = await request.json();

    if (!admin_id || !title || !content) {
      return NextResponse.json(
        { error: "admin_id, title dan content wajib diisi" },
        { status: 400 },
      );
    }

    await db.query(
      `INSERT INTO tb_news (admin_id, title, content, image)
       VALUES (?, ?, ?, ?)`,
      [admin_id, title, content, image || null],
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =============================
// PUT - Update News
// =============================
export async function PUT(request: Request) {
  try {
    const { id, title, content, image } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID wajib dikirim" }, { status: 400 });
    }

    await db.query(
      `UPDATE tb_news
       SET title = ?, content = ?, image = ?
       WHERE id = ?`,
      [title, content, image || null, id],
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =============================
// DELETE - Hapus News
// =============================
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID wajib dikirim" }, { status: 400 });
    }

    await db.query("DELETE FROM tb_news WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
