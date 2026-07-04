"use client";
import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SynapseLogo = ({ className = "", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-14 w-14"
  };

  return (
    <img 
      src="/synapse_os_logo.png" 
      alt="Synapse OS Logo" 
      className={`${sizeClasses[size]} ${className} object-contain rounded-lg`}
    />
  );
};
