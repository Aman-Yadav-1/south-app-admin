"use client";

import { useState } from "react";
import { Plus, Filter, ArrowUpDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import ApiList from "@/components/api-list";
import { ProductColumn, columns } from "./columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ProductClientProps {
  data: ProductColumn[];
  totalProducts: number;
}

export const ProductClient: React.FC<ProductClientProps> = ({ 
  data,
  totalProducts
}) => {
  const router = useRouter();
  const params = useParams();
  const [filteredData, setFilteredData] = useState(data);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Calculate stats
  const featuredCount = data.filter(item => item.isFeatured).length;
  const archivedCount = data.filter(item => item.isArchived).length;
  const activeCount = data.length - archivedCount;

  // Filter functions
  const applyFilter = (filter: string | null) => {
    setActiveFilter(filter);
    
    if (filter === "featured") {
      setFilteredData(data.filter(item => item.isFeatured));
    } else if (filter === "archived") {
      setFilteredData(data.filter(item => item.isArchived));
    } else if (filter === "active") {
      setFilteredData(data.filter(item => !item.isArchived));
    } else {
      setFilteredData(data);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Heading
          title={`Products (${totalProducts})`}
          description="Manage products for your store"
        />
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full xs:w-auto justify-between">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </div>
                {activeFilter && <Badge variant="outline" className="ml-2">{activeFilter}</Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Products</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => applyFilter(null)}>
                  All Products
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyFilter("active")}>
                  Active Products
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyFilter("featured")}>
                  Featured Products
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyFilter("archived")}>
                  Archived Products
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={() => router.push(`/${params.storeId}/products/new`)}
            className="w-full xs:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.length > 0 ? ((activeCount / data.length) * 100).toFixed(1) : 0}% of total products
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Featured Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.length > 0 ? ((featuredCount / data.length) * 100).toFixed(1) : 0}% of total products
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Archived Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.length > 0 ? ((archivedCount / data.length) * 100).toFixed(1) : 0}% of total products
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Data Table */}
      <div className="rounded-md border overflow-hidden">
        <DataTable 
          searchKey="name" 
          columns={columns} 
          data={filteredData} 
        />
      </div>
      
      <div className="mt-8">
        <Heading title="API" description="API calls for Products" />
        <Separator className="my-4" />
        <ApiList entityName="products" entityNameId="productId" />
      </div>
    </>
  );
};
