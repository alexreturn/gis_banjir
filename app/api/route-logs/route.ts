import db from "@/lib/db";
import { NextResponse } from "next/server";

// GET semua log
// export async function GET() {
//   const [rows]: any = await db.query(
//     "SELECT * FROM tb_route_logs ORDER BY created_at DESC",
//   );

//   return NextResponse.json(rows);
// }

//GET semua log berdasarkan session_id
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get("session_id");

  const [rows]: any = await db.query(
    "SELECT * FROM tb_route_logs WHERE session_id = ? ORDER BY created_at DESC LIMIT 3",
    [session_id],
  );

  return NextResponse.json(rows);
}

// POST simpan log
export async function POST(request: Request) {
  try {
    const {
      session_id,
      start_address,
      start_lat,
      start_lng,
      end_address,
      end_lat,
      end_lng,
      distance_km,
      duration_min,
      selected_route_index,
    } = await request.json();

    await db.query(
      `INSERT INTO tb_route_logs 
  (session_id,start_address,start_lat,start_lng,end_address,end_lat,end_lng,distance_km,duration_min,selected_route_index)
  VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        session_id,
        start_address,
        start_lat,
        start_lng,
        end_address,
        end_lat,
        end_lng,
        distance_km,
        duration_min,
        selected_route_index,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
