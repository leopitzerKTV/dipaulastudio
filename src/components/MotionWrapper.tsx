import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  variants?: any;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
}

export function MotionWrapper({
  children,
  className = "",
  variants,
  initial = "initial",
  animate = "animate",
  exit = "exit",
  transition = { duration: 0.3, ease: "easeInOut" },
}: MotionWrapperProps) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export function AnimatedContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <MotionWrapper
      className={className}
      variants={fadeInUp}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </MotionWrapper>
  );
}

export function AnimatedButton({ children, onClick, className = "", disabled = false }: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}

export function AnimatedCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <MotionWrapper
      className={className}
      variants={scaleIn}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </MotionWrapper>
  );
}

export function StaggerContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <MotionWrapper
      className={className}
      variants={fadeInUp}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </MotionWrapper>
  );
}
