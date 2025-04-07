'use client'

import React from "react"
import { Heading } from "@/components/heading"
import { useParams, useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { columns, OrderColumns } from "./columns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface OrdersClientProps {
  data: OrderColumns[]
}

export const OrdersClient = ({ data }: OrdersClientProps) => {
    const router = useRouter()
    const params = useParams()
    
    // Calculate statistics
    const totalOrders = data.length;
    const paidOrders = data.filter(order => order.isPaid).length;
    const pendingOrders = data.filter(order => !order.isPaid).length;
    const totalRevenue = data.reduce((sum, order) => {
      return sum + parseFloat(order.totalPrice.replace(/[^0-9.-]+/g, ""));
    }, 0);

    const handleExport = () => {
      const csvContent = [
        ["Order ID", "Customer Name", "Total Price", "Payment Status", "Order Date"],
        ...data.map(order => [
          order.id,
          order.customerName,
          order.totalPrice,
          order.isPaid ? "Paid" : "Pending",
          order.orderDate
        ])
      ]
        .map(row => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "orders.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Heading
                    title={`Orders Management`}
                    description="View and manage your store orders"
                />
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => router.refresh()}
                        className="gap-2"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button 
                        onClick={handleExport}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <Badge className="mt-1">All time</Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                        <p className="text-sm text-muted-foreground">Paid Orders</p>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                        <div className="text-2xl font-bold text-green-600">{paidOrders}</div>
                        <Badge variant="outline" className="mt-1 bg-green-50">
                            {totalOrders ? ((paidOrders/totalOrders)*100).toFixed(1) : 0}%
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                        <p className="text-sm text-muted-foreground">Pending Payments</p>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                        <div className="text-2xl font-bold text-red-600">{pendingOrders}</div>
                        <Badge variant="outline" className="mt-1 bg-red-50">
                            {totalOrders ? ((pendingOrders/totalOrders)*100).toFixed(1) : 0}%
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 pt-4 px-4">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                        <div className="text-2xl font-bold">₹ {totalRevenue.toFixed(2)}</div>
                        <Badge variant="secondary" className="mt-1">From {totalOrders} orders</Badge>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-0">
                    <h3 className="text-lg font-medium">Order List ({data.length})</h3>
                </CardHeader>
                <CardContent className="pt-4">
                    <DataTable 
                        searchKey="products" 
                        columns={columns} 
                        data={data}
                        searchPlaceholder="Search by product name..."
                    />
                </CardContent>
            </Card>
        </div>
    )
}
