"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion, useDragControls } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Mic, Maximize2, Minimize2 } from "lucide-react"

interface OrbProps {
  dimension?: string
  className?: string
  tones?: {
    base?: string
    accent1?: string
    accent2?: string
    accent3?: string
  }
  spinDuration?: number
}

const ColorOrb: React.FC<OrbProps> = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 20,
}) => {
  const fallbackTones = {
    base: "oklch(95% 0.02 264.695)",
    accent1: "oklch(75% 0.15 350)",
    accent2: "oklch(80% 0.12 200)",
    accent3: "oklch(78% 0.14 280)",
  }

  const palette = { ...fallbackTones, ...tones }

  const dimValue = parseInt(dimension.replace("px", ""), 10)

  const blurStrength =
    dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)

  const contrastStrength =
    dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)

  const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1)

  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)

  const maskRadius =
    dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"

  const adjustedContrast =
    dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength

  return (
    <div
      className={cn("color-orb", className)}
      style={{
        width: dimension,
        height: dimension,
        "--base": palette.base,
        "--accent1": palette.accent1,
        "--accent2": palette.accent2,
        "--accent3": palette.accent3,
        "--spin-duration": `${spinDuration}s`,
        "--blur": `${blurStrength}px`,
        "--contrast": adjustedContrast,
        "--dot": `${pixelDot}px`,
        "--shadow": `${shadowRange}px`,
        "--mask": maskRadius,
      } as React.CSSProperties}
    >
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          transform: scale(1.1);
        }

        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .color-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--accent2),
              transparent 30% 60%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--accent1),
              transparent 40% 60%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--accent2),
              transparent 10% 90%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--accent1),
              transparent 10% 90%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            );
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }

        .color-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--base) var(--dot),
            transparent var(--dot)
          );
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }

        .color-orb[style*="--mask: 0%"]::after {
          mask-image: none;
        }

        .color-orb:not([style*="--mask: 0%"])::after {
          mask-image: radial-gradient(black var(--mask), transparent 75%);
        }

        @keyframes spin {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

const SPEED_FACTOR = 1

interface ContextShape {
  showForm: boolean
  successFlag: boolean
  triggerOpen: () => void
  triggerClose: () => void
  isFullscreen: boolean
  setIsFullscreen: (val: boolean) => void
  isAgentLoading: boolean
  startResize: (e: React.MouseEvent) => void
  dragControls: any
}

const FormContext = React.createContext({} as ContextShape)
const useFormContext = () => React.useContext(FormContext)

interface MorphPanelProps {
  onExecute: (command: string, history?: any[]) => Promise<any>;
  isAgentLoading?: boolean;
}

export function MorphPanel({ onExecute, isAgentLoading = false }: MorphPanelProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const dragControls = useDragControls()

  const [showForm, setShowForm] = React.useState(false)
  const [successFlag, setSuccessFlag] = React.useState(false)

  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [panelSize, setPanelSize] = React.useState({ width: 400, height: 440 })
  const [isResizing, setIsResizing] = React.useState(false)

  const triggerClose = React.useCallback(() => {
    setShowForm(false)
    setIsFullscreen(false)
    textareaRef.current?.blur()
  }, [])

  const triggerOpen = React.useCallback(() => {
    setShowForm(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    })
  }, [])

  const handleSuccess = React.useCallback(() => {
    setSuccessFlag(true)
    setTimeout(() => setSuccessFlag(false), 1500)
  }, [])

  const startResize = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panelSize.width;
    const startHeight = panelSize.height;

    const doResize = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const deltaY = startY - moveEvent.clientY;
      setPanelSize({
        width: Math.max(300, Math.min(1000, startWidth + deltaX)),
        height: Math.max(150, Math.min(800, startHeight + deltaY)),
      });
    };

    const stopResize = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", doResize);
      document.removeEventListener("mouseup", stopResize);
    };

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResize);
  }, [panelSize]);

  React.useEffect(() => {
    function clickOutsideHandler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && showForm) {
        triggerClose()
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler)
    return () => document.removeEventListener("mousedown", clickOutsideHandler)
  }, [showForm, triggerClose])

  const ctx = React.useMemo(
    () => ({ showForm, successFlag, triggerOpen, triggerClose, isFullscreen, setIsFullscreen, isAgentLoading, startResize, dragControls }),
    [showForm, successFlag, triggerOpen, triggerClose, isFullscreen, isAgentLoading, startResize, dragControls]
  )

  return (
    <div className="flex items-end justify-end pointer-events-auto origin-bottom-right transition-all">
      <motion.div
        ref={wrapperRef}
        data-panel
        className={cx(
          "bg-[#FAF8F5] dark:bg-[#383838] z-50 flex flex-col items-center overflow-hidden border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        )}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        initial={false}
        animate={{
          width: showForm ? (isFullscreen ? "80vw" : panelSize.width) : 140, // compact size when closed
          height: showForm ? (isFullscreen ? "80vh" : panelSize.height) : 44,
          borderRadius: showForm ? 14 : 22,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / SPEED_FACTOR,
          damping: 45,
          mass: 0.7,
          delay: showForm ? 0 : 0.08,
        }}
      >
        <FormContext.Provider value={ctx}>
          <DockBar />
          <InputForm inputRef={textareaRef} onSuccess={handleSuccess} onExecute={onExecute} />
        </FormContext.Provider>
      </motion.div>
    </div>
  )
}

function DockBar() {
  const { showForm, triggerOpen, dragControls } = useFormContext()
  return (
    <footer 
      className={cx(
        "mt-auto flex h-[44px] items-center justify-center whitespace-nowrap select-none w-full",
        !showForm && "cursor-grab active:cursor-grabbing"
      )}
      onPointerDown={(e) => {
        if (!showForm) {
          const tag = (e.target as HTMLElement).tagName;
          if (tag !== 'BUTTON') {
            dragControls.start(e);
          }
        }
      }}
    >
      <div className="flex items-center justify-center gap-2 px-3 h-full w-full">
        <div className="flex w-fit items-center gap-2">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="blank"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                className="h-5 w-5"
              />
            ) : (
              <motion.div
                key="orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)", accent1: "oklch(60% 0.15 30)", accent2: "oklch(50% 0.15 40)", accent3: "oklch(70% 0.15 20)" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="button"
          className="flex h-fit flex-1 justify-center rounded-full px-2 !py-0.5"
          variant="ghost"
          onClick={triggerOpen}
        >
          <span className="truncate text-[#241B14] dark:text-[#F4F4F5] font-medium text-[13px]">Ask Auren AI</span>
        </Button>
      </div>
    </footer>
  )
}

const FORM_WIDTH = 400
const FORM_HEIGHT = 440

import { Check } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"

// Mentions State
const MOCK_MENTIONS = [
  { id: '1', trigger: '@', type: 'contact', label: 'Pranav Gawai', value: '@Pranav Gawai', displayValue: 'pranavgawai1518@gmail.com', icon: '@' },
  { id: '2', trigger: '@', type: 'contact', label: 'Product Team', value: '@Product Team', displayValue: 'product@example.com', icon: '@' },
  { id: '3', trigger: '/', type: 'repo', label: 'Auren Frontend', value: 'github/Auren', displayValue: 'github.com/8TEEH/Auren', icon: '/' },
  { id: '4', trigger: '/', type: 'repo', label: 'skills-introduction-to-github', value: 'github/skills-introduction-to-github', displayValue: 'github.com/8TEEH/skills-intro...', icon: '/' },
]

function InputForm({ inputRef, onSuccess, onExecute }: { inputRef: React.RefObject<HTMLTextAreaElement>; onSuccess: () => void; onExecute: (cmd: string, history?: any[]) => Promise<any> }) {
  const { triggerClose, showForm, isFullscreen, setIsFullscreen, isAgentLoading, startResize, dragControls } = useFormContext()
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const { user } = useUser()

  const [isListening, setIsListening] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)
  
  // Real Chat State
  const [chatHistory, setChatHistory] = React.useState<{role: "user" | "agent", content?: string, isTyping?: boolean, plan?: any}[]>([])

  const [mentionQuery, setMentionQuery] = React.useState<{ trigger: '@' | '/', text: string } | null>(null)
  const [mentionIndex, setMentionIndex] = React.useState(0)
  
  const filteredMentions = React.useMemo(() => {
    if (!mentionQuery) return []
    return MOCK_MENTIONS.filter(m => 
       m.trigger === mentionQuery.trigger &&
       (m.label.toLowerCase().includes(mentionQuery.text) || m.displayValue.toLowerCase().includes(mentionQuery.text))
    )
  }, [mentionQuery])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/([@/])(\S*)$/);
    if (match) {
      setMentionQuery({ trigger: match[1] as '@' | '/', text: match[2].toLowerCase() });
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  }

  const insertMention = (value: string) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const cursor = input.selectionStart;
    const val = input.value;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/([@/])(\S*)$/);
    
    if (match) {
       const start = match.index!;
       const before = val.slice(0, start);
       const after = val.slice(cursor);
       const inserted = value + ' ';
       input.value = before + inserted + after;
       
       const newCursor = start + inserted.length;
       input.setSelectionRange(newCursor, newCursor);
       
       setMentionQuery(null);
       input.focus();
    }
  }

  const renderHighlightedText = (text: string, role: "user" | "agent") => {
    if (!text) return text;
    const exactMatches = MOCK_MENTIONS.map(m => m.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!exactMatches) return text;
    
    const regex = new RegExp(`(${exactMatches})`, 'g');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (MOCK_MENTIONS.some(m => m.value === part)) {
         if (role === "user") {
            return <span key={i} className="text-[#E8593C] bg-white dark:bg-[#383838] px-1.5 py-[2px] rounded border border-white/20 mx-[2px] font-bold shadow-sm">{part}</span>
         } else {
            return <span key={i} className="text-[#E8593C] font-semibold bg-[#E8593C]/10 border border-[#E8593C]/20 px-1.5 py-[2px] rounded mx-[2px]">{part}</span>
         }
      }
      return part;
    });
  }

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = true
        rec.onresult = (event: any) => {
          const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("")
          if (inputRef.current) inputRef.current.value = transcript
        }
        rec.onend = () => setIsListening(false)
        recognitionRef.current = rec
      }
    }
  }, [inputRef])

  const toggleMic = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      if (inputRef.current) inputRef.current.value = ""
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const val = inputRef.current?.value
    if (val) {
      // Add user message & show typing indicator
      const currentHistory = [...chatHistory]
      setChatHistory(prev => [...prev, {role: "user", content: val}, {role: "agent", isTyping: true}])
      
      const res = await onExecute(val, currentHistory)
      
      // Replace typing indicator with actual response
      if (res) {
        if (res.followUpQuestion) {
          setChatHistory(prev => {
            const next = [...prev];
            next[next.length - 1] = {role: "agent", content: res.followUpQuestion}
            return next;
          })
        } else if ((res.actions && res.actions.length > 0) || res.briefing) {
          setChatHistory(prev => {
            const next = [...prev];
            next[next.length - 1] = {role: "agent", plan: res}
            return next;
          })
          if (res.briefing) {
            triggerClose();
          }
        } else {
          // Fallback if empty explanation but no actions
          setChatHistory(prev => {
            const next = [...prev];
            next[next.length - 1] = {role: "agent", content: res.explanation || "Done."}
            return next;
          })
        }
      } else {
        // Failed
        setChatHistory(prev => {
           const next = [...prev];
           next[next.length - 1] = {role: "agent", content: "Failed to process command. Please try again."}
           return next;
        })
      }
      
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
    onSuccess()
  }

  function handleKeys(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && filteredMentions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(i => Math.min(i + 1, filteredMentions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredMentions[mentionIndex]) {
           insertMention(filteredMentions[mentionIndex].value);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === 'Backspace') {
      const cursor = e.currentTarget.selectionStart;
      if (cursor === e.currentTarget.selectionEnd) {
        const textBeforeCursor = e.currentTarget.value.slice(0, cursor);
        for (const m of MOCK_MENTIONS) {
          if (textBeforeCursor.endsWith(m.value + ' ')) {
            e.preventDefault();
            const start = cursor - (m.value.length + 1);
            const after = e.currentTarget.value.slice(cursor);
            e.currentTarget.value = e.currentTarget.value.slice(0, start) + after;
            e.currentTarget.setSelectionRange(start, start);
            handleInput(e as any);
            return;
          } else if (textBeforeCursor.endsWith(m.value)) {
            e.preventDefault();
            const start = cursor - m.value.length;
            const after = e.currentTarget.value.slice(cursor);
            e.currentTarget.value = e.currentTarget.value.slice(0, start) + after;
            e.currentTarget.setSelectionRange(start, start);
            handleInput(e as any);
            return;
          }
        }
      }
    }

    if (e.key === "Escape") triggerClose()
    if (e.key === "Enter" && !e.shiftKey) { // Trigger on Enter (use Shift+Enter for newline)
      e.preventDefault()
      btnRef.current?.click()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-0 w-full h-full flex flex-col"
      style={{ pointerEvents: showForm ? "all" : "none" }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }}
            className="flex h-full flex-col p-1 relative"
          >
            <div 
              className="flex justify-between py-1 relative shrink-0 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                const tag = (e.target as HTMLElement).tagName;
                if (tag !== 'BUTTON' && tag !== 'SVG' && tag !== 'path') {
                  dragControls.start(e);
                }
              }}
            >
              {!isFullscreen && (
                <div 
                  className="absolute top-[2px] left-[2px] w-6 h-6 cursor-nwse-resize z-10 opacity-50 hover:opacity-100"
                  onMouseDown={startResize}
                  title="Drag to resize"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] absolute top-2 left-2">
                    <path d="M21 3L3 21M21 9L9 21M21 15L15 21" />
                  </svg>
                </div>
              )}
              <p className="text-[#241B14] dark:text-[#F4F4F5] z-2 ml-[38px] flex items-center gap-[6px] select-none font-medium text-[13px]">
                Auren AI Agent
              </p>
              <div className="flex items-center gap-1 right-4 mt-1 -translate-y-[3px]">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center justify-center p-1.5 rounded-[8px] transition-colors text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] hover:text-[#241B14] dark:text-[#F4F4F5] hover:bg-[rgba(36,27,20,0.04)] dark:bg-[rgba(255,255,255,0.04)]"
                  title={isFullscreen ? "Minimize" : "Full Screen"}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button
                  type="submit"
                  ref={btnRef}
                  disabled={isAgentLoading}
                  className="text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] flex cursor-pointer items-center justify-center gap-1 rounded-[12px] bg-transparent pr-1 text-center select-none hover:text-[#241B14] dark:text-[#F4F4F5] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <KeyHint className="w-fit">Enter</KeyHint>
                </button>
              </div>
            </div>
            
            {/* Chat History Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide flex flex-col gap-5">
              {chatHistory.length === 0 ? (
                 <div className="flex-1 flex items-center justify-center opacity-0" />
              ) : (
                <>
                  {chatHistory.map((msg, i) => {
                    if (msg.role === "user") {
                      return (
                        <div key={i} className="flex justify-end w-full">
                          <div className="bg-[#E8593C] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-[13.5px] max-w-[85%] font-medium leading-snug shadow-sm">
                            {renderHighlightedText(msg.content || "", "user")}
                          </div>
                        </div>
                      )
                    } else if (msg.role === "agent") {
                      return (
                        <div key={i} className="flex items-start gap-2 w-full">
                          <div className="w-7 h-7 flex items-center justify-center shrink-0 mt-1">
                            <Image src="/auren_logo.webp" alt="AI" width={24} height={24} className="opacity-100 object-contain drop-shadow-sm" />
                          </div>
                          
                          {msg.isTyping ? (
                            <div className="bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] px-4 py-3 rounded-2xl rounded-tl-sm text-[13.5px] shadow-sm flex items-center gap-2">
                              <motion.div className="w-1.5 h-1.5 rounded-full bg-[#E8593C]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} />
                              <motion.div className="w-1.5 h-1.5 rounded-full bg-[#E8593C]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} />
                              <motion.div className="w-1.5 h-1.5 rounded-full bg-[#E8593C]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} />
                            </div>
                          ) : msg.content ? (
                            <div className="bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#241B14] dark:text-[#F4F4F5] px-4 py-2.5 rounded-2xl rounded-tl-sm text-[13.5px] leading-relaxed shadow-sm max-w-[85%]">
                              {renderHighlightedText(msg.content || "", "agent")}
                            </div>
                          ) : msg.plan?.briefing ? (
                            <div className="bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#241B14] dark:text-[#F4F4F5] px-4 py-2.5 rounded-2xl rounded-tl-sm text-[13.5px] leading-relaxed shadow-sm max-w-[85%]">
                              {renderHighlightedText("I've loaded your morning briefing on the screen. Have a great day!", "agent")}
                            </div>
                          ) : msg.plan ? (
                            <div className="flex flex-col gap-3 w-full">
                              <div className="bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] text-[#241B14] dark:text-[#F4F4F5] px-4 py-2.5 rounded-2xl rounded-tl-sm text-[13.5px] leading-relaxed shadow-sm">
                                {renderHighlightedText(msg.plan.explanation || "I've drafted the plan. Please review and confirm the actions.", "agent")}
                              </div>
                              <div className="flex flex-col gap-2 w-full pl-2 border-l-2 border-[#E8593C]/20 ml-2">
                                {msg.plan.actions?.map((action: any, idx: number) => (
                                  <div key={idx} className="bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] rounded-[10px] p-2.5 flex items-center gap-3 shadow-sm">
                                    <div className="w-8 h-8 bg-[#FAF8F5] dark:bg-[#2C2C2C] text-[rgba(36,27,20,0.7)] dark:text-[rgba(255,255,255,0.7)] rounded-md flex items-center justify-center shrink-0 border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)]">
                                      <Check size={14} className="text-[#E8593C]" strokeWidth={3} />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <span className="font-semibold text-[#241B14] dark:text-[#F4F4F5] text-[13px] capitalize">{action.tool.replace(/_/g, " ")}</span>
                                      <span className="text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] text-[12px] truncate">{action.description}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    }
                  })}
                </>
              )}
            </div>

            {/* Input area at bottom */}
            <div className="mt-auto shrink-0 bg-[#FAF8F5] dark:bg-[#2C2C2C] p-3 border-t border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)] shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
              <div className="relative border border-[rgba(36,27,20,0.15)] dark:border-[rgba(255,255,255,0.15)] focus-within:border-[#E8593C] rounded-xl bg-white dark:bg-[#383838] shadow-sm transition-all overflow-visible group">
                
                {/* Mention Popover */}
                <AnimatePresence>
                  {mentionQuery !== null && filteredMentions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-[calc(100%+8px)] left-0 w-[280px] max-h-[220px] overflow-y-auto bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-lg rounded-xl flex flex-col p-1.5 z-50 scrollbar-hide"
                    >
                      <div className="px-2 py-1 mb-1">
                        <span className="text-[10px] font-semibold tracking-wider text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] uppercase">Suggestions</span>
                      </div>
                      {filteredMentions.map((m, idx) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => insertMention(m.value)}
                          className={cx(
                            "flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors",
                            idx === mentionIndex ? "bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-[rgba(36,27,20,0.04)] dark:border-[rgba(255,255,255,0.04)]" : "hover:bg-[#FAF8F5] dark:bg-[#2C2C2C] border border-transparent"
                          )}
                        >
                           <div className="w-7 h-7 rounded-md bg-white dark:bg-[#383838] border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] shadow-sm flex items-center justify-center shrink-0 text-[#E8593C] font-semibold text-[13px]">
                              {m.icon}
                           </div>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-medium text-[#241B14] dark:text-[#F4F4F5] truncate">{m.label}</span>
                              <span className="text-[11px] text-[rgba(36,27,20,0.5)] dark:text-[rgba(255,255,255,0.5)] truncate">{m.displayValue}</span>
                           </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <textarea
                  ref={inputRef}
                  onChange={handleInput}
                  placeholder="Ask Auren to summarize, schedule, or manage tasks..."
                  name="message"
                  className="w-full resize-none p-3 pr-[44px] outline-none text-[#241B14] dark:text-[#F4F4F5] bg-transparent placeholder:text-[rgba(36,27,20,0.3)] dark:placeholder:text-[rgba(255,255,255,0.3)] text-[13px] min-h-[44px] max-h-[120px] font-sans"
                  required
                  onKeyDown={handleKeys}
                  spellCheck={false}
                  disabled={isAgentLoading}
                />
                
                {/* Mic Button moved to side of chat inside the input box */}
                <button
                  type="button"
                  onClick={toggleMic}
                  className={cx(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-[8px] transition-colors flex items-center justify-center",
                    isListening ? "bg-[#E8593C]/10 text-[#E8593C]" : "text-[rgba(36,27,20,0.4)] dark:text-[rgba(255,255,255,0.4)] hover:text-[#241B14] dark:hover:text-[#F4F4F5] hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.04)]"
                  )}
                  title="Voice Input"
                >
                  <Mic size={16} className={isListening ? "animate-pulse" : ""} />
                </button>
              </div>
              
              <div className="flex justify-between items-center px-1 pt-2 opacity-60">
                <span className="text-[10px] font-medium text-[#241B14] dark:text-[#F4F4F5]">Connected: Google Workspace, GitHub</span>
                <span className="text-[10px] font-medium text-[#E8593C]">Auren AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-3"
          >
            <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)", accent1: "oklch(60% 0.15 30)", accent2: "oklch(50% 0.15 40)", accent3: "oklch(70% 0.15 20)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

const SPRING_LOGO = { type: "spring", stiffness: 350 / SPEED_FACTOR, damping: 35 } as const

function KeyHint({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cx(
        "text-[rgba(36,27,20,0.6)] dark:text-[rgba(255,255,255,0.6)] flex h-6 w-fit items-center justify-center rounded-sm border border-[rgba(36,27,20,0.08)] dark:border-[rgba(255,255,255,0.08)] bg-[#FAF8F5] dark:bg-[#2C2C2C] px-[6px] font-mono text-[10px]",
        className
      )}
    >
      {children}
    </kbd>
  )
}

export default MorphPanel
