import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#241B14] dark:bg-[#4D4D4D] text-white hover:bg-[#241B14]/90 dark:hover:bg-[#4D4D4D]/90 shadow-sm",
        destructive: "bg-[#EF4444] text-white hover:bg-[#EF4444]/90 shadow-sm",
        outline: "border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#383838] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] text-[#241B14] dark:text-[#F4F4F5] shadow-sm",
        secondary: "bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.08)] dark:bg-[rgba(255,255,255,0.08)] dark:hover:bg-[rgba(255,255,255,0.08)]",
        ghost: "hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] text-[#241B14] dark:text-[#F4F4F5]",
        link: "text-[#241B14] dark:text-[#F4F4F5] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
