// app/(dashboard)/[storeId]/(routes)/orders/components/columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type OrderColumn = {
  id: string;
  userName: string; // اسم المستخدم
  userEmail: string; // البريد الإلكتروني للمستخدم
  phone: string;
  address: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  status: string; // حالة الطلب
  createdAt: string;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "userName", // عرض اسم المستخدم
    header: "User Name",
  },
  {
    accessorKey: "userEmail", // عرض البريد الإلكتروني
    header: "User Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "totalPrice",
    header: "Total price",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
      const status = row.original.status;

      let bgColor = "";
      switch (status) {
        case "تم استلام الطلب":
          bgColor = "bg-blue-500";
          break;
        case "يتم تجهيز طلبكم":
          bgColor = "bg-red-500";

          break;
        case "الطلب في الشحن":
          bgColor = "bg-yellow-500";
          break;
        case "تم تسليم طلبكم":
          bgColor = "bg-green-500";
          break;
        default:
          bgColor = "bg-green-500";
      }

      return (
        <span
          className={`flex items-center px-3 py-2 rounded-md text-center text-nowrap font-serif font-semibold text-white  ${bgColor}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "action",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
