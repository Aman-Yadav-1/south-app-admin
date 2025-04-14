"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { OrderColumn, columns } from "./columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
  const params = useParams();
  const [filteredData, setFilteredData] = useState(data);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Calculate stats
  const totalOrders = data.length;
  const paidOrders = data.filter(order => order.isPaid).length;
  const pendingOrders = data.filter(order => !order.isPaid).length;
  const totalRevenue = data.reduce((total, order) => {
    const price = parseFloat(order.totalPrice.replace('₹', ''));
    return total + (order.isPaid ? price : 0);
  }, 0);

  // Apply filters
  const applyFilters = () => {
    let result = [...data];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => 
        order.order_status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply payment filter
    if (paymentFilter !== "all") {
      const isPaid = paymentFilter === "paid";
      result = result.filter(order => order.isPaid === isPaid);
    }
    
    setFilteredData(result);
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const handlePaymentFilterChange = (value: string) => {
    setPaymentFilter(value);
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Orders (${totalOrders})`}
          description="Manage your store orders"
        />
      </div>
      <Separator />
      
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Paid Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((paidOrders / totalOrders) * 100).toFixed(1)}% of total orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((pendingOrders / totalOrders) * 100).toFixed(1)}% of total orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="w-full sm:w-1/2 md:w-1/4">
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/2 md:w-1/4">
          <Label htmlFor="payment-filter">Filter by Payment</Label>
          <Select
            value={paymentFilter}
            onValueChange={handlePaymentFilterChange}
          >
            <SelectTrigger id="payment-filter">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DataTable 
        searchKey="customerName" 
        columns={columns} 
        data={filteredData} 
      />
    </>
  );
};
