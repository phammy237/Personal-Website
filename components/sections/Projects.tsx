"use client";
import { useEffect, useRef } from "react";
import { projects } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";

export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        container.scrollBy({ top: window.innerHeight, behavior: "smooth" });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        container.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
      }
    };
    container.addEventListener("keydown", handleKey);
    return () => container.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <section id="projects" className="relative">
      <div ref={containerRef} className="projects-container" tabIndex={0}>
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            total={projects.length}
          />
        ))}
      </div>
    </section>
  );
}
