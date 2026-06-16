"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Terminal, GitBranch, type LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number]
    }
  }
}

export function Features() {

    return (
        <section id="features" className="py-16 md:py-32" style={{ background: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(36,27,20,0.08)" }}>
            <div className="mx-auto max-w-2xl px-6 lg:max-w-5xl">
                <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className="text-[16px] md:text-[18px] leading-relaxed text-muted-foreground mt-2 mb-12 max-w-2xl mx-auto text-center"
                >
                    Auren normalizes your work into a single command. Calibrated to expert workflows, not manual clicks. We&apos;ve built the execution layer for the next generation of builders.
                </motion.p>
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="mx-auto grid gap-4 lg:grid-cols-2"
                >
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Terminal}
                                title="Action-Oriented Workflows"
                                description="Turn intent into execution. Instantly."
                            />
                        </CardHeader>

                        <CardContent>
                            <p style={{ fontFamily: "var(--font-sans)", color: "rgba(36,27,20,0.6)", fontSize: "16px", lineHeight: "1.6", marginBottom: "16px" }}>
                                Draft investor updates, schedule team standups, or file structured GitHub issues. Auren runs your workflows silently in the background so you can focus on building.
                            </p>
                            <p style={{ fontFamily: "var(--font-sans)", color: "rgba(36,27,20,0.6)", fontSize: "16px", lineHeight: "1.6" }}>
                                Zero context switching. Zero tab wrangling. Direct execution across your entire software stack.
                            </p>
                        </CardContent>
                    </FeatureCard>

                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={GitBranch}
                                title="Cross-Platform Context"
                                description="A unified context layer for your stack."
                            />
                        </CardHeader>

                        <CardContent>
                            <p style={{ fontFamily: "var(--font-sans)", color: "rgba(36,27,20,0.6)", fontSize: "16px", lineHeight: "1.6", marginBottom: "16px" }}>
                                Auren reads your latest commits to draft standup emails, scans your calendar before proposing meetings, and references historical threads to tailor perfect replies.
                            </p>
                            <p style={{ fontFamily: "var(--font-sans)", color: "rgba(36,27,20,0.6)", fontSize: "16px", lineHeight: "1.6" }}>
                                It bridges the gap between your engineering tools and your communication channels, automatically.
                            </p>
                        </CardContent>
                    </FeatureCard>

                    <FeatureCard className="p-6 lg:col-span-2">
                        <p className="mx-auto my-6 max-w-md text-balance text-center text-2xl font-semibold" style={{ color: "#241B14", fontFamily: "var(--font-civane, Georgia, serif)" }}>
                            Review the full plan before anything runs. One click executes everything.
                        </p>

                        <div className="flex justify-center gap-6 overflow-hidden">
                            <CircularUI
                                label="Analyze"
                                circles={[{ pattern: 'border' }, { pattern: 'border' }]}
                            />

                            <CircularUI
                                label="Plan"
                                circles={[{ pattern: 'none' }, { pattern: 'primary' }]}
                            />

                            <CircularUI
                                label="Approve"
                                circles={[{ pattern: 'blue' }, { pattern: 'primary' }]}
                            />

                            <CircularUI
                                label="Execute"
                                circles={[{ pattern: 'primary' }, { pattern: 'primary' }]}
                                className="hidden sm:block"
                            />
                        </div>
                    </FeatureCard>
                </motion.div>
            </div>
        </section>
    )
}

interface FeatureCardProps {
    children: ReactNode
    className?: string
}

const FeatureCard = ({ children, className }: FeatureCardProps) => {
    const gridClasses = className?.split(' ').filter(c => c.includes('col-span') || c.includes('lg:col-span')).join(' ') || '';
    const cardClasses = className?.split(' ').filter(c => !c.includes('col-span') && !c.includes('lg:col-span')).join(' ') || '';

    return (
        <motion.div 
            variants={cardVariants} 
            className={cn("h-full", gridClasses)}
            whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
        >
            <Card className={cn('group relative rounded-[18px] h-full w-full transition-shadow duration-300 hover:shadow-xl', cardClasses)} style={{ background: "#FFFFFF", borderColor: "rgba(36,27,20,0.08)", boxShadow: "0 4px 24px rgba(36,27,20,0.04)" }}>
                <CardDecorator />
                {children}
            </Card>
        </motion.div>
    );
}

const CardDecorator = () => (
    <>
        <span className="absolute -left-px -top-px block size-2 border-l-2 border-t-2" style={{ borderColor: "#E8593C" }}></span>
        <span className="absolute -right-px -top-px block size-2 border-r-2 border-t-2" style={{ borderColor: "#E8593C" }}></span>
        <span className="absolute -bottom-px -left-px block size-2 border-b-2 border-l-2" style={{ borderColor: "#E8593C" }}></span>
        <span className="absolute -bottom-px -right-px block size-2 border-b-2 border-r-2" style={{ borderColor: "#E8593C" }}></span>
    </>
)

interface CardHeadingProps {
    icon: LucideIcon
    title: string
    description: string
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
    <div className="p-6">
        <span className="flex items-center gap-2" style={{ color: "#E8593C", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "14px", letterSpacing: "0.03em" }}>
            <Icon className="size-4" />
            {title.toUpperCase()}
        </span>
        <p className="mt-8 text-2xl font-semibold" style={{ fontFamily: "var(--font-civane, Georgia, serif)", color: "#241B14", fontWeight: 400 }}>{description}</p>
    </div>
)



interface CircleConfig {
    pattern: 'none' | 'border' | 'primary' | 'blue'
}

interface CircularUIProps {
    label: string
    circles: CircleConfig[]
    className?: string
}

const CircularUI = ({ label, circles, className }: CircularUIProps) => (
    <motion.div 
        className={className}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
        <div className="bg-gradient-to-b from-[rgba(36,27,20,0.12)] size-fit rounded-2xl to-transparent p-px">
            <div className="bg-gradient-to-b from-background to-neutral-100/30 relative flex aspect-square w-fit items-center -space-x-4 rounded-[15px] p-4">
                {circles.map((circle, i) => (
                    <div
                        key={i}
                        className={cn('size-7 rounded-full border sm:size-8', {
                            'border-neutral-300 bg-background': circle.pattern === 'none',
                            'border-neutral-300 bg-[repeating-linear-gradient(-45deg,rgba(36,27,20,0.2),rgba(36,27,20,0.2)_1px,transparent_1px,transparent_4px)]': circle.pattern === 'border',
                            'border-primary bg-background bg-[repeating-linear-gradient(-45deg,hsl(var(--primary)),hsl(var(--primary))_1px,transparent_1px,transparent_4px)]': circle.pattern === 'primary',
                            'bg-background z-10 border-blue-500 bg-[repeating-linear-gradient(-45deg,theme(colors.blue.500),theme(colors.blue.500)_1px,transparent_1px,transparent_4px)]': circle.pattern === 'blue',
                        })}></div>
                ))}
            </div>
        </div>
        <span className="text-muted-foreground mt-1.5 block text-center text-sm">{label}</span>
    </motion.div>
)
