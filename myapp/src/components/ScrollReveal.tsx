import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "scale";
}

export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const hiddenState = {
    up: "opacity-0 translate-y-8",
    left: "opacity-0 -translate-x-10",
    right: "opacity-0 translate-x-10",
    scale: "opacity-0 translate-y-4 scale-[0.96]",
  }[variant];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0 translate-x-0 scale-100" : hiddenState
      } ${className}`}
    >
      {children}
    </div>
  );
};
