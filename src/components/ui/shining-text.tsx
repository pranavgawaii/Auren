"use client" 

import * as React from "react"
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
 
export function ShiningText({ text, className }: { text: string; className?: string }) {
  return (
    <motion.h1
      className={cn(
        "bg-[linear-gradient(110deg,#a39d9a,35%,#241b14,50%,#a39d9a,75%,#a39d9a)] bg-[length:200%_100%] bg-clip-text text-base font-medium text-transparent",
        className
      )}
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: "linear",
      }}
    >
      {text}
    </motion.h1>
  )
}
