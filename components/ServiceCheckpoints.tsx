'use client';

import { motion } from 'framer-motion';

type ServiceCheckpointsProps = {
  items: string[];
  /** When true, checks animate in one by one */
  active?: boolean;
  className?: string;
  /** pill = blue circle (accordion); simple = blue check (detail page) */
  variant?: 'pill' | 'simple';
};

export default function ServiceCheckpoints({
  items,
  active = true,
  className = 'service-features',
  variant = 'pill',
}: ServiceCheckpointsProps) {
  return (
    <ul className={`${className} service-checkpoints`}>
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={{ opacity: 0, x: -10 }}
          animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{
            duration: 0.35,
            delay: active ? 0.08 + i * 0.16 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.span
            className={
              variant === 'pill' ? 'checkpoint-check' : 'checkpoint-check-simple'
            }
            initial={{ scale: 0, opacity: 0 }}
            animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 16,
              delay: active ? 0.14 + i * 0.16 : 0,
            }}
            aria-hidden="true"
          >
            ✓
          </motion.span>
          <span>{item}</span>
        </motion.li>
      ))}
    </ul>
  );
}
