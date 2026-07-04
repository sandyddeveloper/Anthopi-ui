"use client";
import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
  speed?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
}

export const SparklesCore = ({
  id = "sparkles",
  background = "transparent",
  minSize = 0.4,
  maxSize = 1.2,
  particleDensity = 60,
  className,
  particleColor = "#FFFFFF",
  speed = 0.8,
}: SparklesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setContext(ctx);

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      initParticles(canvas.width, canvas.height);
    };

    const initParticles = (width: number, height: number) => {
      const count = Math.floor((width * height) / (100000 / particleDensity));
      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (maxSize - minSize) + minSize,
          speedX: (Math.random() - 0.5) * speed * 0.4,
          speedY: -(Math.random() * speed + 0.1),
          opacity: Math.random() * 0.5 + 0.1,
          fadeSpeed: Math.random() * 0.005 + 0.001,
        });
      }
      particlesRef.current = particles;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [maxSize, minSize, particleDensity, speed]);

  useEffect(() => {
    if (!context || !canvasRef.current) return;

    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Reset if offscreen or faded
        if (particle.y < 0 || particle.x < 0 || particle.x > canvas.width) {
          particle.x = Math.random() * canvas.width;
          particle.y = canvas.height;
          particle.opacity = 0;
        }

        // Pulse opacity
        if (particle.opacity < 0.8) {
          particle.opacity += particle.fadeSpeed;
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = particleColor;
        context.globalAlpha = particle.opacity;
        context.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [context, particleColor]);

  return (
    <canvas
      id={id}
      ref={canvasRef}
      style={{
        background: background,
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      className={cn("w-full h-full", className)}
    />
  );
};
