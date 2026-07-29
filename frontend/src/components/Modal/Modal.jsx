import { useEffect, useId, useRef } from 'react';
import { XIcon } from '../Icon/Icon.jsx';

/**
 * Modal — centered dialog with backdrop, following the WAI-ARIA
 * Dialog (Modal) Pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 *
 *   - `role="dialog"` + `aria-modal="true"`
 *   - `aria-labelledby` wired to the title, `aria-describedby` wired
 *     to `description` if provided
 *   - focus moves into the dialog on open (to the first focusable
 *     element, or the dialog container itself if it has none)
 *   - a real focus trap: Tab/Shift+Tab cycle only among the dialog's
 *     own focusable elements — focus can no longer escape to the page
 *     behind it
 *   - focus is restored to whatever element triggered the modal once
 *     it closes
 *   - Escape closes it
 *   - background scroll is locked while open
 *
 * `initialFocusRef` is optional — pass a ref to a specific element
 * (e.g. an input) to focus first instead of the default "first
 * focusable element in document order."
 */
const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  initialFocusRef,
  className = '',
}) {
  const dialogRef = useRef(null);
  const previousActiveElement = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    // Remember what had focus before opening, so it can be restored on close.
    previousActiveElement.current = document.activeElement;

    function getFocusable() {
      return dialogRef.current ? Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)) : [];
    }

    // Move focus into the dialog.
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else {
      const focusable = getFocusable();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialogRef.current?.focus();
      }
    }

    document.body.style.overflow = 'hidden';

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) {
          // Nothing to tab to — keep focus pinned on the dialog itself.
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to whatever triggered the modal, if it's still
      // in the document (it may have been removed while the modal was open).
      const previous = previousActiveElement.current;
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) {
        previous.focus();
      }
    };
  }, [open, onClose, initialFocusRef]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-secondary/50" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={[
          'relative z-10 w-full rounded-lg bg-primary-light shadow-lg outline-none',
          SIZES[size] || SIZES.md,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0">
            {title && (
              <h2 id={titleId} className="text-sh2 font-bold text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="mt-1 text-body2 text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex-shrink-0 rounded text-ink-faint hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange"
          >
            <XIcon width={18} height={18} />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer && <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
