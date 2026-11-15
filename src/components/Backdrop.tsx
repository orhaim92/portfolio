"use client";

import { useEffect, useRef } from "react";

// Page background: a slow field of nodes that link up like an agent graph.
// The pointer acts as one more node. Nearby nodes connect to it and drift
// toward it, and a soft light follows it.

type P = { x: number; y: number; vx: number; vy: number; r: number };

const LINK = 150; // px: nodes closer than this are joined
const REACH = 220; // px: how far the pointer pulls and links

export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !glow) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue("--accent").trim() || "#5ee6c8";
    const accent2 = css.getPropertyValue("--accent-2").trim() || "#8b7cff";

    let w = 0;
    let h = 0;
    let nodes: P[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999, on: false };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Density scales with the screen, within limits, so phones stay smooth.
      const count = Math.max(24, Math.min(90, Math.round((w * h) / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1 + Math.random() * 1.6,
      }));
    }

    function frame() {
      ctx!.clearRect(0, 0, w, h);

      for (const p of nodes) {
        if (mouse.on) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < REACH && d > 1) {
            const pull = (1 - d / REACH) * 0.02;
            p.vx += (dx / d) * pull;
            p.vy += (dy / d) * pull;
          }
        }
        // Light friction keeps speeds bounded after a pull.
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx!.globalAlpha = (1 - d / LINK) * 0.22;
            ctx!.strokeStyle = accent2;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
        if (mouse.on) {
          const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (d < REACH) {
            ctx!.globalAlpha = (1 - d / REACH) * 0.7;
            ctx!.strokeStyle = accent;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
          }
        }
      }

      for (const p of nodes) {
        const near = mouse.on ? Math.max(0, 1 - Math.hypot(p.x - mouse.x, p.y - mouse.y) / REACH) : 0;
        ctx!.globalAlpha = 0.35 + near * 0.65;
        ctx!.fillStyle = near > 0.05 ? accent : accent2;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r + near * 1.8, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      if (!still) raf = requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.on = true;
      glow!.style.opacity = "1";
      glow!.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
      if (still) frame();
    }
    function onLeave() {
      mouse.on = false;
      glow!.style.opacity = "0";
    }
    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !still) raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="backdrop" />
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full opacity-0 transition-opacity duration-500"
        style={{ background: "radial-gradient(closest-side, rgb(94 230 200 / 0.13), rgb(139 124 255 / 0.07) 45%, transparent 70%)" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
