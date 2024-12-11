import { getGraphTotalRevenue } from "@/actions/get-graph-total-revenue";
import { getTotalProducts } from "@/actions/get-total-products";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getOrderTotalRevenueByCategory } from "@/actions/get-total-revenue-by-category";
import { getOrderPaymentStatusTotalRevenue } from "@/actions/get-total-revenue-by-order-status";
import { getOrderStatusTotalRevenue } from "@/actions/get-total-revenue-order-status";
import { getTotalSales } from "@/actions/get-total-sales";
import { Heading } from "@/components/heading";
import Overview from "@/components/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatter } from "@/lib/utils";
import { IndianRupee } from "lucide-react";

interface DashboardOverviewProps{
    params: {storeId: string}
}

const DashboardOverview = async ({params}: DashboardOverviewProps) => {

    const totalRevenue = await getTotalRevenue(params.storeId)
    const totalSales = await getTotalSales(params.storeId)
    const totalProducts = await getTotalProducts(params.storeId)
    const monthlyGraphRevenue = await getGraphTotalRevenue(params.storeId)
    const revenueByOrderstatus = await getOrderStatusTotalRevenue(params.storeId)
    const orderStatusTotalRevenue = await getOrderPaymentStatusTotalRevenue(params.storeId)
    const revenueByCategory = await getOrderTotalRevenueByCategory(params.storeId)

    return <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Heading title="Dashboard" description="Overview of your store" />
            
            <div className="grid gap-4 grid-cols-4">
                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                        Total Revenue
                        </CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatter.format(totalRevenue)}</div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                        Sales
                        </CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalSales}</div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                        Products
                        </CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalProducts}</div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                        Revenue By Month
                        </CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Overview data={monthlyGraphRevenue} />
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                        Revenue By Payment Status
                        </CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Overview data={orderStatusTotalRevenue} />
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                        Revenue By Category
                        </CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Overview data={revenueByCategory} />
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                        Revenue By Order Status
                        </CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Overview data={revenueByOrderstatus} />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
} 
export default DashboardOverview;