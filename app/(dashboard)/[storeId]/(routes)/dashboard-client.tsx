'use client';

import { Button } from "@/components/ui/button";
import { Calendar, RefreshCcw } from "lucide-react";
import { FormEvent } from "react";

interface DashboardClientProps {
  storeId: string;
  formattedStartDate: string;
  formattedEndDate: string;
  hasActiveFilters: boolean;
  startDateDisplay: string;
  endDateDisplay: string;
}

export const DashboardClient = ({
  storeId,
  formattedStartDate,
  formattedEndDate,
  hasActiveFilters,
  startDateDisplay,
  endDateDisplay
}: DashboardClientProps) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    
    // Use direct navigation with window.location to avoid any router issues
    window.location.href = `/${storeId}?startDate=${startDate}&endDate=${endDate}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 w-full md:w-auto">
      {/* Mobile layout (stacked) */}
      <div className="md:hidden">
        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          {/* Label section */}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm font-medium">Date Range</span>
          </div>
          
          {/* Date inputs section - stacked on mobile */}
          <div className="grid grid-cols-1 gap-2">
            <div className="w-full">
              <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                defaultValue={formattedStartDate}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md dark:bg-slate-800 w-full"
              />
            </div>
            
            <div className="w-full">
              <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
              <input 
                type="date" 
                name="endDate" 
                defaultValue={formattedEndDate}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md dark:bg-slate-800 w-full"
              />
            </div>
          </div>
          
          {/* Buttons section */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 rounded-md text-sm flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <RefreshCcw className="h-3 w-3" />
              <span>Apply</span>
            </button>
            
            {hasActiveFilters && (
              <a 
                href={`/${storeId}`}
                className="px-3 py-1 h-9 text-sm flex items-center justify-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span>Clear</span>
              </a>
            )}
          </div>
        </form>
      </div>
      
      {/* Desktop layout (single line) */}
      <div className="hidden md:block">
        <form onSubmit={handleSubmit} className="flex items-center p-3 gap-2 flex-nowrap">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium whitespace-nowrap">Date:</span>
          
          <input 
            type="date" 
            name="startDate" 
            defaultValue={formattedStartDate}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md dark:bg-slate-800 w-[130px]"
          />
          
          <span className="text-sm whitespace-nowrap">to</span>
          
          <input 
            type="date" 
            name="endDate" 
            defaultValue={formattedEndDate}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md dark:bg-slate-800 w-[130px]"
          />
          
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 rounded-md text-sm flex items-center gap-1 whitespace-nowrap">
            <RefreshCcw className="h-3 w-3 mr-1" />
            Apply
          </button>
          
          {hasActiveFilters && (
            <a 
              href={`/${storeId}`}
              className="px-3 py-1 h-8 text-sm flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Clear
            </a>
          )}
        </form>
      </div>
      
      {hasActiveFilters && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-600 dark:text-blue-300 border-t border-blue-100 dark:border-blue-800 rounded-b-lg">
          Showing data from {startDateDisplay} to {endDateDisplay}
        </div>
      )}
    </div>
  );
};
