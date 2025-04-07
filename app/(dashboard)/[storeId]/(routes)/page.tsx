import { getGraphTotalRevenue } from "@/actions/get-graph-total-revenue";
import { getTotalProducts } from "@/actions/get-total-products";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getOrderTotalRevenueByCategory } from "@/actions/get-total-revenue-by-category";
import { getOrderPaymentStatusTotalRevenue } from "@/actions/get-total-revenue-by-order-status";
import { getOrderStatusTotalRevenue } from "@/actions/get-total-revenue-order-status";
import { getTotalSales } from "@/actions/get-total-sales";
import { Heading } from "@/components/heading";
import Overview from "@/components/overview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatter } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { format } from "date-fns";
import { 
  IndianRupee, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  Tag, 
  Truck,
  ArrowUpRight
} from "lucide-react";

interface DashboardOverviewProps {
  params: { storeId: string }
}

const DashboardOverview = async ({ params }: DashboardOverviewProps) => {
  // Fetch all required data
  const totalRevenue = await getTotalRevenue(params.storeId);
  const totalSales = await getTotalSales(params.storeId);
  const totalProducts = await getTotalProducts(params.storeId);
  const monthlyGraphRevenue = await getGraphTotalRevenue(params.storeId);
  const revenueByOrderStatus = await getOrderStatusTotalRevenue(params.storeId);
  const orderPaymentStatusRevenue = await getOrderPaymentStatusTotalRevenue(params.storeId);
  const revenueByCategory = await getOrderTotalRevenueByCategory(params.storeId);

  // Get recent orders
  const recentOrdersData = (
    await getDocs(
      query(
        collection(doc(db, "stores", params.storeId), "orders"),
        orderBy("createdAt", "desc"),
        limit(5)
      )
    )
  ).docs.map((doc) => doc.data());

  // Get top selling products
  const topSellingProducts = (
    await getDocs(
      query(
        collection(doc(db, "stores", params.storeId), "products"),
        orderBy("name"),
        limit(5)
      )
    )
  ).docs.map((doc) => doc.data());

  // Get inventory stats
  const inventoryItems = (
    await getDocs(
      collection(doc(db, "stores", params.storeId), "inventory")
    )
  ).docs.map((doc) => doc.data());

  const inventoryStats = {
    totalItems: inventoryItems.length,
    lowStock: inventoryItems.filter(item => item.quantity <= (item.minQuantity || 5)).length,
    totalValue: inventoryItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.cost || 0)), 0)
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-6 p-6 pt-4">
        <div className="flex items-center justify-between">
          <Heading title="Dashboard" description="Overview of your store performance" />
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <IndianRupee className="h-4 w-4 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {formatter.format(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <ShoppingCart className="h-4 w-4 text-green-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                {totalSales}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <div className="p-2 bg-purple-100 rounded-full">
                <Package className="h-4 w-4 text-purple-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                {totalProducts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active products in your store
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <div className="p-2 bg-amber-100 rounded-full">
                <Tag className="h-4 w-4 text-amber-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                {formatter.format(inventoryStats.totalValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="font-medium">{inventoryStats.lowStock}</span> items low in stock
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-10 bg-muted/20 p-1 rounded-lg">
            <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
              Sales Analytics
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
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
                    <CardDescription>Monthly revenue breakdown</CardDescription>
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-[300px]">
                  <Overview data={monthlyGraphRevenue} />
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
                <CardContent className="pt-4">
                  {recentOrdersData.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrdersData.map((order, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">Order #{order.id?.substring(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.createdAt ? format(order.createdAt.toDate(), "MMM dd, yyyy") : "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.isPaid 
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}>
                              {order.isPaid ? "Paid" : "Unpaid"}
                            </div>
                            <div className="font-medium text-sm">
                              {formatter.format(
                                order.orderItems?.reduce((total, item) => {
                                  if (item && item.qty !== undefined) {
                                    return total + Number(item.price * item.qty);
                                  }
                                  return total;
                                }, 0) || 0
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
                <CardContent className="pt-4">
                  {topSellingProducts.length > 0 ? (
                    <div className="space-y-4">
                      {topSellingProducts.map((product, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            {product.images && product.images[0] && (
                              <div className="relative w-10 h-10 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
                                <img 
                                  src={product.images[0].url} 
                                  alt={product.name} 
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            )}
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.category || 'Uncategorized'}</p>
                            </div>
                          </div>
                          <div className="font-medium text-sm">
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
<div className="grid gap-6 md:grid-cols-3">
  <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
    <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base">Revenue by Category</CardTitle>
          <CardDescription>Sales distribution by category</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="space-y-4">
        {revenueByCategory.map((category, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: index % 2 === 0 ? '#0088FE' : '#00C49F' }}
              />
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            <span className="text-sm font-semibold">{formatter.format(category.total)}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>

  <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
    <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base">Revenue by Order Status</CardTitle>
          <CardDescription>Sales by fulfillment status</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="space-y-4">
        {revenueByOrderStatus.map((status, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: index % 2 === 0 ? '#FFBB28' : '#FF8042' }}
              />
              <span className="text-sm font-medium">{status.name}</span>
            </div>
            <span className="text-sm font-semibold">{formatter.format(status.total)}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>

  <Card className="shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
    <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base">Revenue by Payment Status</CardTitle>
          <CardDescription>Sales by payment status</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="space-y-4">
        {orderPaymentStatusRevenue.map((status, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: index % 2 === 0 ? '#8884d8' : '#82ca9d' }}
              />
              <span className="text-sm font-medium">{status.name}</span>
            </div>
            <span className="text-sm font-semibold">{formatter.format(status.total)}</span>
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
    <CardDescription>Detailed analysis of your sales data</CardDescription>
  </CardHeader>
  <CardContent className="pt-6">
    <div className="space-y-8">
      {/* Monthly Revenue Trend */}
      <div>
        <h3 className="text-sm font-medium mb-3">Monthly Revenue Trend</h3>
        <div className="h-[300px] bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <Overview data={monthlyGraphRevenue} />
        </div>
      </div>

      <Separator className="bg-gray-200 dark:bg-gray-700" />

      {/* Revenue by Category */}
      <div>
        <h3 className="text-sm font-medium mb-3">Revenue by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            {revenueByCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: index % 2 === 0 ? '#0088FE' : '#00C49F' }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <span className="text-sm font-semibold">{formatter.format(category.total)}</span>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="text-sm font-medium mb-4">Category Distribution</div>
            <div className="flex flex-col gap-3">
              {revenueByCategory.map((category, index) => {
                const percentage = (category.total / totalRevenue) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{category.name}</span>
                      <span className="font-semibold">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-2.5 rounded-full shadow-inner" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: index % 2 === 0 ? '#0088FE' : '#00C49F'
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
      <CardDescription>Revenue by order fulfillment status</CardDescription>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="space-y-5">
        {revenueByOrderStatus.map((status, index) => {
          const percentage = (status.total / totalRevenue) * 100;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{status.name}</span>
                <span className="text-sm font-semibold">{formatter.format(status.total)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-2.5 rounded-full shadow-inner" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: index % 2 === 0 ? '#FFBB28' : '#FF8042'
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
        {orderPaymentStatusRevenue.map((status, index) => {
          const percentage = (status.total / totalRevenue) * 100;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{status.name}</span>
                <span className="text-sm font-semibold">{formatter.format(status.total)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-2.5 rounded-full shadow-inner" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: index % 2 === 0 ? '#8884d8' : '#82ca9d'
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
    <CardDescription>Current inventory status and metrics</CardDescription>
  </CardHeader>
  <CardContent className="pt-6">
    <div className="space-y-6">
      {/* Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 shadow-sm border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Items</h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{inventoryStats.totalItems}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Items in inventory</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-5 shadow-sm border border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Low Stock</h3>
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{inventoryStats.lowStock}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Items below minimum quantity</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-5 shadow-sm border border-green-200 dark:border-green-800">
          <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Value</h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatter.format(inventoryStats.totalValue)}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Current inventory value</p>
        </div>
      </div>

      {/* Low Stock Items */}
      <div>
      <h3 className="text-base font-medium mb-3">Low Stock Items</h3>
                    {inventoryItems.filter(item => item.quantity <= (item.minQuantity || 5)).length > 0 ? (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Qty</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Min Qty</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {inventoryItems
                              .filter(item => item.quantity <= (item.minQuantity || 5))
                              .slice(0, 5)
                              .map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.minQuantity || 5}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardOverview;
