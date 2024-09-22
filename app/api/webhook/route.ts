//  app/api/webhook/route.ts

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ];

  const addressString = addressComponents.filter((c) => c !== null).join(", ");

  if (event.type === "checkout.session.completed") {
    const orderId = session?.metadata?.orderId;

    if (!orderId) {
      return new NextResponse("Order ID is missing", { status: 400 });
    }

    const userId = session?.metadata?.userId;
    const userName = session?.metadata?.userName || "Unknown"; // استخدام قيمة افتراضية في حال كانت القيمة غير معروفة
    const userEmail = session?.metadata?.userEmail || "Unknown"; // استخدام قيمة افتراضية في حال كانت القيمة غير معروفة

    let user = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await prismadb.user.create({
        data: {
          id: userId,
          email: userEmail,
          name: userName,
        },
      });
    }

    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || "",
        userName: user.name,
        userEmail: user.email,
      },
      include: {
        orderItems: true,
      },
    });

    // حفظ بيانات المرسل والمستلم في formdata
    const formData = {
      orderId: orderId,
      senderName: session.metadata?.senderName || "Unknown", // إضافة التحقق من null
      senderPhone: session.metadata?.senderPhone || "Unknown",
      recipientName: session.metadata?.recipientName || "Unknown",
      recipientPhone: session.metadata?.recipientPhone || "Unknown",
      recipientAddress: session.metadata?.recipientAddress || "Unknown",
      additionalNotes: session.metadata?.additionalNotes || "",
    };

    await prismadb.formData.create({
      data: formData,
    });

    const productIds = order.orderItems.map((orderItem) => orderItem.productId);

    const validProductIds = productIds.filter((id) => id !== null);

    await prismadb.product.updateMany({
      where: {
        id: {
          in: validProductIds,
        },
      },
      data: {
        isArchived: true,
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
