"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 40,
        spread: 50,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#E8593C", 
          "#241B14", 
          "#0F6E56", 
          "#FBF3EC", 
        ],
        ticks: 150,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 20,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="container py-2 max-w-[760px] mx-auto bg-[#FAF8F5] dark:bg-[#2C2C2C]">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-[28px] font-semibold tracking-tight text-[#241B14] dark:text-[#F4F4F5]" style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
          {title}
        </h2>
        <p className="text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] text-[13px] whitespace-pre-line max-w-lg mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <label className="relative inline-flex items-center cursor-pointer">
          <Label>
            <Switch
              ref={switchRef as any}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
              className="relative shadow-sm scale-90"
            />
          </Label>
        </label>
        <span className="ml-2 font-semibold text-[#241B14] dark:text-[#F4F4F5] text-[13px]">
          Annual billing <span className="text-[#E8593C] font-bold">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 30, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -6 : 0,
                    opacity: 1,
                    x: index === 2 ? -10 : index === 0 ? 10 : 0,
                    scale: index === 0 || index === 2 ? 0.98 : 1.02,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
              type: "spring",
              stiffness: 100,
              damping: 25,
              delay: 0.1,
              opacity: { duration: 0.3 },
            }}
            className={cn(
              `rounded-[16px] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] p-5 text-center lg:flex lg:flex-col lg:justify-center relative shadow-sm transition-shadow hover:shadow-md`,
              plan.isPopular ? "bg-[#241B14] text-white border-none shadow-[0_8px_20px_rgba(36,27,20,0.15)]" : "bg-white dark:bg-[#383838] text-[#241B14] dark:text-[#F4F4F5]",
              "flex flex-col",
              !plan.isPopular && "mt-4 lg:mt-0",
              index === 0 || index === 2
                ? "z-0"
                : "z-10",
              index === 0 && "origin-right",
              index === 2 && "origin-left"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <span className="bg-[#E8593C] text-white px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest shadow-md flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Most Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className={`text-[16px] font-bold ${plan.isPopular ? "text-white" : "text-[#241B14] dark:text-[#F4F4F5]"}`} style={{ fontFamily: "var(--font-civane, Georgia, serif)" }}>
                {plan.name}
              </p>
              
              <div className="mt-3 flex items-center justify-center gap-x-1">
                <span className={`text-[32px] font-extrabold tracking-tight ${plan.isPopular ? "text-white" : "text-[#241B14] dark:text-[#F4F4F5]"}`}>
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: "currency",
                      currency: "INR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{
                      duration: 400,
                      easing: "ease-out",
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className={`text-[12px] font-medium leading-5 tracking-wide ${plan.isPopular ? "text-white/50" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]"}`}>
                    / mo
                  </span>
                )}
              </div>

              <p className={`text-[10px] leading-4 mt-0.5 font-medium ${plan.isPopular ? "text-[#E8593C]" : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]"}`}>
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-5 gap-2.5 flex flex-col">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className={`h-3 w-3 mt-0.5 flex-shrink-0 ${plan.isPopular ? "text-[#E8593C]" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]"}`} />
                    <span className={`text-left text-[11px] leading-relaxed font-medium ${plan.isPopular ? "text-white/90" : "text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)]"}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className={`w-full my-4 border-t ${plan.isPopular ? "border-white/10" : "border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]"}`} />

              <button
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-[12px] font-bold tracking-wide h-9 rounded-[8px]",
                  "transform-gpu ring-offset-current transition-all duration-200 ease-out hover:scale-[1.02] active:scale-95",
                  plan.isPopular
                    ? "bg-[#E8593C] text-white border-transparent hover:bg-[#E8593C]-hover hover:text-white shadow-sm"
                    : "bg-[#FAF8F5] dark:bg-[#2C2C2C] text-[#241B14] dark:text-[#F4F4F5] hover:bg-[#EBE5DE] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]"
                )}
              >
                {plan.buttonText}
              </button>
              <p className={`mt-3 text-[10px] leading-4 font-medium ${plan.isPopular ? "text-white/40" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)]"}`}>
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
