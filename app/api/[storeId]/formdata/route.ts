// app/api/[storeId]/formdata/route.ts

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

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const {
      orderId,
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      recipientAddress,
      additionalNotes,
    } = body;

    if (!senderName) {
      return new NextResponse("senderName is required", { status: 400 });
    }

    if (!senderPhone) {
      return new NextResponse("senderPhone is required", { status: 400 });
    }

    if (!recipientName) {
      return new NextResponse("recipientName is required", { status: 400 });
    }
    if (!recipientPhone) {
      return new NextResponse("recipientPhone is required", { status: 400 });
    }
    if (!recipientAddress) {
      return new NextResponse("recipientAddress is required", { status: 400 });
    }
    if (!additionalNotes) {
      return new NextResponse("additionalNotes is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const formData = await prismadb.formData.create({
      data: {
        orderId: orderId || null, // يمكن أن يكون null إذا لم يتم توفيره
        senderName,
        senderPhone,
        recipientName,
        recipientPhone,
        recipientAddress,
        additionalNotes,
      },
    });

    return NextResponse.json(formData, { headers: corsHeaders });
  } catch (error) {
    console.error("Error creating form data:", error);
    return new NextResponse("Failed to create form data", { status: 500 });
  }
}
