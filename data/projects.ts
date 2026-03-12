export type Project = {
  slug: string;
  title: string;
  category:
    | "AI/ML"
    | "Data & Analytics"
    | "Product/UX"
    | "Engineering"
    | "Hackathon"
    | "Case Competition"
    | "Math & Modeling";
  year: string;
  month: string;
  logline: string;
  description: string;
  bullets: string[];
  tools: string[];
  github?: string;
  devpost?: string;
  liveUrl?: string;
  slides?: string;
  video?: string;
  image?: string;      // drop file in public/projects/<slug>.jpg
  gradient: string;
  prize?: boolean;
  competition?: string;
  award?: string;
};

export const projects: Project[] = [
  {
    slug: "cartcoach",
    title: "CartCoach",
    category: "AI/ML",
    year: "2026",
    month: "March 2026",
    logline: "AI-Powered Chrome Extension for Smarter Spending Decisions",
    description: "A Chrome extension designed to reduce impulse spending by surfacing real-time budget impact, savings-goal delay, and lower-cost alternatives at the point of purchase.",
    bullets: [
      "Contributed to backend and product logic using FastAPI, MongoDB, and Gemini API.",
      "Supported personalized financial recommendations, user behavior tracking, and dashboard insights.",
    ],
    tools: ["FastAPI", "MongoDB", "Gemini API", "Chrome Extension", "Python"],
    gradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
  },
  {
    slug: "kite",
    title: "Kite",
    category: "Product/UX",
    year: "2026",
    month: "Feb 2026",
    logline: "Gamified Pediatric Stealth Assessment Platform",
    description: "A gamified pediatric health app architecting measurement systems capturing 1,000+ interaction data points per session across cognitive, motor, and behavioral signals.",
    bullets: [
      "Led market research and product strategy, enabling longitudinal tracking of patient trends.",
      "Designed event-driven analytics and reporting translating gameplay telemetry into clinician-ready insights.",
      "Automated flagging logic reducing manual observation effort by ~70%.",
    ],
    tools: ["Figma", "Analytics", "Mobile", "Product Strategy"],
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)",
  },
  {
    slug: "wnba-simulator",
    title: "WNBA Strategy Simulator",
    category: "Data & Analytics",
    year: "2026",
    month: "Jan 2026",
    logline: "Franchise decision simulation integrating player records, salary cap, and fan demand modeling.",
    description: "Led development of WNBA team decision simulation integrating 44+ player records, salary cap, and fan demand modeling to support roster, pricing, and capital allocation decisions.",
    bullets: [
      "Evaluated 4 strategic scenarios and projected $56M–$79M season profit range.",
      "Designed 200-trial Monte Carlo risk analysis and multi-KPI dashboards.",
      "Confirmed 0% simulated bankruptcy risk under baseline and macro conditions.",
    ],
    tools: ["Python", "Monte Carlo Simulation", "Excel", "Data Modeling"],
    gradient: "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)",
  },
  {
    slug: "housing-model",
    title: "Housing Affordability Model",
    category: "Data & Analytics",
    year: "2025",
    month: "Dec 2025",
    logline: "Gamified interactive tool for housing price prediction and investment decisions.",
    description: "Designed and cleaned a 20,000+ record housing dataset, implementing least-squares multiple linear regression (R² ≈ 0.75) to identify and quantify key price drivers.",
    bullets: [
      "Implemented least-squares multiple linear regression achieving R² ≈ 0.75.",
      "Developed Streamlit-based interactive decision tool with real-time price prediction.",
      "Included budget feasibility analysis, cost breakdowns, and optimization scenarios.",
    ],
    tools: ["Python", "Streamlit", "scikit-learn", "pandas", "R"],
    gradient: "linear-gradient(135deg, #059669 0%, #3B82F6 100%)",
  },
  {
    slug: "tiktok-redesign",
    title: "TikTok Save Redesign",
    category: "Product/UX",
    year: "2025",
    month: "Oct 2025",
    logline: "AI-Driven Save Experience Redesign boosting engagement by 20%.",
    description: "Led a solo project to redesign TikTok's 'Save' feature, introducing AI-driven suggestions and improving content organization.",
    bullets: [
      "Analyzed user feedback from 500+ respondents identifying key pain points.",
      "Designed AI-driven suggestion system boosting user engagement by 20%.",
      "Improved content organization by 15% through UX improvements.",
    ],
    tools: ["Figma", "User Research", "Prototyping", "AI UX"],
    gradient: "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
  },
  {
    slug: "wandr",
    title: "Wandr",
    category: "Product/UX",
    year: "2025",
    month: "Oct 2025",
    logline: "Connecting People through Personalized Travel and Experiences.",
    description: "Led the design of user flows, MVP roadmap, and ID & selfie verification system for a travel app connecting like-minded travelers.",
    bullets: [
      "Designed ID & selfie verification system increasing user safety by 30%.",
      "Implemented personalized recommendations and group activities boosting engagement by 20%.",
      "Collaborated with a team of 3 to drive app development.",
    ],
    tools: ["Figma", "Product Strategy", "UX Research", "MVP Planning"],
    gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
  },
  {
    slug: "vyspar",
    title: "Vyspar",
    category: "Engineering",
    year: "2025",
    month: "Sep 2025",
    logline: "Collaborative Platform for Healthcare Professionals. LinkedIn for healthcare.",
    description: "Collaborated with a 5-person team to build a professional networking platform for healthcare, leading backend development and data infrastructure.",
    bullets: [
      "Led backend development for 10+ RESTful APIs.",
      "Migrated 50K+ records and integrated 3 external healthcare data sources.",
      "Developed enterprise Tableau dashboard tracking 1,200+ member activities and 20+ key analytics.",
    ],
    tools: ["Node.js", "REST APIs", "PostgreSQL", "Tableau", "Healthcare Data"],
    gradient: "linear-gradient(135deg, #0F766E 0%, #3B82F6 100%)",
  },
  {
    slug: "smartprep-ai",
    title: "SmartPrep AI",
    category: "AI/ML",
    year: "2025",
    month: "Sep 2025",
    logline: "Computer vision app detecting ingredients to auto-generate meal plans.",
    description: "Built a mobile app using computer vision to detect and classify ingredients from photos, auto-generating meal plans and grocery lists tailored to user preferences.",
    bullets: [
      "Used computer vision to detect and classify ingredients from photos.",
      "Auto-generated personalized meal plans and grocery lists.",
      "Integrated sustainability features to reduce food waste.",
    ],
    tools: ["Python", "Computer Vision", "Mobile", "AI", "UX"],
    gradient: "linear-gradient(135deg, #16A34A 0%, #84CC16 100%)",
  },
  {
    slug: "biaslens",
    title: "BiasLens",
    category: "AI/ML",
    year: "2025",
    month: "Apr 2025",
    logline: "Detecting Algorithmic Bias in Real-World Datasets.",
    description: "Built a Streamlit app to audit algorithmic bias in real-world datasets (~10,000+ records), applying metrics like Demographic Parity and Equal Opportunity.",
    bullets: [
      "Applied Demographic Parity, Equal Opportunity, and other fairness metrics.",
      "Tested mitigation strategies (reweighing, threshold adjustments).",
      "Improved fairness outcomes by ~20% and enhanced decision-making reliability.",
    ],
    tools: ["Python", "Streamlit", "Fairlearn", "scikit-learn", "Data Ethics"],
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
  },
  {
    slug: "gatorbot",
    title: "GatorBot",
    category: "AI/ML",
    year: "2025",
    month: "Apr 2025",
    logline: "AI chatbot centralizing campus support services at UF",
    description: "Built GatorBot, an AI chatbot using Python and NLP to centralize student support services at the University of Florida.",
    bullets: [
      "Cut referral time by ~70% and addressed 60%+ awareness gaps.",
      "Architecture projected to reduce workload by 40% and save ~$50,000+ annually.",
    ],
    tools: ["Python", "NLP", "Chatbot", "AI"],
    gradient: "linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)",
  },
  {
    slug: "savills-analysis",
    title: "Savills CRE Analysis",
    category: "Data & Analytics",
    year: "2025",
    month: "Mar 2025",
    logline: "ASA DataFest. Advanced analysis of 100,000+ U.S. commercial leasing transactions.",
    description: "Worked with a team of 4 to conduct advanced data analysis on 100,000+ U.S. leasing transactions (2018-2024) using Python and pandas.",
    bullets: [
      "Identified trends in office space demand across tech, legal, and financial sectors.",
      "Translated complex datasets into business insights for 10+ major cities.",
      "Delivered market entry, relocation, and expansion strategy recommendations.",
    ],
    tools: ["Python", "pandas", "Data Visualization", "Statistical Analysis"],
    gradient: "linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)",
  },
  {
    slug: "artificial-reef",
    title: "Artificial Reef Web App",
    category: "Engineering",
    year: "2024",
    month: "Nov 2024",
    logline: "Full-stack web app visualizing 3D reef models for ecological data accessibility.",
    description: "Collaborated on a 5-person team to develop a full-stack web app visualizing 3D reef models, increasing ecological data accessibility for ~5,000+ Louisiana CCA users.",
    bullets: [
      "Designed and implemented a MongoDB schema with Mongoose models, improving query performance by ~30%.",
      "Implemented data validation, indexing, and relationship optimization.",
      "Increased ecological data accessibility for ~5,000+ Louisiana CCA users.",
    ],
    tools: ["MongoDB", "Mongoose", "React", "Node.js", "3D Visualization"],
    gradient: "linear-gradient(135deg, #0F766E 0%, #0EA5E9 100%)",
  },
];

