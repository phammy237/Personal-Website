"use client";

import type { ReactNode } from "react";
import styles from "./browse.module.css";

export function FilterChip({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: ReactNode;
}) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={styles.filter}>{children}</button>;
}
