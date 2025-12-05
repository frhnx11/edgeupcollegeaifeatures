"use client";

import { useEffect, useState } from "react";

interface SpeechBubbleProps {
  text: string;
  visible: boolean;
  onHide?: () => void;
  positionX?: number;
  positionY?: number;
}

export default function SpeechBubble({ text, visible, onHide, positionX = 32, positionY = 33 }: SpeechBubbleProps) {
  const [animationState, setAnimationState] = useState<"hidden" | "entering" | "visible" | "exiting">("hidden");

  useEffect(() => {
    if (visible) {
      // Start entering animation
      setAnimationState("entering");

      // After enter animation completes, set to visible
      const enterTimer = setTimeout(() => {
        setAnimationState("visible");
      }, 300);

      return () => {
        clearTimeout(enterTimer);
      };
    } else if (animationState === "visible" || animationState === "entering") {
      // Start exit animation when visible becomes false
      setAnimationState("exiting");

      const exitTimer = setTimeout(() => {
        setAnimationState("hidden");
        onHide?.();
      }, 300);

      return () => {
        clearTimeout(exitTimer);
      };
    }
  }, [visible]);

  if (animationState === "hidden") return null;

  const getAnimationClasses = () => {
    switch (animationState) {
      case "entering":
        return "opacity-0 scale-95 translate-x-4";
      case "visible":
        return "opacity-100 scale-100 translate-x-0";
      case "exiting":
        return "opacity-0 scale-95 translate-x-4";
      default:
        return "opacity-0";
    }
  };

  return (
    <div
      className={`
        absolute z-50
        max-w-md
        transition-all duration-300 ease-out
        ${getAnimationClasses()}
      `}
      style={{
        right: `${positionX}px`,
        top: `${positionY}%`,
      }}
    >
      {/* Speech bubble */}
      <div
        className="relative px-8 py-6 rounded-2xl shadow-xl"
        style={{ backgroundColor: "#1E90FF" }}
      >
        {/* Text */}
        <p className="text-white text-xl font-medium leading-relaxed">
          {text}
        </p>

        {/* Triangle pointer at bottom left pointing bottom left */}
        <div
          className="absolute left-6 bottom-0 translate-y-full"
          style={{
            width: 0,
            height: 0,
            borderLeft: "25px solid #1E90FF",
            borderBottom: "25px solid transparent",
          }}
        />
      </div>
    </div>
  );
}
