import db from "@/lib/db";
import { NextResponse } from "next/server";

// =====================
// GET DETAIL NEWS
// =====================
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const [rows]: any = await db.execute(
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
      WHERE tb_news.id = ?
      `,
      [params.id],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "News tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
