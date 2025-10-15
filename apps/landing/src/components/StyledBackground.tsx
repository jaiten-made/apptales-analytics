"use client";
import React from "react";

/**
 * Lightweight background component. Uses inline styles so it doesn't
 * require Emotion or MUI to be present in the landing app build.
 * If a theme object is available via window.__theme or CSS variables,
 * the color can be adapted later.
 */
const StyledBackground: React.FC = () => {
  // Use Tailwind utility classes for positioning and sizing. The
  // radial background image itself is provided via a small inline
  // style because Tailwind doesn't provide granular radial-gradient
  // dot-grid helpers out of the box.
  const inlineStyle: React.CSSProperties = {
    backgroundImage:
      "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 bg-transparent"
      style={inlineStyle}
      aria-hidden="true"
    />
  );
};

export default StyledBackground;
