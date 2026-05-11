"use client";

import React from "react";

/**
 * Honeypot component to deter bots.
 * Renders a hidden field that human users won't see but bots will likely fill.
 */
export default function Honeypot({ name = "website_url" }: { name?: string }) {
  return (
    <div
      style={{
        display: "none",
        position: "absolute",
        left: "-5000px",
      }}
      aria-hidden="true"
    >
      <input
        type="text"
        name={name}
        tabIndex={-1}
        autoComplete="off"
        placeholder="Do not fill this if you are human"
      />
    </div>
  );
}

/**
 * Helper to check if a honeypot field was filled in a form action.
 */
export function checkHoneypot(formData: FormData, name = "website_url"): boolean {
  const value = formData.get(name);
  return !!value; // If it has a value, it's likely a bot
}
