import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface DateRangePickerProps {
  value: { start: Date; end: Date } | null;
  onChange: (range: { start: Date; end: Date }) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[250px] justify-start text-left">
          {value?.start && value?.end
            ? `${format(value.start, "MMM dd, yyyy")} - ${format(value.end, "MMM dd, yyyy")}`
            : "Select a date range"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={value ? { from: value.start, to: value.end } : undefined}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onChange({ start: range.from, end: range.to });
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;