"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

/** Professional styled date picker: value/onChange are YYYY-MM-DD strings. */
export function DatePickerPopover({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value + "T12:00:00") : undefined;

  const onSelect = (d: Date | undefined) => {
    if (!d) return;
    onChange(format(d, "yyyy-MM-dd"));
    setOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(format(today, "yyyy-MM-dd"));
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const displayValue = value ? format(new Date(value + "T12:00:00"), "dd MMM yyyy") : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50",
            !displayValue && "text-slate-400",
            className
          )}
        >
          <span>{displayValue || placeholder}</span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto rounded-2xl border border-slate-200/90 bg-white p-0 shadow-xl shadow-slate-200/50"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          showOutsideDays
          className="p-4"
          classNames={{
            months: "flex flex-col gap-4",
            month: "flex flex-col gap-4",
            caption: "flex justify-center pt-1 relative items-center w-full min-h-[2rem]",
            caption_label: "text-sm font-semibold text-slate-900",
            nav: "flex items-center gap-1",
            nav_button:
              "inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition",
            nav_button_previous: "absolute left-2",
            nav_button_next: "absolute right-2",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "w-10 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500",
            row: "flex w-full mt-1 justify-between",
            cell: "relative w-10 p-0.5 text-center text-sm",
            day: "h-10 w-10 rounded-xl p-0 font-medium transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0 aria-selected:opacity-100",
            day_selected:
              "!bg-slate-900 !text-white hover:!bg-slate-800 focus:!bg-slate-900",
            day_today: "bg-indigo-500/10 text-indigo-700 font-semibold",
            day_outside: "text-slate-300 aria-selected:bg-slate-100 aria-selected:text-slate-400",
            day_disabled: "text-slate-300 opacity-50 cursor-not-allowed",
            day_hidden: "invisible",
          }}
        />
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