export const competitions: Project[] = [
  {
    slug: "sase-hacks",
    title: "SASE Hacks 2026",
    category: "Hackathon",
    year: "2026",
    month: "Feb 2026",
    logline: "Best Finance Project — Society of Asian Scientists and Engineers Hackathon",
    description: "Built a finance-focused hackathon project at SASE Hacks 2026, winning Best Finance Project.",
    bullets: [
      "Developed a data-driven finance tool addressing real student financial challenges.",
      "Competed against teams across STEM disciplines.",
    ],
    tools: ["Python", "Data Analysis", "Finance"],
    award: "Best Finance Project",
    competition: "SASE Hacks 2026",
    prize: true,
    gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
  },
  {
    slug: "code4change",
    title: "Code4Change",
    category: "Hackathon",
    year: "2025",
    month: "Apr 2025",
    logline: "3rd Place Overall — Technology for social good hackathon",
    description: "Built a tech-for-good solution at Code4Change, placing 3rd overall.",
    bullets: [
      "Designed and built a social impact product addressing community needs.",
      "Placed 3rd overall across all competing teams.",
    ],
    tools: ["Engineering", "Social Impact"],
    award: "3rd Place Overall",
    competition: "Code4Change",
    prize: true,
    gradient: "linear-gradient(135deg, #059669 0%, #3B82F6 100%)",
  },
  {
    slug: "mckinsey-case",
    title: "McKinsey Case Competition",
    category: "Case Competition",
    year: "2025",
    month: "Oct 2025",
    logline: "Top 20 nationally — Strategy consulting case competition",
    description: "Competed in McKinsey's case competition, finishing Top 20 out of hundreds of university teams.",
    bullets: [
      "Applied structured problem-solving and consulting frameworks to a live business case.",
      "Delivered recommendations to a panel of McKinsey consultants.",
      "Finished Top 20 nationally.",
    ],
    tools: ["Strategy", "Consulting", "Case Analysis", "Presentation"],
    award: "Top 20",
    competition: "McKinsey Case Competition",
    prize: true,
    gradient: "linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%)",
  },
  {
    slug: "scudem",
    title: "SCUDEM X 2025",
    category: "Math & Modeling",
    year: "2025",
    month: "Nov 2025",
    logline: "Outstanding Award — International mathematical modeling competition",
    description: "Received the Outstanding Award at SCUDEM X 2025 for mathematical modeling work.",
    bullets: [
      "Built and validated a differential equations model for a real-world problem.",
      "Received Outstanding Award recognition from judges.",
    ],
    tools: ["MATLAB", "Python", "Math Modeling", "Differential Equations"],
    award: "Outstanding Award",
    competition: "SCUDEM X 2025",
    prize: true,
    gradient: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
  },
  {
    slug: "gatorbot-deloitte",
    title: "GatorBot — Deloitte Challenge",
    category: "Case Competition",
    year: "2025",
    month: "Apr 2025",
    logline: "AI chatbot for campus support — Deloitte Innovation Challenge",
    description: "Presented GatorBot, an AI chatbot centralizing student support services at UF, at the Deloitte Innovation Challenge.",
    bullets: [
      "Pitched product vision, technical architecture, and projected impact to Deloitte judges.",
      "Demonstrated 70% reduction in student referral time through chatbot automation.",
    ],
    tools: ["Python", "NLP", "Chatbot", "Product Strategy", "Presentation"],
    competition: "Deloitte Innovation Challenge",
    gradient: "linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)",
  },
  {
    slug: "uaa-case",
    title: "UAA Case Competition",
    category: "Case Competition",
    year: "2025",
    month: "Mar 2025",
    logline: "University Athletic Association business case competition",
    description: "Competed in the UAA Case Competition solving a real business strategy challenge.",
    bullets: [
      "Analyzed business problem and developed strategic recommendations.",
      "Presented findings to a panel of judges.",
    ],
    tools: ["Strategy", "Consulting", "Case Analysis"],
    competition: "2025 UAA Case Competition",
    gradient: "linear-gradient(135deg, #F97316 0%, #EF4444 100%)",
  },
  {
    slug: "bloomberg-bpuzzled",
    title: "Bloomberg Bpuzzled",
    category: "Case Competition",
    year: "2025",
    month: "2025",
    logline: "Bloomberg's competitive analytical puzzle challenge",
    description: "Participated in Bloomberg's Bpuzzled, a competitive analytical and finance puzzle challenge.",
    bullets: [
      "Solved complex analytical puzzles under time pressure.",
      "Applied quantitative reasoning and financial concepts.",
    ],
    tools: ["Finance", "Analytics", "Quantitative Reasoning"],
    competition: "Bloomberg Bpuzzled",
    gradient: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
  },
  {
    slug: "comap-mcm",
    title: "COMAP MCM",
    category: "Math & Modeling",
    year: "2025",
    month: "Feb 2025",
    logline: "International mathematical modeling contest",
    description: "Participated in the COMAP Mathematical/Interdisciplinary Contest in Modeling, an international competition.",
    bullets: [
      "Built a mathematical model addressing a real-world problem over 96 hours.",
      "Wrote a full technical report presenting findings and sensitivity analysis.",
    ],
    tools: ["Python", "R", "Math Modeling", "LaTeX"],
    competition: "COMAP MCM",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
  },
  {
    slug: "asa-datafest",
    title: "ASA DataFest",
    category: "Hackathon",
    year: "2025",
    month: "Mar 2025",
    logline: "Advanced analysis of 100,000+ U.S. commercial leasing transactions",
    description: "Worked with a team of 4 to conduct advanced data analysis on 100,000+ U.S. leasing transactions (2018-2024) for Savills.",
    bullets: [
      "Identified trends in office space demand across tech, legal, and financial sectors.",
      "Translated complex datasets into business insights for 10+ major cities.",
      "Delivered market entry, relocation, and expansion strategy recommendations.",
    ],
    tools: ["Python", "pandas", "Data Visualization", "Statistical Analysis"],
    competition: "ASA DataFest",
    gradient: "linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)",
  },
];

