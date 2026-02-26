import db from "@/lib/db";
import { NextResponse } from "next/server";

// =====================
// GET LIST NEWS
// =====================
export async function GET() {
  try {
    const [rows] = await db.execute(`
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
    `);

    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// =====================
// POST NEWS
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
