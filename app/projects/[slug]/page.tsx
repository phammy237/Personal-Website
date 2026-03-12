import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetailClient } from "./ProjectDetailClient";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function ProjectDetail({
  params,
}: {
  params: { slug: string };
}) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const currentIndex = projects.findIndex((p) => p.slug === params.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <main className="bg-base">
      <Navbar />
      <ProjectDetailClient project={project} nextProject={nextProject} />
      <Footer />
    </main>
  );
}
