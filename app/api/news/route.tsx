import db from "@/lib/db";
import { NextResponse } from "next/server";

// =====================
// GET LIST NEWS
// =====================
export async function GET() {
  try {
    const [rows] = await db.execute(
      `
      SELECT
        tb_news.id,
        tb_news.title,
        tb_news.content,
        tb_news.image,
        tb_news.created_at,
        tb_admin.nama AS author
      FROM tb_news
      JOIN tb_admin ON tb_news.admin_id = tb_admin.id
      ORDER BY tb_news.created_at DESC
    `,
    );
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =====================
// CREATE NEWS
// =====================
export async function POST(request: Request) {
  try {
    const { admin_id, title, content, image } = await request.json();

    if (!admin_id || !title || !content || !image) {
      return NextResponse.json(
        { error: "admin_id, title, content dan image wajib diisi" },
        { status: 400 },
      );
    }

    await db.query(
      `INSERT INTO tb_news
       (admin_id, title, content, image)
       VALUES (?,?,?,?)`,
      [admin_id, title, content, image],
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =====================
// UPDATE NEWS
// =====================
export async function PUT(request: Request) {
  try {
    const { id, title, content, image } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID wajib dikirim" }, { status: 400 });
    }

    // Siapkan field yang mau diupdate secara dinamis
    const fields: string[] = [];
    const values: any[] = [];

    if (typeof title === "string" && title.trim() !== "") {
      fields.push("title = ?");
      values.push(title);
    }
    if (typeof content === "string" && content.trim() !== "") {
      fields.push("content = ?");
      values.push(content);
    }
    if (typeof image === "string" && image.trim() !== "") {
      fields.push("image = ?");
      values.push(image);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada field yang diupdate" },
        { status: 400 },
      );
    }

    values.push(id);
    const sql = `UPDATE tb_news SET ${fields.join(", ")} WHERE id = ?`;

    const [result]: any = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =====================
// DELETE NEWS
// =====================
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID wajib dikirim" }, { status: 400 });
    }

    const [result]: any = await db.query("DELETE FROM tb_news WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
