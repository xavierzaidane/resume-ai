'use client';

import {
  useState,
  useId,
  useRef,
  useEffect,
  createContext,
  useContext,
  isValidElement,
} from 'react';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  Transition,
  Variants,
} from 'motion/react';
import useClickOutside from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';

const TRANSITION: Transition = {
  type: 'spring', // Fixed type
  bounce: 0.1,
  duration: 0.4,
};

type MorphingPopoverContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  uniqueId: string;
  variants?: Variants;
  containerRef: React.RefObject<HTMLDivElement | null>; // Fixed type
};

const MorphingPopoverContext =
  createContext<MorphingPopoverContextValue | null>(null);

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const uniqueId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isOpen = controlledOpen ?? uncontrolledOpen;

  const open = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(true);
    }
    onOpenChange?.(true);
  };

  const close = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  };

  return { isOpen, open, close, uniqueId };
}

export type MorphingPopoverProps = {
  children: React.ReactNode;
  transition?: Transition;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variants?: Variants;
  className?: string;
} & React.ComponentProps<'div'>;

function MorphingPopover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
  ...props
}: MorphingPopoverProps) {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange });
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <MorphingPopoverContext.Provider
      value={{ ...popoverLogic, variants, containerRef }}
    >
      <MotionConfig transition={transition}>
        <div
          ref={containerRef}
          className={cn('relative flex items-center justify-center', className)}
          key={popoverLogic.uniqueId}
          {...props}
        >
          {children}
        </div>
      </MotionConfig>
    </MorphingPopoverContext.Provider>
  );
}

export type MorphingPopoverTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<typeof motion.button>;

function MorphingPopoverTrigger({
  children,
  className,
  asChild = false,
  ...props
}: MorphingPopoverTriggerProps) {
  const context = useContext(MorphingPopoverContext);
  if (!context) {
    throw new Error(
      'MorphingPopoverTrigger must be used within MorphingPopover'
    );
  }

  const dataAttr = { 'data-popover-trigger': context.uniqueId };

  if (asChild && isValidElement(children)) {
    const MotionComponent = motion.create(
      children.type as React.ForwardRefExoticComponent<any>
    );
    const childProps = children.props as Record<string, unknown>;

    return (
      <MotionComponent
        {...childProps}
        {...(dataAttr as any)}
        onClick={context.open}
        layoutId={`popover-trigger-${context.uniqueId}`}
        className={childProps.className}
        key={context.uniqueId}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      />
    );
  }

  return (
    <motion.div
      key={context.uniqueId}
      layoutId={`popover-trigger-${context.uniqueId}`}
    >
      <motion.button
        {...props}
        {...(dataAttr as any)}
        layoutId={`popover-label-${context.uniqueId}`}
        key={context.uniqueId}
        className={className}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
        onClick={context.open}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

export type MorphingPopoverContentProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * side: which side of the trigger the content should appear on
   * align: how the content aligns relative to the trigger
   * sideOffset: spacing in px between trigger and content
   */
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
} & React.ComponentProps<typeof motion.div>;

function MorphingPopoverContent({
  children,
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 8,
  ...props
}: MorphingPopoverContentProps) {
  const context = useContext(MorphingPopoverContext);
  if (!context)
    throw new Error(
      'MorphingPopoverContent must be used within MorphingPopover'
    );

  const ref = useRef<HTMLDivElement>(null);


  // position relative to the containerRef
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  useEffect(() => {
    if (!context.isOpen) return;

    const computePosition = () => {
      const containerEl = context.containerRef.current;
      const contentEl = ref.current;
      const triggerEl = containerEl?.querySelector(
        `[data-popover-trigger="${context.uniqueId}"]`
      ) as HTMLElement | null;

      if (!containerEl || !contentEl || !triggerEl) return;

      const containerRect = containerEl.getBoundingClientRect();
      const triggerRect = triggerEl.getBoundingClientRect();
      const contentRect = contentEl.getBoundingClientRect();

      let top = 0;
      let left = 0;

      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;

      // compute position relative to container top-left
      if (side === 'bottom') {
        top = triggerRect.bottom - containerRect.top + sideOffset;
      } else if (side === 'top') {
        top = triggerRect.top - containerRect.top - contentRect.height - sideOffset;
      } else if (side === 'left') {
        top = triggerRect.top - containerRect.top;
      } else if (side === 'right') {
        top = triggerRect.top - containerRect.top;
      }

      if (side === 'bottom' || side === 'top') {
        if (align === 'center') {
          left =
            triggerRect.left -
            containerRect.left +
            (triggerRect.width - contentRect.width) / 2;
        } else if (align === 'start') {
          left = triggerRect.left - containerRect.left;
        } else {
          // end
          left = triggerRect.right - containerRect.left - contentRect.width;
        }
      } else {
        // left or right side: vertical alignment
        if (align === 'center') {
          top =
            triggerRect.top -
            containerRect.top +
            (triggerRect.height - contentRect.height) / 2;
        } else if (align === 'start') {
          top = triggerRect.top - containerRect.top;
        } else {
          top = triggerRect.bottom - containerRect.top - contentRect.height;
        }

        if (side === 'left') {
          left = triggerRect.left - containerRect.left - contentRect.width - sideOffset;
        } else {
          left = triggerRect.right - containerRect.left + sideOffset;
        }
      }

      // keep within container bounds (basic clamp)
      const maxLeft = containerRect.width - contentRect.width;
      const maxTop = containerRect.height - contentRect.height;
      left = Math.max(0, Math.min(left, Math.max(0, maxLeft)));
      top = Math.max(0, Math.min(top, Math.max(0, maxTop)));

      setPosition({ top: Math.round(top), left: Math.round(left) });
    };

    // compute on next paint to ensure content dimensions are available
    const raf = requestAnimationFrame(computePosition);
    const onResize = () => computePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [context.isOpen, context.uniqueId, side, align, sideOffset, context.containerRef]);

  useEffect(() => {
    if (!context.isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') context.close();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [context.isOpen, context.close]);

  return (
    <AnimatePresence>
      {context.isOpen && (
        <>
          <motion.div
            {...props}
            ref={ref}
            layoutId={`popover-trigger-${context.uniqueId}`}
            key={context.uniqueId}
            id={`popover-content-${context.uniqueId}`}
            role='dialog'
            aria-modal='true'
            className={cn(
              'absolute overflow-hidden rounded-md border border-zinc-950/10 bg-white p-2 text-zinc-950 shadow-md dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50',
              className
            )}
            initial='initial'
            animate='animate'
            exit='exit'
            variants={context.variants}
            style={
              position
                ? {
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    transform: 'translate(0,0)',
                  }
                : { visibility: 'hidden', transform: 'translate(0,0)' }
            }
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent };
