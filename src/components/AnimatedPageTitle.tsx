import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

type AnimatedPageTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  gradientClassName?: string;
  initialScale?: number;
  durationMs?: number;
  fromFontSizePx?: number;
  toFontSizePx?: number;
};

export default function AnimatedPageTitle({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  gradientClassName,
  initialScale = 0.8,
  durationMs = 800,
  fromFontSizePx = 24,
  toFontSizePx = 30,
}: AnimatedPageTitleProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <motion.h2
        initial={{ opacity: 0, scale: initialScale, fontSize: fromFontSizePx }}
        animate={{ opacity: 1, scale: 1, fontSize: toFontSizePx }}
        transition={{ duration: durationMs / 1000, ease: 'easeInOut' }}
        className={cn(
          'font-bold tracking-tight leading-tight',
          'bg-clip-text text-transparent',
          gradientClassName ?? 'bg-linear-to-r from-primary via-emerald-400 to-blue-500',
          titleClassName
        )}
      >
        {title}
      </motion.h2>

      {subtitle ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: 'easeInOut' }}
          className={cn('font-medium text-white', subtitleClassName)}
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}

