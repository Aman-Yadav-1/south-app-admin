// This is a Server Component (no 'use client' directive)
import { getGraphTotalRevenue } from "@/actions/get-graph-total-revenue";
import { getTotalProducts } from "@/actions/get-total-products";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getOrderTotalRevenueByCategory } from "@/actions/get-total-revenue-by-category";
import { getOrderPaymentStatusTotalRevenue } from "@/actions/get-total-revenue-by-order-status";
import { getOrderStatusTotalRevenue } from "@/actions/get-total-revenue-order-status";
import { getTotalSales } from "@/actions/get-total-sales";
import { Heading } from "@/components/heading";
import { DashboardClient } from "./dashboard-client";
import { DashboardTabs } from "./dashboard-tabs";
import { formatter } from "@/lib/utils";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  format,
  startOfMonth,
  parseISO,
  endOfDay,
  subDays,
  differenceInDays,
} from "date-fns";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface DashboardOverviewProps {
  params: { storeId: string };
  searchParams: {
    startDate?: string;
    endDate?: string;
  };
}

const DashboardOverview = async ({
  params,
  searchParams,
}: DashboardOverviewProps) => {
  try {
    // Parse date range from query params or use defaults
    const today = new Date();
    const defaultStartDate = startOfMonth(today);
    const defaultEndDate = today;

    let startDate = defaultStartDate;
    let endDate = defaultEndDate;

    // Safely parse dates from query params
    try {
      if (searchParams.startDate) {
        startDate = parseISO(searchParams.startDate);
      }

      if (searchParams.endDate) {
        // Use end of day to include the entire end date
        endDate = endOfDay(parseISO(searchParams.endDate));
      }
    } catch (error) {
      console.error("Error parsing dates:", error);
      // Fall back to defaults if parsing fails
      startDate = defaultStartDate;
      endDate = defaultEndDate;
    }

    // Calculate the previous period with the same duration
    const periodDuration = differenceInDays(endDate, startDate) + 1;
    const previousPeriodEnd = subDays(startDate, 1);
    const previousPeriodStart = subDays(previousPeriodEnd, periodDuration - 1);

    // Convert to Firestore timestamps for querying
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    // Convert to Firestore timestamps for querying previous period
    const prevStartTimestamp = Timestamp.fromDate(previousPeriodStart);
    const prevEndTimestamp = Timestamp.fromDate(previousPeriodEnd);

    console.log("Date range:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      previousPeriodStart: previousPeriodStart.toISOString(),
      previousPeriodEnd: previousPeriodEnd.toISOString(),
    });

    // Fetch all required data with date range filter
    const [
      totalRevenue,
      totalSales,
      totalProducts,
      monthlyGraphRevenue,
      revenueByOrderStatus,
      orderPaymentStatusRevenue,
      revenueByCategory,
    ] = await Promise.all([
      getTotalRevenue(params.storeId, startTimestamp, endTimestamp),
      getTotalSales(params.storeId, startTimestamp, endTimestamp),
      getTotalProducts(params.storeId),
      getGraphTotalRevenue(params.storeId, startTimestamp, endTimestamp),
      getOrderStatusTotalRevenue(params.storeId, startTimestamp, endTimestamp),
      getOrderPaymentStatusTotalRevenue(
        params.storeId,
        startTimestamp,
        endTimestamp
      ),
      getOrderTotalRevenueByCategory(
        params.storeId,
        startTimestamp,
        endTimestamp
      ),
    ]);

    // Fetch previous period data for comparison
    const [previousTotalRevenue, previousTotalSales] = await Promise.all([
      getTotalRevenue(params.storeId, prevStartTimestamp, prevEndTimestamp),
      getTotalSales(params.storeId, prevStartTimestamp, prevEndTimestamp),
    ]);

    // Calculate percentage changes
    const revenuePercentChange =
      previousTotalRevenue > 0
        ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100
        : 0;

    const salesPercentChange =
      previousTotalSales > 0
        ? ((totalSales - previousTotalSales) / previousTotalSales) * 100
        : 0;

    // Round to 1 decimal place
    const formattedRevenueChange = Math.round(revenuePercentChange * 10) / 10;
    const formattedSalesChange = Math.round(salesPercentChange * 10) / 10;

    // Determine if changes are positive or negative
    const isRevenuePositive = formattedRevenueChange >= 0;
    const isSalesPositive = formattedSalesChange >= 0;

    console.log("Data fetched:", {
      totalRevenue,
      totalSales,
      totalProducts,
      previousTotalRevenue,
      previousTotalSales,
      revenuePercentChange: formattedRevenueChange,
      salesPercentChange: formattedSalesChange,
      monthlyGraphRevenueCount: monthlyGraphRevenue.length,
      revenueByOrderStatusCount: revenueByOrderStatus.length,
      orderPaymentStatusRevenueCount: orderPaymentStatusRevenue.length,
      revenueByCategoryCount: revenueByCategory.length,
    });

    // Get recent orders with date filter
    const recentOrdersQuery = query(
      collection(doc(db, "stores", params.storeId), "orders"),
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const recentOrdersData = (await getDocs(recentOrdersQuery)).docs.map(
      (doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
        };
      }
    );

    // Get top selling products
    const topSellingProducts = (
      await getDocs(
        query(
          collection(doc(db, "stores", params.storeId), "products"),
          orderBy("name"),
          limit(5)
        )
      )
    ).docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      };
    });

    // Get inventory stats
    const inventoryItems = (
      await getDocs(collection(doc(db, "stores", params.storeId), "inventory"))
    ).docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      };
    });

    const inventoryStats = {
      totalItems: inventoryItems.length,
      lowStock: inventoryItems.filter(
        (item) => (item as any).quantity <= ((item as any).minQuantity || 5)
      ).length,
      totalValue: inventoryItems.reduce(
        (sum, item) =>
          sum + ((item as any).quantity || 0) * ((item as any).cost || 0),
        0
      ),
    };

    // Format dates for display in the form inputs
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

    const hasActiveFilters = !!(searchParams.startDate || searchParams.endDate);

    // Ensure we have valid data for all metrics
    const validTotalRevenue = totalRevenue || 0;
    const validTotalSales = totalSales || 0;
    const validTotalProducts = totalProducts || 0;

    // Ensure we have valid data for all charts
    const validMonthlyGraphRevenue =
      monthlyGraphRevenue.length > 0
        ? monthlyGraphRevenue
        : Array.from({ length: 12 }, (_, i) => ({
            name: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ][i],
            total: 0,
          }));

    const validRevenueByCategory =
      revenueByCategory.length > 0
        ? revenueByCategory
        : [{ name: "No Categories", total: 0 }];

    const validRevenueByOrderStatus =
      revenueByOrderStatus.length > 0
        ? revenueByOrderStatus
        : [
            { name: "Processing", total: 0 },
            { name: "Delivering", total: 0 },
            { name: "Delivered", total: 0 },
            { name: "Canceled", total: 0 },
          ];

    const validOrderPaymentStatusRevenue =
      orderPaymentStatusRevenue.length > 0
        ? orderPaymentStatusRevenue
        : [
            { name: "Paid", total: 0 },
            { name: "Not Paid", total: 0 },
          ];

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-6 p-6 pt-4">
          {/* Header with Date Range Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Heading
              title="Dashboard"
              description="Overview of your store performance"
            />

            {/* Date Range Filter - Client Component */}
            <DashboardClient
              storeId={params.storeId}
              formattedStartDate={formattedStartDate}
              formattedEndDate={formattedEndDate}
              hasActiveFilters={hasActiveFilters}
              startDateDisplay={format(startDate, "MMMM d, yyyy")}
              endDateDisplay={format(endDate, "MMMM d, yyyy")}
            />
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
              <div className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
                <div className="text-sm font-medium">Total Revenue</div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <IndianRupee className="h-4 w-4 text-blue-700" />
                </div>
              </div>
              <div className="p-4 pt-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  {formatter.format(validTotalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  {isRevenuePositive ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span
                    className={`font-medium ${
                      isRevenuePositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {Math.abs(formattedRevenueChange)}%
                  </span>{" "}
                  from previous period
                </p>
              </div>
            </div>

            <div className="shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
              <div className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
                <div className="text-sm font-medium">Total Orders</div>
                <div className="p-2 bg-green-100 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-green-700" />
                </div>
              </div>
              <div className="p-4 pt-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                  {validTotalSales}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  {isSalesPositive ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span
                    className={`font-medium ${
                      isSalesPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {Math.abs(formattedSalesChange)}%
                  </span>{" "}
                  from previous period
                </p>
              </div>
            </div>

            <div className="shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
              <div className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
                <div className="text-sm font-medium">Total Products</div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <Package className="h-4 w-4 text-purple-700" />
                </div>
              </div>
              <div className="p-4 pt-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                  {validTotalProducts}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active products in your store
                </p>
              </div>
            </div>

            <div className="shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
              <div className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
                <div className="text-sm font-medium">Inventory Value</div>
                <div className="p-2 bg-amber-100 rounded-full">
                  <Tag className="h-4 w-4 text-amber-700" />
                </div>
              </div>
              <div className="p-4 pt-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                  {formatter.format(inventoryStats.totalValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className="font-medium">{inventoryStats.lowStock}</span>{" "}
                  items low in stock
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs - Client Component */}
          <DashboardTabs
            monthlyGraphRevenue={validMonthlyGraphRevenue}
            recentOrdersData={recentOrdersData}
            topSellingProducts={topSellingProducts}
            revenueByCategory={validRevenueByCategory}
            revenueByOrderStatus={validRevenueByOrderStatus}
            orderPaymentStatusRevenue={validOrderPaymentStatusRevenue}
            inventoryItems={inventoryItems}
            inventoryStats={inventoryStats}
            totalRevenue={validTotalRevenue}
            totalSales={validTotalSales}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in dashboard:", error);
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-6 p-6 pt-4">
          <Heading
            title="Dashboard"
            description="Overview of your store performance"
          />
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
            <h3 className="text-lg font-medium">Error loading dashboard</h3>
            <p className="mt-1">
              There was a problem loading your dashboard data. Please try again
              later.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default DashboardOverview;
