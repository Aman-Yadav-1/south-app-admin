import { Package, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryStatsCardsProps {
  stats: {
    totalItems: number;
    lowStock: number;
    expiringSoon: number;
    totalValue: number;
  };
  loading: boolean;
}

export const InventoryStatsCards: React.FC<InventoryStatsCardsProps> = ({
  stats,
  loading
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
      <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            Total Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low Stock Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold text-amber-500">{stats.lowStock}</div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-500" />
            Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold text-red-500">{stats.expiringSoon}</div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            Total Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div className="text-2xl font-bold text-green-700">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(stats.totalValue)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