export const allWork: Project[] = [...projects, ...competitions];

export type CaseStudy = {
  slug: string;
  title: string;
  competition: string;
  category: "Hackathon" | "Case Competition" | "Math & Modeling" | "Data Science" | "Finance";
  award: string;
  year: string;
  description: string;
  tags: string[];
  gradient: string;
  slides?: string;
  image?: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "gatorbot-deloitte",
    title: "GatorBot",
    competition: "Deloitte Innovation Challenge",
    category: "Hackathon",
    award: "Winner",
    year: "2025",
    description: "AI chatbot solution for centralized campus support, reducing referral time by ~70%.",
    tags: ["AI/ML", "Product", "Social Impact"],
    gradient: "linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)",
  },
  {
    slug: "sase-hacks",
    title: "SASE Hacks Finance",
    competition: "SASE Hacks 2026",
    category: "Hackathon",
    award: "Best Finance Project",
    year: "2026",
    description: "Best Finance Project at the Society of Asian Scientists and Engineers Hackathon.",
    tags: ["Finance", "Data", "Hackathon"],
    gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
  },
  {
    slug: "code4change",
    title: "Code4Change",
    competition: "Code4Change",
    category: "Hackathon",
    award: "3rd Place Overall",
    year: "2025",
    description: "Technology for social good hackathon. 3rd place overall.",
    tags: ["Engineering", "Social Impact"],
    gradient: "linear-gradient(135deg, #059669 0%, #3B82F6 100%)",
  },
  {
    slug: "hacklytics",
    title: "Hacklytics 2026",
    competition: "Hacklytics 2026",
    category: "Hackathon",
    award: "Participant",
    year: "2026",
    description: "Data science hackathon hosted at Georgia Tech.",
    tags: ["Data Science", "Hackathon"],
    gradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
  },
  {
    slug: "mckinsey",
    title: "McKinsey Case Competition",
    competition: "McKinsey Case Competition",
    category: "Case Competition",
    award: "Top 20",
    year: "2025",
    description: "Strategy consulting case competition. Top 20 finish nationwide.",
    tags: ["Consulting", "Strategy"],
    gradient: "linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%)",
  },
  {
    slug: "uaa-case",
    title: "UAA Case Competition",
    competition: "2025 UAA Case Competition",
    category: "Case Competition",
    award: "Participant",
    year: "2025",
    description: "University Athletic Association business case competition.",
    tags: ["Strategy", "Consulting"],
    gradient: "linear-gradient(135deg, #F97316 0%, #EF4444 100%)",
  },
  {
    slug: "bloomberg",
    title: "Bloomberg Bpuzzled",
    competition: "Bloomberg Bpuzzled",
    category: "Finance",
    award: "Participant",
    year: "2025",
    description: "Bloomberg's competitive analytical puzzle challenge.",
    tags: ["Finance", "Analytics"],
    gradient: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
  },
  {
    slug: "scudem",
    title: "SCUDEM X 2025",
    competition: "SCUDEM X 2025",
    category: "Math & Modeling",
    award: "Outstanding Award",
    year: "2025",
    description: "Mathematical modeling competition. Outstanding Award.",
    tags: ["Math Modeling", "Research"],
    gradient: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
  },
  {
    slug: "comap-mcm",
    title: "COMAP MCM",
    competition: "COMAP Mathematical/Interdisciplinary Contest in Modeling",
    category: "Math & Modeling",
    award: "Participant",
    year: "2025",
    description: "International mathematical modeling competition.",
    tags: ["Math Modeling", "Research"],
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
  },
  {
    slug: "savills-datafest",
    title: "Savills CRE Analysis",
    competition: "ASA DataFest",
    category: "Data Science",
    award: "Participant",
    year: "2025",
    description: "Advanced data analysis on 100,000+ U.S. commercial leasing transactions.",
    tags: ["Data Analysis", "Real Estate"],
    gradient: "linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)",
  },
];
