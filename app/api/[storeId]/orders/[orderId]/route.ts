//  app/api/[storeId]/orders/[orderId]/route.ts

import { auth } from "@clerk/nextjs/server";
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

// استرجاع تفاصيل الطلب بناءً على معرف الطلب
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    if (!params.orderId) {
      return new NextResponse("Order id is required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const order = await prismadb.order.findUnique({
      where: {
        id: params.orderId,
      },
      include: {
        user: true,
        orderItems: true, // تضمين تفاصيل العناصر في الطلب
        formData: true, // جلب بيانات الفورم المرتبطة
      },
    });

    return NextResponse.json(order, { headers: corsHeaders });
  } catch (error) {
    console.log("[ORDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// تحديث تفاصيل الطلب بناءً على معرف الطلب
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { status } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    if (!params.orderId) {
      return new NextResponse("Order id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const order = await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        status, // تحديث حالة الطلب
      },
    });

    return NextResponse.json(order, { headers: corsHeaders });
  } catch (error) {
    console.log("[ORDER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
