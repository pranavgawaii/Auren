import { useEffect } from "react";

interface ShortcutsProps {
  onCmdK?: () => void;
  onCmdR?: () => void;
  onCmdE?: () => void;
  onEscape?: () => void;
  onJ?: () => void;
  onK?: () => void;
  onGI?: () => void;
  onGS?: () => void;
}

export function useKeyboardShortcuts({
  onCmdK,
  onCmdR,
  onCmdE,
  onEscape,
  onJ,
  onK,
  onGI,
  onGS,
}: ShortcutsProps) {
  useEffect(() => {
    let gPressed = false;
    let gTimeout: NodeJS.Timeout;

    const handler = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (e.key === "Escape") {
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        return;
      }

      if (e.metaKey && e.key === "k") {
        if (onCmdK) {
          e.preventDefault();
          onCmdK();
        }
        return;
      }

      if (isInput) return;

      if (e.metaKey && e.key === "r") {
        if (onCmdR) {
          e.preventDefault();
          onCmdR();
        }
        return;
      }

      if (e.metaKey && e.key === "e") {
        if (onCmdE) {
          e.preventDefault();
          onCmdE();
        }
        return;
      }

      if (e.key === "j" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (onJ) {
          e.preventDefault();
          onJ();
        }
        return;
      }

      if (e.key === "k" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (onK) {
          e.preventDefault();
          onK();
        }
        return;
      }

      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        gPressed = true;
        clearTimeout(gTimeout);
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      if (gPressed && e.key === "i" && !e.metaKey) {
        if (onGI) {
          e.preventDefault();
          onGI();
        }
        gPressed = false;
        return;
      }

      if (gPressed && e.key === "s" && !e.metaKey) {
        if (onGS) {
          e.preventDefault();
          onGS();
        }
        gPressed = false;
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(gTimeout);
    };
  }, [onCmdK, onCmdR, onCmdE, onEscape, onJ, onK, onGI, onGS]);
}
