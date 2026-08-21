'use client';

import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

const viewport = {
  once: true,
  amount: 0.32,
  margin: '0px 0px -10% 0px',
} as const;

const sectionVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.16, delayChildren: 0.04 },
  },
};

const blockVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const headingVariants = {
  hidden: { y: '110%' },
  visible: {
    y: 0,
    transition: { duration: 0.72, ease },
  },
};

const bodyVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

const ruleVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.85, ease },
  },
};

function Statement({
  title,
  children,
  className,
}: {
  title: string;
  children: string;
  className?: string;
}) {
  return (
    <motion.article className={className ? `vision-mission-block ${className}` : 'vision-mission-block'} variants={blockVariants}>
      <div className="vision-mission-heading-mask">
        <motion.h2 variants={headingVariants}>{title}</motion.h2>
      </div>
      <motion.p variants={bodyVariants}>{children}</motion.p>
    </motion.article>
  );
}

export default function VisionMission() {
  const reduce = useReducedMotion();
  const motionProps = reduce
    ? { initial: false as const }
    : {
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport,
        variants: sectionVariants,
      };

  return (
    <section className="vision-mission" aria-label="Our vision and mission">
      <motion.div className="vision-mission-inner" {...motionProps}>
        <Statement title="Our Vision">
          To be a trusted and leading professional services firm recognized for excellence, integrity, innovation, and client satisfaction, empowering businesses to achieve sustainable growth while navigating an evolving regulatory and commercial landscape.
        </Statement>

        <motion.div
          className="vision-mission-rule"
          aria-hidden="true"
          variants={reduce ? undefined : ruleVariants}
          style={{ originY: 0 }}
        />

        <Statement title="Our Mission" className="vision-mission-block--offset">
          To deliver reliable, practical, and value-driven professional services while upholding the highest standards of integrity and professionalism. We are committed to helping businesses achieve compliance, manage risks, and drive sustainable growth through trusted advisory and strategic support.
        </Statement>
      </motion.div>
    </section>
  );
}
