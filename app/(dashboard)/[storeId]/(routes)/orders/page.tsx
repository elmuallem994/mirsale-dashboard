// app/(dashboard)/[storeId]/(routes)/orders/page.tsx

import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/columns";
import { formatter } from "@/lib/utils";

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      user: true, // تضمين معلومات المستخدم
      orderItems: true, // تضمين معلومات المنتجات في الطلب
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    userName: item.user?.name || "Unknown",
    userEmail: item.user?.email || "Unknown",
    phone: item.phone,
    address: item.address,
    products: item.orderItems
      .map((orderItem) => orderItem.productName)
      .join(", "), // أسماء المنتجات فقط

    totalPrice: formatter.format(
      item.orderItems.reduce((total, item) => {
        return total + Number(item.productPrice);
      }, 0)
    ),
    isPaid: item.isPaid,
    status: item.status, // حالة الطلب
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};
export default OrdersPage;
