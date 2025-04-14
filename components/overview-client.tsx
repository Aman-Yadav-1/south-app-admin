'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { formatter } from "@/lib/utils";
import { useEffect, useState } from "react";

interface OverviewProps {
  data: any[];
}

const OverviewClient = ({ data }: OverviewProps) => {
  const [mounted, setMounted] = useState(false);
  
  // Use useEffect to ensure component is mounted before rendering chart
  useEffect(() => {
    setMounted(true);
    console.log("Chart data:", data); // Debug log
  }, [data]);
  
  if (!mounted) return null;
  
  // Ensure we have data to display
  const chartData = data && data.length > 0 ? data : [
    { name: "No Data", total: 0 }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatter.format(value)}
        />
        <Tooltip 
          formatter={(value: number) => formatter.format(value)}
          labelStyle={{ color: '#333' }}
          contentStyle={{ 
            backgroundColor: 'white', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Bar
          dataKey="total"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OverviewClient;
