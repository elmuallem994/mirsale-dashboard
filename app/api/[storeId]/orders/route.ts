// app/api/[storeId]/orders/route.ts

import prismadb from "@/lib/prismadb";
import { NextResponse, NextRequest } from "next/server";

// إعدادات CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// دالة للتعامل مع طلبات OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    // استخدام getAuth للتحقق من المستخدم
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return new NextResponse("Unauthenticated", {
        status: 401,
        headers: corsHeaders,
      });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
        userId: userId, // جلب الطلبات الخاصة بالمستخدم
      },
      include: {
        user: true,
        orderItems: true,
      },
    });

    return NextResponse.json(orders, { headers: corsHeaders });
  } catch (error) {
    console.log("[ORDERS_GET]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
