"use client";
import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as any)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen px-4 py-6 hidden md:flex flex-col bg-neutral-950 border-r border-neutral-900 w-[260px] flex-shrink-0 relative z-30",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "78px") : "260px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children as React.ReactNode}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-950 border-b border-neutral-900 w-full relative z-30"
      )}
      {...props}
    >
      <div className="flex justify-between items-center w-full">
        <Link href="/" className="font-bold text-sm tracking-widest text-zinc-100 flex items-center gap-2">
          <div className="h-5 w-5 rounded-lg bg-gradient-to-tr from-accent-blue to-accent-purple" />
          <span>ANTHOPI</span>
        </Link>
        <button
          className="p-1 rounded-lg border border-neutral-800 bg-neutral-900 text-zinc-400 hover:text-zinc-200"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-neutral-950 p-10 flex flex-col justify-between z-[100]",
              className
            )}
          >
            <div
              className="absolute right-10 top-5 z-50 text-neutral-500 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <X className="h-6 w-6 text-zinc-400" />
            </div>
            {children as React.ReactNode}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon: React.JSX.Element | React.ReactNode;
  };
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export const SidebarLink = ({
  link,
  className,
  onClick,
  active,
}: SidebarLinkProps) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-start gap-4 group/sidebar py-2 px-3 rounded-lg transition-all duration-200 mb-1",
        active 
          ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/20" 
          : "text-zinc-400 hover:text-zinc-200 hover:bg-neutral-900/60 border border-transparent",
        className
      )}
    >
      <div className={cn("flex-shrink-0 transition-transform duration-200 group-hover/sidebar:scale-105", active && "text-accent-purple")}>
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-200",
          active ? "text-zinc-100 font-semibold" : "group-hover/sidebar:text-zinc-200"
        )}
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
