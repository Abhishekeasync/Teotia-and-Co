'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const defaultViewport = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -40px 0px',
} as const;

const defaultTransition = { duration: 0.55, ease };

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Fade-up on scroll — use for section blocks, images, text columns */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={{ ...defaultTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

type RevealTextProps = {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  delay?: number;
};

/** Fade-up heading / paragraph on scroll */
export function RevealText({
  children,
  className,
  as = 'h2',
  delay = 0,
}: RevealTextProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={defaultViewport}
      transition={{ ...defaultTransition, delay }}
    >
      {children}
    </Component>
  );
}

/** Stagger parent for card grids */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  );
}

/** Stagger child — put the card className here so layout stays intact */
export function StaggerItem({
  children,
  className,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  /** End scale when revealed (e.g. 1.06 for a center zoom) */
  scale?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 28, scale: scale > 1 ? 0.88 : 0.96 },
        visible: { opacity: 1, y: 0, scale },
      }}
      transition={{
        ...defaultTransition,
        scale: { type: 'spring', stiffness: 260, damping: 22 },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Hero / above-the-fold load animation (not scroll-triggered) */
export function HeroReveal({
  children,
  className,
  delay = 0,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...defaultTransition, delay, duration: 0.7 }}
    >
      {children}
    </motion.div>
  );
}
