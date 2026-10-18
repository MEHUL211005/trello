import { useState } from "react";
import { Layers, Users, ShieldCheck, Zap, Plus, Send } from "lucide-react";

import Logo from "./Logo";
import { QUOTES } from "../lib/quotes";

// Only things the product really does
const FEATURES = [
  {
    icon: Zap,
    title: "Drag & drop boards",
    text: "Organize your work visually and intuitively.",
  },
  {
    icon: Users,
    title: "Real-time teamwork",
    text: "Stay in sync, always.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    text: "Your data, your control.",
  },
];

// A pastel task card for the illustration
const TaskCard = ({ dot, highlight = false }) => (
  <div
    className={`rounded-lg p-2.5 shadow-sm ${
      highlight ? "bg-white ring-1 ring-brand-200" : "bg-white/95"
    }`}
  >
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 shrink-0 rounded-full ${dot}`} />
      <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
    </div>
    <span className="mt-2 block h-1.5 w-2/3 rounded-full bg-slate-200/80" />
  </div>
);

const Column = ({ title, children }) => (
  <div className="space-y-2 rounded-xl bg-white/25 p-2">
    <p className="px-1 text-[11px] font-semibold text-white/90">{title}</p>
    {children}
  </div>
);

// The tilted kanban board from the brand artwork
const BoardIllustration = () => (
  <div className="relative">
    {/* Paper plane + trail */}
    <svg
      viewBox="0 0 220 90"
      className="absolute -top-14 left-6 h-20 w-52 text-white/50"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 82 C 50 10, 130 4, 190 34"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />
    </svg>
    <Send
      size={34}
      className="absolute -top-16 right-6 -rotate-12 fill-white/30 text-white"
    />

    <div
      className="animate-float-slow relative rounded-2xl bg-white/20 p-3 shadow-2xl shadow-indigo-950/40 ring-1 ring-white/40 backdrop-blur-md"
      style={{
        transform:
          "perspective(1100px) rotateY(-14deg) rotateX(5deg) rotateZ(-5deg)",
      }}
    >
      <div className="grid grid-cols-3 gap-2.5">
        <Column title="To Do">
          <TaskCard dot="bg-violet-300" />
          <TaskCard dot="bg-violet-300" />
          <TaskCard dot="bg-violet-300" />
        </Column>
        <Column title="In Progress">
          <TaskCard dot="bg-blue-400" />
          <TaskCard dot="bg-teal-300" highlight />
          <TaskCard dot="bg-amber-300" />
        </Column>
        <Column title="Done">
          <TaskCard dot="bg-violet-300" />
          <TaskCard dot="bg-emerald-300" />
        </Column>
      </div>
    </div>

    {/* Floating "add" tile */}
    <span className="absolute -bottom-6 right-2 flex h-14 w-14 rotate-6 items-center justify-center rounded-2xl bg-white shadow-xl shadow-indigo-950/30">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
        <Plus size={20} />
      </span>
    </span>
  </div>
);

// Two-column layout shared by every auth page: brand story on the left,
// the form card on the right. The left side is hidden on small screens, and
// the whole page fits one screen so it never needs to scroll.
const AuthShell = ({ title, subtitle, children }) => {
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
  );

  return (
    <div className="h-dvh overflow-hidden bg-[#f7f7fd] lg:grid lg:grid-cols-[1.3fr_1fr]">
      {/* BRAND PANEL */}
      <aside className="bg-auth-gradient relative hidden overflow-hidden px-[clamp(2rem,4.5vw,4.5rem)] py-[clamp(1.25rem,4.5vh,3rem)] text-white lg:flex lg:flex-col">
        {/* Decoration */}
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-[26rem] w-[26rem] rounded-full bg-white/10" />
        <div className="pointer-events-none absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative">
          <Logo light size={46} large />
        </div>

        <div className="relative my-auto py-[clamp(0.5rem,2vh,1.5rem)]">
          <p className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#6ee7d3]" />
            Collaborative Project Management System
          </p>

          <h1 className="mt-[clamp(0.75rem,3vh,1.75rem)] text-[clamp(2rem,5.6vh,3.3rem)] font-extrabold leading-[1.1] tracking-tight">
            Plan together.
            <br />
            Track every task.
            <br />
            <span className="bg-gradient-to-r from-[#6ee7d3] to-[#8ec5ff] bg-clip-text text-transparent">
              Ship with confidence.
            </span>
          </h1>

          <p className="mt-[clamp(0.5rem,2vh,1.25rem)] max-w-md text-[clamp(0.9rem,1.9vh,1.05rem)] leading-relaxed text-white/80 [@media(max-height:700px)]:hidden">
            Boards, lists and cards that keep your whole team aligned, from the
            first idea to the final release.
          </p>

          <ul className="mt-[clamp(1rem,5vh,3.5rem)] grid max-w-2xl grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 [@media(max-height:760px)]:mb-2 [@media(max-height:760px)]:h-10 [@media(max-height:760px)]:w-10">
                  <feature.icon size={20} className="text-white" />
                </span>
                <p className="text-[15px] font-bold leading-snug">
                  {feature.title}
                </p>
                <p className="mt-1 text-sm leading-snug text-white/70 [@media(max-height:800px)]:hidden">
                  {feature.text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Board artwork, on wide and tall screens only */}
        <div className="pointer-events-none absolute right-[3.5vw] top-[19vh] hidden w-[clamp(300px,23vw,430px)] min-[1500px]:block [@media(max-height:800px)]:hidden">
          <BoardIllustration />
        </div>

        <figure className="relative max-w-[min(34rem,90%)] rounded-2xl border-l-4 border-[#6ee7d3] bg-white/10 py-[clamp(0.6rem,2vh,1.1rem)] pl-5 pr-6 ring-1 ring-white/10 backdrop-blur-sm">
          <blockquote className="text-[clamp(0.85rem,1.8vh,1rem)] font-medium italic leading-relaxed text-white">
            “{quote.text}”
          </blockquote>
          <figcaption className="mt-1.5 text-sm text-white/70">
            — {quote.author}
          </figcaption>
        </figure>
      </aside>

      {/* FORM PANEL */}
      <main className="relative flex h-dvh items-center justify-center overflow-y-auto px-5 py-6 sm:px-10">
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl lg:hidden" />

        <div className="animate-fade-up relative my-auto w-full max-w-[34rem]">
          <div className="mb-5 flex items-center gap-2 lg:hidden">
            <Logo size={40} />
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-xl shadow-brand-900/[0.06] sm:p-9 [@media(min-height:900px)]:p-11">
            {/* Soft corner circles, as in the artwork */}
            <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand-100/80" />
            <span className="pointer-events-none absolute -right-2 -top-14 h-24 w-24 rounded-full bg-brand-200/70" />

            <div className="relative">
              <h2 className="text-[clamp(1.6rem,3.6vh,2.1rem)] font-extrabold leading-tight tracking-tight text-slate-900">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-500">
                  {subtitle}
                </p>
              )}

              {children}
            </div>
          </div>

          <p className="mt-4 hidden items-center justify-center gap-1.5 text-center text-xs text-slate-400 [@media(min-height:780px)]:flex">
            <Layers size={12} />© {new Date().getFullYear()} TaskSphere
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthShell;
