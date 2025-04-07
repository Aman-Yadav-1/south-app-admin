import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInventoryHistory } from "./inventoryActions";
import { InventoryItem, InventoryHistory } from "./types";

interface HistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  item: InventoryItem | null;
}

export const HistoryDialog: React.FC<HistoryDialogProps> = ({
  isOpen,
  onClose,
  storeId,
  item
}) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<InventoryHistory[]>([]);

  useEffect(() => {
    if (isOpen && item) {
      fetchHistory();
    } else {
      // Clear history when dialog closes to prevent stale data
      setHistory([]);
    }
  }, [isOpen, item]);

  const fetchHistory = async () => {
    if (!item) return;
    
    try {
      setLoading(true);
      const historyData = await getInventoryHistory(storeId, item.id);
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert Firestore timestamp to Date
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    
    try {
      // If it's a Firestore Timestamp with toDate method
      if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), "MMM dd, yyyy 'at' h:mm a");
      }
      
      // If it's a Firestore timestamp object with seconds
      if (timestamp && timestamp.seconds !== undefined) {
        const date = new Date(timestamp.seconds * 1000);
        return format(date, "MMM dd, yyyy 'at' h:mm a");
      }
      
      // If it's already a Date object
      if (timestamp instanceof Date) {
        return format(timestamp, "MMM dd, yyyy 'at' h:mm a");
      }
      
      // Try to parse as a date string or timestamp
      return format(new Date(timestamp), "MMM dd, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  };

  // Helper function to safely stringify any value
  const safeStringify = (value: any): string => {
    if (value === null || value === undefined) {
      return "none";
    }
    
    if (typeof value === 'object') {
      // Handle Date objects
      if (value instanceof Date) {
        return format(value, "MMM dd, yyyy");
      }
      
      // Handle Firestore timestamps
      if (value && typeof value.toDate === 'function') {
        return format(value.toDate(), "MMM dd, yyyy");
      }
      
      if (value && value.seconds !== undefined) {
        return format(new Date(value.seconds * 1000), "MMM dd, yyyy");
      }
      
      // Handle other objects
      try {
        return JSON.stringify(value);
      } catch (e) {
        return "[Object]";
      }
    }
    
    return String(value);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg p-6 backdrop-blur-none">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl">Item History</DialogTitle>
          <DialogDescription>
            View the history of changes for {item.name}
          </DialogDescription>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2 border-b pb-4 mb-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No history records found for this item.
            </div>
          ) : (
            history.map((record, index) => (
              <div 
                key={record.id} 
                className={`space-y-2 ${index < history.length - 1 ? "border-b pb-4 mb-4" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {record.type === "create" && "Item Created"}
                      {record.type === "update" && "Item Updated"}
                      {record.type === "adjustment" && (
                        <span>
                          Stock {record.quantityChange > 0 ? "Increased" : "Decreased"} by{" "}
                          <span className={record.quantityChange > 0 ? "text-green-600" : "text-red-600"}>
                            {Math.abs(record.quantityChange)} {item.unit}
                          </span>
                        </span>
                      )}
                    </div>
                    {record.reason && (
                      <Badge variant="outline" className="font-normal">
                        {record.reason}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatTimestamp(record.timestamp)}
                  </span>
                </div>
                
                {record.notes && (
                  <p className="text-sm text-muted-foreground">
                    {record.notes}
                  </p>
                )}
                
                {record.changes && Object.keys(record.changes).length > 0 && (
                  <div className="text-sm space-y-1 mt-2">
                    <p className="font-medium">Changes:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {Object.entries(record.changes).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium">{key}:</span>{" "}
                          {typeof value.old !== 'undefined' && (
                            <span className="line-through">{safeStringify(value.old)}</span>
                          )}{" "}
                          {typeof value.old !== 'undefined' && typeof value.new !== 'undefined' && "→"}{" "}
                          {typeof value.new !== 'undefined' && (
                            <span className="font-medium">{safeStringify(value.new)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground">
                  By: {record.user || "System"}
                </div>
              </div>
            ))
          )}
        </div>
        
        <Separator className="my-4" />
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            onClick={onClose}
            className="mt-2 sm:mt-0"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
