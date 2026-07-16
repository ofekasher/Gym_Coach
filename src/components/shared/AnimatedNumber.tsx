"use client";
import { useEffect, useState } from "react";

export function AnimatedNumber({ value, duration = 1000, prefix = "", suffix = "" }: { value: number; duration?: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0, startTs = 0;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      setDisplay(Math.floor(p * value));
      if (p < 1) raf = requestAnimationFrame(step);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  // dir="ltr" + isolate keeps prefix/suffix glued to the digits in the correct order
  // inside RTL layouts — without it, neutral characters like "%" can get reordered
  // to the wrong side by the browser's bidi algorithm.
  return (
    <span dir="ltr" style={{ unicodeBidi: "isolate", fontVariantNumeric: "tabular-nums" }}>
      {prefix}{display.toLocaleString("he-IL")}{suffix}
    </span>
  );
}
