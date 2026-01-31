import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username & Password wajib diisi" },
        { status: 400 },
      );
    }
    const [rows]: any = await db.query(
      "SELECT id, username, password, nama FROM user WHERE username = ?",
      [username],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Username atau password salah" },
        { status: 401 },
      );
    }

    const user = rows[0];

    const hashedPassword = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");

    if (hashedPassword !== user.password) {
      return NextResponse.json(
        { success: false, error: "Username atau password salah" },
        { status: 401 },
      );
    }

    // Login sukses
    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, nama: user.nama },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 },
    );
  }
}
