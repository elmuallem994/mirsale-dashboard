//  app/(dashboard)/[storeId]/(routes)/orders/[orderId]/components/order-form.tsx

"use client";

import * as z from "zod";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Order, OrderItem, Product, Image as ImageType } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dateFormatter, formatter } from "@/lib/utils";
import Image from "next/image";
import { Prisma } from "@prisma/client";

const formSchema = z.object({
  status: z.string().min(1), // الحقل الجديد لتحديث حالة الطلب
});

type OrderFormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  initialData: Order & {
    orderItems: {
      id: string;
      orderId: string;
      productId: string | null;
      productName: string;
      productPrice: Prisma.Decimal; // استخدم Prisma.Decimal هنا
      productImageUrl: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  };
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: initialData.status,
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setLoading(true);
      await axios.patch(
        `/api/${params.storeId}/orders/${params.orderId}`,
        data
      );
      router.refresh();
      window.location.assign(`/${params.storeId}/orders`);
      toast.success("Order updated successfully.");
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Heading title="Order Details" description="View order details" />
      <Separator className="my-6" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-2 gap-8">
            {/* Products List */}
            <div>
              <Heading
                title="Products in this order"
                description="List of products"
              />
              {initialData.orderItems.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  <Image
                    src={item.productImageUrl || "/placeholder-image.png"}
                    alt={item.productName}
                    width={120}
                    height={120}
                    className="aspect-square object-cover rounded-md"
                  />
                  <div className="items-start justify-start space-y-7">
                    <p>{item.productName}</p>
                    <p>{formatter.format(Number(item.productPrice))}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Heading title="Customer Information" description="Details" />
              <p>
                <strong>Name:</strong> {initialData.userName}
              </p>
              <p>
                <strong>Email:</strong> {initialData.userEmail}
              </p>
              <p>
                <strong>Phone:</strong> {initialData.phone}
              </p>
              <p>
                <strong>Address:</strong> {initialData.address}
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                {dateFormatter.format(new Date(initialData.createdAt))}
              </p>
              <p>
                <strong>Paid:</strong> {initialData.isPaid ? "Yes" : "No"}
              </p>
            </div>
          </div>
          <div className="w-80">
            <FormItem>
              <FormLabel>Order Status</FormLabel>
              <FormControl>
                <Select
                  disabled={loading}
                  onValueChange={(value) => form.setValue("status", value)} // هنا نمرر المفتاح "status" والقيمة الجديدة "value"
                  value={form.watch("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="تم استلام الطلب"
                      className="bg-yellow-100 text-yellow-700 rounded-full px-2 py-1"
                    >
                      تم استلام الطلب
                    </SelectItem>
                    <SelectItem
                      value="يتم تجهيز طلبكم"
                      className="bg-blue-100 text-blue-700 rounded-full px-2 py-1"
                    >
                      يتم تجهيز طلبكم
                    </SelectItem>
                    <SelectItem
                      value="الطلب في الشحن"
                      className="bg-orange-100 text-orange-700 rounded-full px-2 py-1"
                    >
                      الطلب في الشحن
                    </SelectItem>
                    <SelectItem
                      value="تم تسليم طلبكم"
                      className="bg-green-100 text-green-700 rounded-full px-2 py-1"
                    >
                      تم تسليم طلبكم
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
};
