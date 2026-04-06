import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  /** Destructive action styling for the confirm button */
  variant?: 'danger' | 'primary';
};

const ConfirmModal = ({
  isOpen,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  variant = 'primary',
}: ConfirmModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onClose}
    >
      <div
        className="animate-in zoom-in-95 w-full max-w-md overflow-hidden rounded-3xl border border-border-main bg-surface shadow-2xl duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-main p-6">
          <h3 id="confirm-modal-title" className="text-xl font-bold text-text-main">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted transition-all hover:bg-background"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {description && <p className="text-sm leading-relaxed text-text-muted">{description}</p>}
          {children}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border-main bg-background px-5 py-3 text-sm font-bold text-text-main transition-all hover:bg-surface"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={
                variant === 'danger'
                  ? 'rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-500 active:scale-[0.98]'
                  : 'rounded-xl bg-linear-to-r from-primary to-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98]'
              }
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
