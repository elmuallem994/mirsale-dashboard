// app/api/[storeId]/checkout/route.ts

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds, userId, userName, userEmail, formData } =
    await req.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are required", { status: 400 });
  }

  if (!userId || !userName || !userEmail || !formData) {
    return new NextResponse(
      "User ID || !userName || !userEmail || !formData is required",
      { status: 400 }
    );
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      images: true,
    },
  });

  const orderItems = products.map((product) => ({
    productId: product.id,
    productName: product.name,
    productPrice: product.price,
    productImageUrl: product.images[0]?.url,
  }));

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach((product) => {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "USD",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price.toNumber() * 100,
      },
    });
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      userId: userId, // ربط الطلب بمعرف المستخدم
      userName: userName,
      userEmail: userEmail,
      isPaid: false,
      orderItems: {
        create: orderItems, // إنشاء السجلات في OrderItem مع الحقول المنسوخة
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id,
      userId: userId,
      userName: userName, // تضمين اسم المستخدم
      userEmail: userEmail,
      senderName: formData?.senderName || "", // تمرير بيانات المرسل
      senderPhone: formData?.senderPhone || "",
      recipientName: formData?.recipientName || "",
      recipientPhone: formData?.recipientPhone || "",
      recipientAddress: formData?.recipientAddress || "",
      additionalNotes: formData?.additionalNotes || "",
    }, // تضمين البريد الإلكتروني للمستخدم
  });
  return NextResponse.json(
    { url: session.url },
    {
      headers: corsHeaders,
    }
  );
}
