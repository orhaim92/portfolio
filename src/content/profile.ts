// Single source of truth for the page and for the agent system.
// Everything in this file is public. Never put private data here:
// the chat agents can quote any of it.

export const person = {
  name: "Or Haim Sabag",
  headline: "Engineering Leader & Senior Full Stack Engineer",
  tagline: "AI agents, cloud and DevOps, in a regulated industry",
  location: "Israel",
  linkedin: "https://www.linkedin.com/in/or-haim-sabag-7665a999/",
  dentai: "https://app.dentai.co.il",
  summary:
    "Engineering leader and senior full stack engineer with 12 years of building production software, the last 6 on highly regulated health data. I lead technology, design the architecture and stay hands-on.",
};

export const stats = [
  { value: "12", label: "years building production software" },
  { value: "8", label: "years leading teams and technology" },
  { value: "6", label: "years on regulated health data" },
];

export type Skill = { title: string; text: string; tech: string[] };

export const skills: Skill[] = [
  {
    title: "Production multi-agent AI",
    text: "Agent systems that do real work for real users, not demos.",
    tech: ["Claude", "Gemini", "AWS Bedrock", "Vertex AI", "LangGraph", "LangChain", "Python", "FastAPI", "Claude Code"],
  },
  {
    title: "Reliable, cost-efficient LLM output",
    text: "Answers you can trust, at a cost that makes sense.",
    tech: ["RAG", "Vector and hybrid search", "Prompt engineering", "Prompt caching", "Cost optimization"],
  },
  {
    title: "Full stack product development",
    text: "From the database to the last pixel, and into production.",
    tech: ["C#", ".NET 8", "TypeScript", "Node.js", "Angular", "React", "PostgreSQL", "MSSQL", "Oracle", "MongoDB", "Elasticsearch", "RabbitMQ"],
  },
  {
    title: "Cloud platforms run as code",
    text: "Infrastructure, CI/CD and production, all in version control.",
    tech: ["AWS EKS", "RDS", "Lambda", "S3", "Cognito", "Terraform", "Terragrunt", "Kubernetes", "Helm", "Argo CD", "Docker", "AWS CDK", "Jenkins", "Azure DevOps"],
  },
  {
    title: "Leadership in a regulated industry",
    text: "Strategy, architecture and people, under audit.",
    tech: ["Technology strategy", "Architecture ownership", "Mentoring", "Code review", "Customer audits"],
  },
];

export type Job = { company: string; role: string; period: string; note?: string; points: string[] };

export const jobs: Job[] = [
  {
    company: "Bioforum (BionData)",
    role: "Head of Technology",
    period: "Nov 2020 – 2026",
    note: "BionData is a subsidiary of Bioforum. Its JET cloud platform helps pharma companies get their clinical trial data ready for regulators, much faster than before. Joined as Senior Full Stack Developer.",
    points: [
      "Managed a team of 6 developers: planning, mentoring, code review and delivery from requirements to release.",
      "Led the company's technology end to end, including its AI adoption: architecture, delivery, cloud and production, and took part in management decisions on product direction.",
      "Delivered AI and platform features in a regulated clinical-data environment, with a full audit trail and regular customer audits.",
      "Built a multi-agent assistant: a supervisor routes each request to a documentation (RAG) agent or a data agent, which works with the customer's live data under the user's own permissions.",
      "Made AI dependable and cost-effective in production through output validation, targeted retries, prompt caching and usage tracking.",
      "Owned the core platform and stayed hands-on as a full stack developer (.NET, Angular, PostgreSQL).",
      "Ran the cloud infrastructure and CI/CD across all environments (AWS, Terraform, Terragrunt, Kubernetes, Helm, Argo CD, Jenkins, Azure DevOps).",
    ],
  },
  {
    company: "YIT (ynet)",
    role: "Team Leader",
    period: "2018 – Nov 2020",
    points: [
      "Led 6 developers on backend and frontend projects in React and .NET Web API (60-40 hands-on): code review, mentoring, task management.",
      "Delivered new products, including Ynet Nadlan, and group-wide systems for Ynet, Calcalist and Yedioth Ahronoth.",
    ],
  },
  {
    company: "Earlier roles",
    role: "Full Stack Developer",
    period: "2014 – 2018",
    points: [
      "Daka90, Full Stack Developer, 2015–2018: tourism web systems (ASP.NET MVC, C#, React, Oracle).",
      "ERG Solutions, .NET Developer, 2014–2015: financial systems on site at Manpower Israel.",
    ],
  },
  {
    company: "DentAI",
    role: "Co-Founder, side project",
    period: "2025 – Present, evenings",
    note: "A platform that connects dental imaging centers with dental clinics.",
    points: [
      "Co-founded it and build the product in my own time as a full stack engineer (Angular, AWS Lambda, PostgreSQL, AWS CDK, Python).",
      "Built several AI systems for dental imaging, hands-on, from idea to production.",
      "Among them: a system that generates a panoramic view from DICOM scans, and a system that recommends dental treatments from the patient's images.",
    ],
  },
];

export const education = [
  "Management Course, 2018",
  "John Bryce High Tech College, 2013–2014",
  "Netivey Noam, full matriculation, 2010",
  "Combat Collection Corps, full service, released as First Sergeant, 2011–2014",
];

export const languages = ["Hebrew", "English"];

export type Step = { title: string; text: string };

/** How Or takes work from a need to production. */
export const process: Step[] = [
  {
    title: "Understand the need",
    text: "I start with the problem, not the ticket. I talk to the people who will use it, agree on what success looks like, and cut what does not serve it.",
  },
  {
    title: "Design the architecture",
    text: "A simple design that fits the team and the load. The hard decisions come first: data, boundaries, security and cost.",
  },
  {
    title: "Think AI first",
    text: "Before building, I ask what AI and automation can do here: a smarter feature for users, or a faster path for the team. I use it where it earns its place.",
  },
  {
    title: "Build",
    text: "Hands-on, in small releases. Code review, CI/CD and infrastructure as code make shipping a routine, not an event.",
  },
  {
    title: "Validate",
    text: "Nothing counts until it is proven. Tests, output checks and real usage data, with a full audit trail in regulated work.",
  },
];

/** What stays the same whatever the project. */
export const teamValue = {
  title: "I wear the team's shirt.",
  text: "I am a team player first. The company's goals become my goals, I stay for the long run, and I care more about the team winning than about being right. Six years at Bioforum, from senior developer to head of technology, is what that looks like in practice.",
};
