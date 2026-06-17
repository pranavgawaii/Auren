"use client"

import { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import {
  TimeField as TimeFieldRac,
  DateInput as DateInputRac,
  DateSegment as DateSegmentRac,
  TimeValue,
} from "react-aria-components"
import { Clock } from "lucide-react"

type TimeFieldProps = ComponentProps<typeof TimeFieldRac<TimeValue>> & {
  className?: string;
};

export function TimePicker({ className, ...props }: TimeFieldProps) {
  return (
    <TimeFieldRac
      {...props}
      className={cn(
        "flex items-center w-full min-h-[32px] border border-[rgba(36,27,20,0.12)] bg-[#FAF8F5] rounded-[8px] px-3 py-1 text-[12px] font-sans text-[#241B14] outline-none transition-all focus-within:border-[#E8593C] focus-within:ring-2 focus-within:ring-[#E8593C]/20 shadow-sm",
        className
      )}
    >
      <Clock className="w-3.5 h-3.5 mr-2 text-[rgba(36,27,20,0.45)] shrink-0" />
      <DateInputRac className="flex w-full">
        {(segment) => (
          <DateSegmentRac
            segment={segment}
            className={cn(
              "px-0.5 box-content tabular-nums outline-none rounded-sm focus:bg-[#E8593C] focus:text-white caret-transparent",
              segment.type === "literal" && "px-0"
            )}
          />
        )}
      </DateInputRac>
    </TimeFieldRac>
  )
}
