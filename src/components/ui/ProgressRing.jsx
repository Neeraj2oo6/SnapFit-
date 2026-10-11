import React from 'react';
import { motion } from 'framer-motion';

export const ProgressRing = ({
  progress = 0,
  size = 120,
  strokeWidth = 10,
  circleColor = "text-slate-200 dark:text-slate-800",
  progressColor = "stroke-emerald-500",
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`${circleColor} fill-none`}
        />
        {/* Animated Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
          stroke={progressColor.startsWith('#') ? progressColor : undefined}
          className={`${progressColor.startsWith('#') ? '' : progressColor} fill-none transition-colors duration-300`}
        />
      </svg>
      {/* Center content slot */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
};
