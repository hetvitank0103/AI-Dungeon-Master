import React from "react";
import { motion } from "motion/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "primary-orange" | "secondary-orange" | "ghost-orange" | "primary-yellow" | "secondary-yellow" | "ghost-yellow" | "primary-blue" | "secondary-blue" | "ghost-blue" | "primary-violet" | "secondary-violet" | "ghost-violet" | "primary-pink" | "secondary-pink" | "ghost-pink";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  className?: string;
  onClick?: any;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle =
    "font-sans font-bold rounded-xl border focus:outline-none transition-all flex items-center justify-center cursor-pointer";

  const variants = {
    primary:
      "bg-[#4ADE80] text-black border-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:bg-[#5bee91] hover:shadow-[0_0_22px_rgba(74,222,128,0.5)] uppercase tracking-wider",
    secondary:
      "bg-[#1e1e1e] text-gray-200 border-[#333333] hover:border-[#4ADE80] hover:text-white transition-colors",
    danger:
      "bg-[#ef4444] text-white border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-500",
    ghost: "bg-transparent text-gray-400 hover:text-[#4ADE80] border-transparent",
    "primary-orange":
      "bg-[#F97316] text-black border-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:bg-[#fb923c] hover:shadow-[0_0_22px_rgba(249,115,22,0.5)] uppercase tracking-wider",
    "secondary-orange":
      "bg-[#1e1e1e] text-gray-200 border-[#333333] hover:border-[#F97316] hover:text-white transition-colors",
    "ghost-orange": "bg-transparent text-gray-400 hover:text-[#F97316] border-transparent",
    "primary-yellow":
      "bg-[#EAB308] text-black border-[#EAB308] shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:bg-[#facc15] hover:shadow-[0_0_22px_rgba(234,179,8,0.5)] uppercase tracking-wider",
    "secondary-yellow":
      "bg-[#1e1e1e] text-gray-200 border-[#333333] hover:border-[#EAB308] hover:text-white transition-colors",
    "ghost-yellow": "bg-transparent text-gray-400 hover:text-[#EAB308] border-transparent",
    "primary-blue":
      "bg-[#3B82F6] text-white border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-[#2563eb] hover:shadow-[0_0_22px_rgba(59,130,246,0.5)] uppercase tracking-wider",
    "secondary-blue":
      "bg-[#1e1e1e] text-gray-200 border-[#333333] hover:border-[#3B82F6] hover:text-white transition-colors",
    "ghost-blue": "bg-transparent text-gray-400 hover:text-[#3B82F6] border-transparent",
    "primary-violet":
      "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:bg-[#7c3aed] hover:shadow-[0_0_22px_rgba(139,92,246,0.5)] uppercase tracking-wider",
    "secondary-violet":
      "bg-[#1e1e1e] text-gray-200 border-[#333333] hover:border-[#8B5CF6] hover:text-white transition-colors",
    "ghost-violet": "bg-transparent text-gray-400 hover:text-[#8B5CF6] border-transparent",
    "primary-pink":
      "bg-[#EC4899] text-white border-[#EC4899] shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:bg-[#db2777] hover:shadow-[0_0_22px_rgba(236,72,153,0.5)] uppercase tracking-wider",
    "secondary-pink":
      "bg-[#1e1e1e] text-gray-200 border-[#333333] hover:border-[#EC4899] hover:text-white transition-colors",
    "ghost-pink": "bg-transparent text-gray-400 hover:text-[#EC4899] border-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base tracking-wider",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
