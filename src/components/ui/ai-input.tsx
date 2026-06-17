"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"

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
}

const FormContext = React.createContext({} as ContextShape)
const useFormContext = () => React.useContext(FormContext)

interface MorphPanelProps {
  onExecute: (command: string) => void;
  isAgentLoading?: boolean;
}

export function MorphPanel({ onExecute, isAgentLoading = false }: MorphPanelProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  const [showForm, setShowForm] = React.useState(false)
  const [successFlag, setSuccessFlag] = React.useState(false)

  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [panelSize, setPanelSize] = React.useState({ width: 360, height: 200 })
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
    () => ({ showForm, successFlag, triggerOpen, triggerClose, isFullscreen, setIsFullscreen, isAgentLoading, startResize }),
    [showForm, successFlag, triggerOpen, triggerClose, isFullscreen, isAgentLoading, startResize]
  )

  return (
    <div className="flex items-end justify-end pointer-events-auto origin-bottom-right transition-all">
      <motion.div
        ref={wrapperRef}
        data-panel
        className={cx(
          "bg-[#FAF8F5] z-50 flex flex-col items-center overflow-hidden border border-[rgba(36,27,20,0.08)] shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        )}
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
  const { showForm, triggerOpen } = useFormContext()
  return (
    <footer className="mt-auto flex h-[44px] items-center justify-center whitespace-nowrap select-none w-full">
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
          <span className="truncate text-[#241B14] font-medium text-[13px]">Ask Auren AI</span>
        </Button>
      </div>
    </footer>
  )
}

const FORM_WIDTH = 360
const FORM_HEIGHT = 200

function InputForm({ inputRef, onSuccess, onExecute }: { inputRef: React.RefObject<HTMLTextAreaElement>; onSuccess: () => void; onExecute: (cmd: string) => void }) {
  const { triggerClose, showForm, isFullscreen, setIsFullscreen, isAgentLoading, startResize } = useFormContext()
  const btnRef = React.useRef<HTMLButtonElement>(null)

  const [isListening, setIsListening] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)

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
    if (inputRef.current?.value) {
      onExecute(inputRef.current.value)
      inputRef.current.value = ""
    }
    onSuccess()
  }

  function handleKeys(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") triggerClose()
    if (e.key === "Enter" && !e.shiftKey) { // Trigger on Enter (use Shift+Enter for newline)
      e.preventDefault()
      btnRef.current?.click()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-0 w-full h-full"
      style={{ pointerEvents: showForm ? "all" : "none" }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }}
            className="flex h-full flex-col p-1"
          >
            <div className="flex justify-between py-1 relative">
              {!isFullscreen && (
                <div 
                  className="absolute top-[2px] left-[2px] w-6 h-6 cursor-nwse-resize z-10 opacity-50 hover:opacity-100"
                  onMouseDown={startResize}
                  title="Drag to resize"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[rgba(36,27,20,0.4)] absolute top-2 left-2">
                    <path d="M21 3L3 21M21 9L9 21M21 15L15 21" />
                  </svg>
                </div>
              )}
              <p className="text-[#241B14] z-2 ml-[38px] flex items-center gap-[6px] select-none font-medium text-[13px]">
                Auren AI Agent
              </p>
              <div className="flex items-center gap-1 right-4 mt-1 -translate-y-[3px]">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center justify-center p-1.5 rounded-[8px] transition-colors text-[rgba(36,27,20,0.5)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.04)]"
                  title={isFullscreen ? "Minimize" : "Full Screen"}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button
                  type="button"
                  onClick={toggleMic}
                  className={cx(
                    "flex items-center justify-center p-1.5 rounded-[8px] transition-colors",
                    isListening ? "bg-[#E8593C]/10 text-[#E8593C]" : "text-[rgba(36,27,20,0.5)] hover:text-[#241B14] hover:bg-[rgba(36,27,20,0.04)]"
                  )}
                  title="Voice Input"
                >
                  <Mic size={14} className={isListening ? "animate-pulse" : ""} />
                </button>
                <button
                  type="submit"
                  ref={btnRef}
                  disabled={isAgentLoading}
                  className="text-[rgba(36,27,20,0.5)] flex cursor-pointer items-center justify-center gap-1 rounded-[12px] bg-transparent pr-1 text-center select-none hover:text-[#241B14] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <KeyHint className="w-fit">Enter</KeyHint>
                </button>
              </div>
            </div>
            
            {isAgentLoading ? (
              <div className="flex-1 w-full flex items-center justify-center bg-transparent pb-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-[#E8593C]" animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} />
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-[#E8593C]" animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} />
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-[#E8593C]" animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} />
                  </div>
                  <span className="text-[13px] text-[rgba(36,27,20,0.5)] font-medium">Agent is thinking...</span>
                </div>
              </div>
            ) : (
              <textarea
                ref={inputRef}
                placeholder="Ask me to review code, create events, or summarize tasks..."
                name="message"
                className="flex-1 w-full resize-none scroll-py-2 rounded-md p-4 outline-0 text-[#241B14] bg-transparent placeholder:text-[rgba(36,27,20,0.3)] text-[14px]"
                required
                onKeyDown={handleKeys}
                spellCheck={false}
              />
            )}
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
        "text-[rgba(36,27,20,0.6)] flex h-6 w-fit items-center justify-center rounded-sm border border-[rgba(36,27,20,0.08)] bg-[#FAF8F5] px-[6px] font-mono text-[10px]",
        className
      )}
    >
      {children}
    </kbd>
  )
}

export default MorphPanel
