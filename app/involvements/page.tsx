"use client";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const involvements = [
  {
    role: "External Vice President",
    org: "UF Data Science & Informatics Club",
    period: "Apr 2025 — Present",
    type: "Leadership",
    color: "#8B5CF6",
    description: "Led the largest data science organization at UF.",
    bullets: [
      "Drove outreach with AIIRI, Google, Microsoft, Deloitte, and startups; negotiated funding and launched student projects.",
      "Hosted 5+ research and industry tours, connecting 350+ members with labs, startups, and industry professionals, leading to 8+ winning hackathon teams.",
      "Directed marketing and outreach growing internal engagement by 300% and boosting student–employer engagement by 600%.",
      "Earned Student Org of the Year and Career Influencer Award.",
      "Initiated partnership with UF Career Connections Center to host career-readiness workshops.",
    ],
    awards: ["Student Org of the Year", "Career Influencer Award"],
  },
  {
    role: "Vice President",
    org: "AI Security & Risk Association",
    period: "2025 — Present",
    type: "Leadership",
    color: "#3B82F6",
    description: "Leading AI security and risk discussions at UF.",
    bullets: [
      "Leading organization focused on AI safety, security, and ethical risk management.",
      "Organizing events and workshops on responsible AI development.",
    ],
    awards: [],
  },
  {
    role: "Fellow",
    org: "Product Space",
    period: "2026 — Present",
    type: "Professional",
    color: "#0EA5E9",
    description: "Selected fellow working on real product strategy challenges.",
    bullets: [
      "Working as a product strategy fellow on live client projects (Lattéra, Gator Creek LLC).",
      "Designing MVP pilot measurement systems and go-to-market strategies.",
    ],
    awards: [],
  },
  {
    role: "Treasurer",
    org: "Vietnam International Student Association",
    period: "Aug 2024 — Present",
    type: "Leadership",
    color: "#EF4444",
    description: "Managing finances and cultural programming for VISA.",
    bullets: [
      "Manage $10,000+ annual budget and secure $5,000+ in sponsorships.",
      "Lead planning and execution of large-scale Tết Festivals (300+ attendees).",
      "Oversee logistics and resource allocation for cross-functional initiatives.",
    ],
    awards: [],
  },
  {
    role: "Mentor",
    org: "Society of Asian Scientists and Engineers (SASE)",
    period: "2025 — Present",
    type: "Mentorship",
    color: "#F59E0B",
    description: "Mentoring underclassmen in career and academic development.",
    bullets: [
      "Providing career guidance and mentorship to underclassmen.",
      "Supporting students with internship applications, interview prep, and networking.",
    ],
    awards: [],
  },
  {
    role: "Mentor",
    org: "GatorAI",
    period: "2025 — Present",
    type: "Mentorship",
    color: "#8B5CF6",
    description: "Mentoring students in AI/ML projects and careers.",
    bullets: [
      "Guiding students through AI/ML project development.",
      "Sharing insights from industry experience and research.",
    ],
    awards: [],
  },
  {
    role: "Member",
    org: "Gator Student Consulting Organization",
    period: "2025 — Present",
    type: "Professional",
    color: "#059669",
    description: "Consulting on real business problems for local organizations.",
    bullets: [
      "Engaging in consulting case work and professional development.",
      "Working with local businesses and nonprofits on strategic challenges.",
    ],
    awards: [],
  },
  {
    role: "Fundraising Committee Intern",
    org: "Student Organization",
    period: "2025",
    type: "Professional",
    color: "#6366F1",
    description: "Supporting fundraising efforts and sponsor outreach.",
    bullets: [
      "Assisted with fundraising strategy and sponsor outreach.",
      "Contributed to event planning and execution.",
    ],
    awards: [],
  },
];

const typeColors: Record<string, string> = {
  Leadership: "bg-purple-100 text-purple-800 border-purple-300",
  Professional: "bg-blue-100 text-blue-800 border-blue-300",
  Mentorship: "bg-amber-100 text-amber-800 border-amber-300",
};

export default function InvolvementsPage() {
  return (
    <main className="min-h-screen bg-base">
      <Navbar />

      {/* Page header */}
      <div className="px-[5vw] pt-28 pb-10 max-w-[1400px] mx-auto">
        <motion.p
          className="font-mono text-xs text-muted tracking-widest uppercase mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Community & Leadership
        </motion.p>
        <motion.h1
          className="font-display text-5xl md:text-7xl text-surface mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Involvements
        </motion.h1>
        <motion.p
          className="font-body text-lg text-muted max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Organizations I lead, contribute to, and learn from.
        </motion.p>
      </div>

      {/* Stats banner */}
      <div className="px-[5vw] pb-10 max-w-[1400px] mx-auto">
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { value: "350+", label: "Members Connected" },
            { value: "8+", label: "Winning Hack Teams" },
            { value: "300%", label: "Engagement Growth" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-5 text-center"
            >
              <p className="font-display text-3xl text-accent mb-1">{stat.value}</p>
              <p className="font-mono text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Involvements grid */}
      <div className="px-[5vw] pb-24 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {involvements.map((inv, i) => (
            <motion.div
              key={`${inv.role}-${inv.org}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 2) * 0.08, type: "spring", stiffness: 120, damping: 20 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Colored top bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: inv.color }} />

              {/* Photo placeholder */}
              <div
                className="h-32 relative flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${inv.color}20, ${inv.color}08)`,
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display text-white"
                  style={{ backgroundColor: inv.color }}
                >
                  {inv.org.charAt(0)}
                </div>
                <div className="absolute bottom-3 right-3">
                  <span
                    className={`font-mono text-xs px-2.5 py-1 rounded-full border ${typeColors[inv.type] ?? typeColors["Professional"]}`}
                  >
                    {inv.type}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <h3 className="font-body font-semibold text-surface">{inv.role}</h3>
                    <p className="font-mono text-xs text-muted mt-0.5">{inv.org}</p>
                  </div>
                  <span className="font-mono text-xs text-muted whitespace-nowrap">{inv.period}</span>
                </div>

                <p className="font-body text-sm text-muted leading-relaxed mb-4 mt-3">
                  {inv.description}
                </p>

                <ul className="space-y-1.5">
                  {inv.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2">
                      <span className="text-accent mt-1 flex-shrink-0 text-xs">▸</span>
                      <span className="font-body text-xs text-muted leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>

                {inv.awards.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border">
                    {inv.awards.map((award) => (
                      <span
                        key={award}
                        className="font-mono text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
                      >
                        🏆 {award}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
