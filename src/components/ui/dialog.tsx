import * as React from "react";
import { createPortal } from "react-dom";
import { useHotkey } from "@tanstack/react-hotkeys";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  containerClassName?: string;
}

export function Dialog({ open, onOpenChange, children, containerClassName }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  useHotkey("Escape", () => onOpenChange(false), {
    enabled: open,
    requireReset: true,
  });

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || !mounted) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const dialogContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay - mờ đen nhẹ */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />
      
      {/* Content - nằm giữa màn hình */}
      <div 
        className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
      >
        <div 
          className={cn(
            "pointer-events-auto w-full max-w-2xl max-h-[90vh]",
            containerClassName
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  showClose?: boolean;
  onClose?: () => void;
}

export function DialogContent({ children, className, showClose = true, onClose }: DialogContentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-xl relative w-full max-h-[90vh] overflow-auto mx-auto",
        className
      )}
      onClick={handleClick}
    >
      {showClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
          type="button"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      )}
      {children}
    </div>
  );
}

