"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
// Import the client-safe version of the chart component
import OverviewClient from "@/components/overview-client";
import { formatter } from "@/lib/utils";
import { format } from "date-fns";
import {
  TrendingUp,
  Clock,
  CreditCard,
  Tag,
  Truck,
  Package,
} from "lucide-react";

interface DashboardTabsProps {
  monthlyGraphRevenue: any[];
  recentOrdersData: any[];
  topSellingProducts: any[];
  revenueByCategory: any[];
  revenueByOrderStatus: any[];
  orderPaymentStatusRevenue: any[];
  inventoryItems: any[];
  inventoryStats: {
    totalItems: number;
    lowStock: number;
    totalValue: number;
  };
  totalRevenue: number;
  totalSales: number;
}

export const DashboardTabs = ({
  monthlyGraphRevenue,
  recentOrdersData,
  topSellingProducts,
  revenueByCategory,
  revenueByOrderStatus,
  orderPaymentStatusRevenue,
  inventoryItems,
  inventoryStats,
  totalRevenue,
  totalSales,
}: DashboardTabsProps) => {
  // Ensure we have valid data for all metrics
  const safeRevenue = totalRevenue > 0 ? totalRevenue : 1; // Prevent division by zero
  
  // Ensure we have valid data for all charts
  const validMonthlyGraphRevenue = monthlyGraphRevenue.length > 0 
    ? monthlyGraphRevenue 
    : Array.from({ length: 12 }, (_, i) => ({
        name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
        total: 0
      }));
  
  const validRevenueByCategory = revenueByCategory.length > 0 
    ? revenueByCategory 
    : [{ name: "No Categories", total: 0 }];
  
  const validRevenueByOrderStatus = revenueByOrderStatus.length > 0 
    ? revenueByOrderStatus 
    : [
        { name: "Processing", total: 0 },
        { name: "Delivering", total: 0 },
        { name: "Delivered", total: 0 },
        { name: "Canceled", total: 0 }
      ];
  
  const validOrderPaymentStatusRevenue = orderPaymentStatusRevenue.length > 0 
    ? orderPaymentStatusRevenue 
    : [
        { name: "Paid", total: 0 },
        { name: "Not Paid", total: 0 }
      ];

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex flex-wrap w-full bg-muted/20 p-1 rounded-lg">
  <TabsTrigger
    value="overview"
    className="flex-1 min-w-[80px] text-xs sm:text-sm rounded-md py-2 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800"
  >
    Overview
  </TabsTrigger>
  <TabsTrigger
    value="sales"
    className="flex-1 min-w-[80px] text-xs sm:text-sm rounded-md py-2 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800"
  >
    Sales
  </TabsTrigger>
  <TabsTrigger
    value="inventory"
    className="flex-1 min-w-[80px] text-xs sm:text-sm rounded-md py-2 px-1 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800"
  >
    Inventory
  </TabsTrigger>
</TabsList>


      <TabsContent value="overview" className="space-y-6">
        {/* Monthly Revenue Chart */}
        <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue Overview</CardTitle>
                <CardDescription>
                  Revenue breakdown for selected period
                </CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[250px] sm:h-[300px]">
              <OverviewClient data={validMonthlyGraphRevenue} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders and Top Products */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              {recentOrdersData.length > 0 ? (
                <div className="space-y-4">
                  {recentOrdersData.map((order, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-2"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Order #{order.id?.substring(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt &&
                          !isNaN(new Date(order.createdAt).getTime())
                            ? format(new Date(order.createdAt), "MMM dd, yyyy")
                            : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.isPaid
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </div>
                        <div className="font-medium text-sm">
                          {formatter.format(
                            order.orderItems?.reduce(
                              (total: number, item: any) => {
                                if (item && item.qty !== undefined) {
                                  return total + Number(item.price * item.qty);
                                }
                                return total;
                              },
                              0
                            ) || 0
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No recent orders found
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Top Products</CardTitle>
                  <CardDescription>Best selling items</CardDescription>
                </div>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              {topSellingProducts.length > 0 ? (
                <div className="space-y-4">
                  {topSellingProducts.map((product, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-3">
                        {product.images && product.images[0] && (
                          <div className="relative w-10 h-10 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.category || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                      <div className="font-medium text-sm self-end sm:self-auto">
                        {formatter.format(product.price || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  No products found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Revenue by Category
                  </CardTitle>
                  <CardDescription>
                    Sales distribution by category
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              <div className="space-y-4">
                {validRevenueByCategory.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm shrink-0"
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#0088FE" : "#00C49F",
                        }}
                      />
                      <span className="text-sm font-medium truncate">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold ml-2 shrink-0">
                      {formatter.format(category.total)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Revenue by Order Status
                  </CardTitle>
                  <CardDescription>Sales by fulfillment status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              <div className="space-y-4">
                {validRevenueByOrderStatus.map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm shrink-0"
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#FFBB28" : "#FF8042",
                        }}
                      />
                      <span className="text-sm font-medium truncate">
                        {status.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold ml-2 shrink-0">
                      {formatter.format(status.total)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Revenue by Payment Status
                  </CardTitle>
                  <CardDescription>Sales by payment status</CardDescription>
                </div>
              </div>
              </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">
              <div className="space-y-4">
                {validOrderPaymentStatusRevenue.map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm shrink-0"
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#8884d8" : "#82ca9d",
                        }}
                      />
                      <span className="text-sm font-medium truncate">{status.name}</span>
                    </div>
                    <span className="text-sm font-semibold ml-2 shrink-0">
                      {formatter.format(status.total)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="sales" className="space-y-6">
        <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>
              Detailed analysis of your sales data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {/* Monthly Revenue Trend */}
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Monthly Revenue Trend
                </h3>
                <div className="h-[250px] sm:h-[300px] bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  <OverviewClient data={validMonthlyGraphRevenue} />
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {/* Revenue by Category */}
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Revenue by Category
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                    {validRevenueByCategory.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm shrink-0"
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#0088FE" : "#00C49F",
                            }}
                          />
                          <span className="text-sm font-medium truncate">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold ml-2 shrink-0">
                          {formatter.format(category.total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="text-sm font-medium mb-4">
                      Category Distribution
                    </div>
                    <div className="flex flex-col gap-3">
                      {validRevenueByCategory.map((category, index) => {
                        // Safe percentage calculation
                        const percentage = safeRevenue > 0
                          ? (category.total / safeRevenue) * 100
                          : 0;
                        
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium truncate max-w-[150px]">
                                {category.name}
                              </span>
                              <span className="font-semibold">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="h-2.5 rounded-full shadow-inner"
                                style={{
                                  width: `${Math.max(0, Math.min(100, percentage))}%`,
                                  backgroundColor:
                                    index % 2 === 0 ? "#0088FE" : "#00C49F",
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>
                Revenue by order fulfillment status
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {validRevenueByOrderStatus.map((status, index) => {
                  // Safe percentage calculation
                  const percentage = safeRevenue > 0
                    ? (status.total / safeRevenue) * 100
                    : 0;
                    
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {status.name}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatter.format(status.total)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full shadow-inner"
                          style={{
                            width: `${Math.max(0, Math.min(100, percentage))}%`,
                            backgroundColor:
                              index % 2 === 0 ? "#FFBB28" : "#FF8042",
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-right text-muted-foreground">
                        {percentage.toFixed(1)}% of total revenue
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <CardTitle>Payment Status Distribution</CardTitle>
              <CardDescription>Revenue by payment status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {validOrderPaymentStatusRevenue.map((status, index) => {
                  // Safe percentage calculation
                  const percentage = safeRevenue > 0
                    ? (status.total / safeRevenue) * 100
                    : 0;
                    
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {status.name}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatter.format(status.total)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full shadow-inner"
                          style={{
                            width: `${Math.max(0, Math.min(100, percentage))}%`,
                            backgroundColor:
                              index % 2 === 0 ? "#8884d8" : "#82ca9d",
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-right text-muted-foreground">
                        {percentage.toFixed(1)}% of total revenue
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="inventory" className="space-y-6">
        <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
              Current inventory status and metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Inventory Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 sm:p-5 shadow-sm border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Total Items
                  </h3>
                  <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {inventoryStats.totalItems}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Items in inventory
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4 sm:p-5 shadow-sm border border-amber-200 dark:border-amber-800">
                  <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                    Low Stock
                  </h3>
                  <p className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {inventoryStats.lowStock}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Items below minimum quantity
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 sm:p-5 shadow-sm border border-green-200 dark:border-green-800 sm:col-span-2 lg:col-span-1">
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                    Total Value
                  </h3>
                  <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatter.format(inventoryStats.totalValue)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Current inventory value
                  </p>
                </div>
              </div>

              {/* Low Stock Items */}
              <div>
                <h3 className="text-base font-medium mb-3">Low Stock Items</h3>
                {inventoryItems.filter(
                  (item) => item.quantity <= (item.minQuantity || 5)
                ).length > 0 ? (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Item
                          </th>
                          <th
                            scope="col"
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Current Qty
                          </th>
                          <th
                            scope="col"
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Min Qty
                          </th>
                          <th
                            scope="col"
                            className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {inventoryItems
                          .filter(
                            (item) => item.quantity <= (item.minQuantity || 5)
                          )
                          .slice(0, 5)
                          .map((item, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50                               dark:hover:bg-gray-800 transition-colors"
                            >
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                <div className="truncate max-w-[120px] sm:max-w-[200px]">
                                  {item.name}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.quantity}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.minQuantity || 5}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  Low Stock
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[100px] text-muted-foreground border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                    No low stock items found
                  </div>
                )}
              </div>

              {/* Inventory Value Distribution */}
              <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-base font-medium mb-4">
                  Inventory Value Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                      Top Value Items
                    </h4>
                    <div className="space-y-3">
                      {inventoryItems
                        .sort(
                          (a, b) =>
                            (b.quantity || 0) * (b.cost || 0) -
                            (a.quantity || 0) * (a.cost || 0)
                        )
                        .slice(0, 5)
                        .map((item, index) => {
                          const itemValue =
                            (item.quantity || 0) * (item.cost || 0);
                          const percentage = inventoryStats.totalValue > 0
                            ? (itemValue / inventoryStats.totalValue) * 100
                            : 0;

                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {item.name}
                                </p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                  <div
                                    className="h-1.5 rounded-full bg-blue-600"
                                    style={{
                                      width: `${Math.min(100, percentage)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <p className="text-sm font-semibold ml-4 shrink-0">
                                {formatter.format(itemValue)}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                      Inventory by Category
                    </h4>
                    <div className="space-y-3">
                      {/* Group by category and calculate value */}
                      {Object.entries(
                        inventoryItems.reduce((acc, item) => {
                          const category = item.category || "Uncategorized";
                          const itemValue =
                            (item.quantity || 0) * (item.cost || 0);

                          if (!acc[category]) {
                            acc[category] = 0;
                          }

                          acc[category] += itemValue;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort(([, a], [, b]) => Number(b) - Number(a))
                        .slice(0, 5)
                        .map(([category, value], index) => {
                          const percentage = inventoryStats.totalValue > 0
                            ? (Number(value) / Number(inventoryStats.totalValue)) * 100
                            : 0;

                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {category}
                                </p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                  <div
                                    className="h-1.5 rounded-full bg-green-600"
                                    style={{
                                      width: `${Math.min(100, percentage)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <p className="text-sm font-semibold ml-4 shrink-0">
                                {formatter.format(value as number)}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
