//  app/(dashboard)/[storeId]/(routes)/orders/[orderId]/page.tsx

import prismadb from "@/lib/prismadb";
import { OrderForm } from "./components/order-form";

const ProductPage = async ({
  params,
}: {
  params: { orderId: string; storeId: string };
}) => {
  const order = await prismadb.order.findUnique({
    where: {
      id: params.orderId,
    },
    include: {
      orderItems: true,
    },
  });

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderForm initialData={order} />
      </div>
    </div>
  );
};
export default ProductPage;
