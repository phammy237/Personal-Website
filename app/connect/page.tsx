"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const options = [
  {
    emoji: "☕",
    title: "Coffee Chat",
    desc: "Wanna swap stories, talk careers, or just vibe over coffee? I'm always down.",
    subject: "Coffee Chat with My",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B20, #F59E0B05)",
  },
  {
    emoji: "🏈",
    title: "Go to a Game",
    desc: "UF football, basketball, you name it. Swamp season is always better with company.",
    subject: "Let's Go to a Game!",
    color: "#F97316",
    gradient: "linear-gradient(135deg, #F9731620, #F9731605)",
  },
  {
    emoji: "🚶",
    title: "Go on a Walk",
    desc: "Sometimes the best convos happen while moving. Around campus, the trails, wherever.",
    subject: "Let's Go on a Walk",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B98120, #10B98105)",
  },
  {
    emoji: "📋",
    title: "Case Study Together",
    desc: "Prepping for consulting recruiting? I'm always up for casing with driven people.",
    subject: "Case Study Session with My",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F620, #3B82F605)",
  },
  {
    emoji: "🍜",
    title: "Grab Food",
    desc: "Good food, good conversation. Always yes to trying somewhere new in Gainesville.",
    subject: "Let's Grab Food!",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC489920, #EC489905)",
  },
  {
    emoji: "💡",
    title: "Talk Product / Strategy",
    desc: "Working on something interesting? Want a fresh perspective? Let's think through it together.",
    subject: "Product / Strategy Chat with My",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF620, #8B5CF605)",
  },
  {
    emoji: "🌐",
    title: "Just Network",
    desc: "Recruiter, founder, student — if you want to connect professionally, my door's always open.",
    subject: "Let's Connect — My Pham",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #6366F120, #6366F105)",
  },
  {
    emoji: "🎵",
    title: "Something Else",
    desc: "Have something else in mind? Concert, project collab, random idea? Just shoot your shot.",
    subject: "Hey My!",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E920, #0EA5E905)",
  },
];

export default function ConnectPage() {
  const email = "phamlehamy2307@gmail.com";
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const selectedOpt = options.find((o) => o.title === selected);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOpt) return;
    const subject = encodeURIComponent(selectedOpt.subject);
    const body = encodeURIComponent(`Hi My,\n\nI'm ${name || "reaching out"}.\n\n${message}\n\nLooking forward to connecting!`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <main className="min-h-screen bg-base dark:bg-[#0A0C1E]">
      <Navbar />

      <div className="px-[5vw] pt-28 pb-24 max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.p className="font-mono text-xs text-muted dark:text-white/40 tracking-widest uppercase mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Let&apos;s hang
        </motion.p>
        <motion.h1 className="font-display text-5xl md:text-7xl text-surface dark:text-white mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          Connect
        </motion.h1>
        <motion.p className="font-body text-lg text-muted dark:text-white/50 max-w-lg mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          I genuinely love meeting people. Pick what sounds good and I&apos;ll make it happen.
        </motion.p>

        {/* Options grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {options.map((opt, i) => (
            <motion.button
              key={opt.title}
              onClick={() => {
                setSelected(opt.title === selected ? null : opt.title);
                setSent(false);
              }}
              className={`group block text-left rounded-2xl border p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                selected === opt.title
                  ? "border-accent/60 shadow-lg shadow-accent/10"
                  : "border-border dark:border-white/10 hover:border-accent/40 hover:shadow-accent/5"
              }`}
              style={{ background: opt.gradient }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05, type: "spring", stiffness: 120, damping: 20 }}
            >
              <h3 className="font-display text-xl text-surface dark:text-white mb-2 group-hover:text-accent transition-colors duration-200">
                {opt.title}
              </h3>
              <p className="font-body text-sm text-muted dark:text-white/50 leading-relaxed mb-4">{opt.desc}</p>
              <span className={`font-mono text-xs text-accent transition-opacity duration-200 ${selected === opt.title ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                {selected === opt.title ? "Selected ✓" : "Select →"}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Inline form */}
        {selected && (
          <motion.div
            className="mt-10 bg-card dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-5">
              {selected}
            </p>
            <form onSubmit={handleSend} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 font-mono text-sm bg-base dark:bg-white/5 border border-border dark:border-white/10 rounded-xl px-4 py-3 text-surface dark:text-white placeholder:text-muted/60 dark:placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <textarea
                placeholder={`Tell me a bit about what you have in mind...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="font-mono text-sm bg-base dark:bg-white/5 border border-border dark:border-white/10 rounded-xl px-4 py-3 text-surface dark:text-white placeholder:text-muted/60 dark:placeholder:text-white/20 focus:outline-none focus:border-accent/50 transition-colors resize-none"
              />
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="font-mono text-sm px-6 py-3 bg-accent text-white hover:bg-accent/90 transition-colors duration-200 rounded-xl"
                >
                  {sent ? "Opening email… ✓" : "Send to My →"}
                </button>
                <p className="font-mono text-xs text-muted dark:text-white/30">
                  Opens your email client with a pre-filled message.
                </p>
              </div>
            </form>
          </motion.div>
        )}

        {/* Direct contact */}
        <motion.div
          className="mt-16 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-border dark:border-white/10 pt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="font-body text-muted dark:text-white/40">Or just reach out directly:</p>
          <div className="flex flex-wrap gap-4">
            <a href={`mailto:${email}`} className="font-mono text-sm text-accent hover:underline">{email}</a>
            <span className="text-border dark:text-white/10">·</span>
            <a href="https://linkedin.com/in/mypham237" target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-accent hover:underline">LinkedIn ↗</a>
            <span className="text-border dark:text-white/10">·</span>
            <a href="https://www.instagram.com/whyy.pmyy_/" target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-accent hover:underline">Instagram ↗</a>
            <span className="text-border dark:text-white/10">·</span>
            <a href="https://www.facebook.com/pmyy237/" target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-accent hover:underline">Facebook ↗</a>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
