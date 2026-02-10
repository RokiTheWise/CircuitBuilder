"use client";

import { MotionValue, motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility for Tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fontSize = 30;
const padding = 15;
const height = fontSize + padding;

function Number({ mv, number }: { mv: MotionValue<number>; number: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;

    let memo = offset * height;

    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}

function Digit({ place, value }: { place: number; value: number }) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div
      style={{ height }}
      className="relative w-[1ch] tabular-nums overflow-hidden"
    >
      {[...Array(10).keys()].map((i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

// --- MAIN COMPONENT ---
interface CounterProps {
  value: number;
  className?: string;
  prefix?: string; // e.g. "$"
  places?: number[]; // [100, 10, 1] for 3 digits
}

export default function Counter({
  value,
  className,
  prefix,
  places = [100, 10, 1], // Default to 3 digits
}: CounterProps) {
  return (
    <div
      style={{ fontSize }}
      className={cn("flex items-center leading-none tracking-tight", className)}
    >
      {prefix && <span>{prefix}</span>}
      <div className="flex overflow-hidden">
        {places.map((place) => (
          <Digit key={place} place={place} value={value} />
        ))}
      </div>
    </div>
  );
}
