"use client";

export function PinLabel({
  title,
  subtitle,
  x,
  y,
  side,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  x: number;
  y: number;
  side: "left" | "right";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`absolute z-10 max-w-[160px] rounded-xl border bg-white/95 px-3 py-2 text-left shadow-md backdrop-blur transition-all duration-200 dark:bg-[#22264B]/95 ${
        active ? "border-accent/50 dark:border-accent/50" : "border-border hover:border-accent/40 dark:border-white/10"
      } ${active ? "" : "hidden md:block"}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: side === "right" ? "translate(18px, -50%)" : "translate(calc(-100% - 18px), -50%)",
      }}
    >
      <p className="font-body text-[13px] font-medium leading-snug text-surface dark:text-white">{title}</p>
      <p className="mt-0.5 font-mono text-[10px] leading-snug text-muted dark:text-white/45">{subtitle}</p>
    </button>
  );
}
