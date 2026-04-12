"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type CountdownSnapshot = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
};

const launchTimestamp = Date.UTC(2026, 7, 15, 0, 0, 0);

function useCountdown(target: number): CountdownSnapshot {
  const compute = useCallback(() => {
    const now = Date.now();
    const delta = target - now;

    if (delta <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true };
    }

    const days = Math.floor(delta / (1000 * 60 * 60 * 24));
    const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((delta / (1000 * 60)) % 60);
    const seconds = Math.floor((delta / 1000) % 60);

    return { days, hours, minutes, seconds, completed: false };
  }, [target]);

  const [snapshot, setSnapshot] = useState<CountdownSnapshot>(() => compute());

  useEffect(() => {
    const update = () => {
      setSnapshot(compute());
    };

    update();

    const tick = window.setInterval(update, 1000);

    return () => {
      window.clearInterval(tick);
    };
  }, [compute]);

  return snapshot;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const easeCurve = [0.16, 1, 0.3, 1] as const;

const heroFade = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: easeCurve },
};

const sectionFade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: easeCurve },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cemzo",
  url: "https://cemzo.com",
  logo: "https://cemzo.com/cemzo-poster.svg",
  sameAs: [
    "https://instagram.com",
    "https://twitter.com",
    "https://linkedin.com",
    "https://youtube.com",
  ],
  description:
    "Join the waitlist for Cemzo, an innovative app redefining the digital experience. Coming 2026 to Android & iOS.",
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "press",
      email: "press@cemzo.com",
    },
  ],
} as const;

function AndroidIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M5 9h14v9a2 2 0 0 1-2 2h-1v-5h-8v5H7a2 2 0 0 1-2-2z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
      <path d="M4 5l2 3" />
      <path d="M20 5l-2 3" />
      <circle cx="9" cy="5" r="0.4" />
      <circle cx="15" cy="5" r="0.4" />
    </svg>
  );
}

function AppleIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={props.className}
    >
      <path d="M16.7 13.3c-.03-2.1 1.7-3.1 1.8-3.1-1-1.5-2.6-1.7-3.1-1.7-1.3-.1-2.4.8-3 0.8-.6 0-1.6-.8-2.6-.7-1.3 0-2.5.7-3.1 1.8-1.3 2.2-.3 5.4.9 7.2.6.9 1.4 1.9 2.4 1.8 1-.1 1.4-.6 2.6-.6 1.2 0 1.6.6 2.6.6 1.1 0 1.8-.9 2.5-1.8.8-1.2 1.1-2.3 1.2-2.4-.03-.01-2.4-.9-2.4-3.9z" />
      <path d="M14.5 6.2c.5-.6.8-1.4.7-2.2-.7.1-1.5.5-2 .9-.5.5-.8 1.3-.7 2.1.7 0 1.4-.4 2-.8z" />
    </svg>
  );
}

export default function Home() {
  const countdown = useCountdown(launchTimestamp);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const countdownItems = useMemo(
    () => [
      { label: "Days", value: String(countdown.days).padStart(2, "0") },
      { label: "Hours", value: String(countdown.hours).padStart(2, "0") },
      { label: "Minutes", value: String(countdown.minutes).padStart(2, "0") },
      { label: "Seconds", value: String(countdown.seconds).padStart(2, "0") },
    ],
    [countdown.days, countdown.hours, countdown.minutes, countdown.seconds],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      setStatus("error");
      setMessage("Please add your name so we can say hello.");
      return;
    }

    if (!emailPattern.test(trimmedEmail.toLowerCase())) {
      setStatus("error");
      setMessage("Enter a valid email to join the waitlist.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; message?: string }
          | null;
        throw new Error(payload?.error ?? payload?.message ?? "We couldn't add you right now.");
      }

      setStatus("success");
      setMessage("Thanks for joining the waitlist!");
      setFormData({ name: "", email: "" });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again in a moment.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Image
        src="/cemzo-poster.svg"
        alt="Cemzo coming soon poster"
        fill
        sizes="100vw"
        priority
        className="pointer-events-none select-none object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(61,77,229,0.45),_transparent_60%)]" />
      <div className="absolute inset-0 bg-black/50" />

      <main className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-8 sm:px-10 lg:px-16">
          <motion.span
            className="text-lg font-semibold tracking-[0.4em] text-white/80"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeCurve }}
          >
            CEMZO
          </motion.span>
          <motion.a
            href="#waitlist"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.2em] text-white shadow-[0_8px_32px_rgba(15,23,42,0.35)] backdrop-blur-xl transition duration-300 hover:bg-white/20"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: easeCurve }}
          >
            Join Waitlist
          </motion.a>
        </header>

        <section className="flex flex-1 flex-col justify-center gap-16 px-6 pb-24 pt-10 sm:px-10 lg:flex-row lg:items-center lg:px-16">
          <motion.div className="max-w-2xl text-center lg:text-left" {...heroFade}>
            <p className="text-sm font-semibold uppercase tracking-[0.6em] text-teal-200/80">Coming 2026</p>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Experience the Future
              <span className="block bg-gradient-to-r from-teal-200 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                Cemzo is Almost Here
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/80 sm:text-xl">
              Cemzo is reimagining how people connect and share. Stay tuned for the revolution launching worldwide in 2026.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <motion.a
                href="#waitlist"
                className="inline-flex items-center rounded-full border border-white/20 bg-gradient-to-r from-sky-500/80 via-indigo-500/70 to-purple-500/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_12px_40px_rgba(56,189,248,0.35)] backdrop-blur-xl transition duration-300 hover:from-sky-400 hover:via-indigo-400 hover:to-purple-400"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Join the Waitlist
              </motion.a>
              <div className="flex flex-col items-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs uppercase tracking-[0.35em] text-white/70 backdrop-blur-xl">
                <span>Android & iOS</span>
                <span className="text-[0.6rem]">Launching Globally</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative w-full max-w-md rounded-[2.5rem] border border-white/15 bg-white/5 p-10 text-center shadow-[0_24px_80px_rgba(59,130,246,0.35)] backdrop-blur-3xl"
            {...heroFade}
            transition={{ delay: 0.2, duration: 0.8, ease: easeCurve }}
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-500 shadow-[0_16px_40px_rgba(59,130,246,0.45)]">
              <span className="text-3xl font-light tracking-[0.5em]">CZ</span>
            </div>
            <p className="mt-8 text-sm uppercase tracking-[0.4em] text-white/60">Launch Countdown</p>
            <div className="mt-6 flex items-baseline justify-center gap-3">
              <span className="text-5xl font-bold leading-none text-white/90">2026</span>
              <span className="text-sm uppercase tracking-[0.3em] text-white/50">Release</span>
            </div>
            <p className="mt-6 text-base text-white/70">
              Get early access, exclusive previews, and behind-the-scenes updates delivered straight to your inbox.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
                <AndroidIcon className="h-4 w-4" />
                <span>Android</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
                <AppleIcon className="h-4 w-4" />
                <span>iOS</span>
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="px-6 pb-20 sm:px-10 lg:px-16"
          {...sectionFade}
        >
          <div className="mx-auto max-w-5xl rounded-[2.75rem] border border-white/10 bg-white/5 p-10 shadow-[0_24px_80px_rgba(79,70,229,0.35)] backdrop-blur-3xl">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.5em] text-white/60">
              Countdown to 2026
            </h2>
            <p className="mt-4 text-center text-2xl font-semibold text-white/90">
              {countdown.completed
                ? "Launch day has arrived. Welcome to Cemzo."
                : "We're building something extraordinary. Time until liftoff:"}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {countdownItems.map((item) => (
                <div
                  key={item.label}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_18px_60px_rgba(56,189,248,0.25)] backdrop-blur-2xl transition duration-300 hover:border-white/30 hover:bg-white/10"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={item.value}
                      className="block text-4xl font-bold tracking-[0.2em] text-white"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.4, ease: easeCurve }}
                    >
                      {item.value}
                    </motion.span>
                  </AnimatePresence>
                  <span className="mt-2 block text-xs uppercase tracking-[0.4em] text-white/60">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="waitlist"
          className="px-6 pb-24 sm:px-10 lg:px-16"
          {...sectionFade}
        >
          <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-white/15 bg-white/10 p-1 shadow-[0_32px_90px_rgba(37,99,235,0.45)] backdrop-blur-3xl">
            <div className="rounded-[2.4rem] border border-white/10 bg-[rgba(6,11,25,0.85)] p-10">
              <div className="flex flex-col gap-6 text-center lg:flex-row lg:text-left">
                <motion.div className="flex-1" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: easeCurve }}>
                  <h2 className="text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                    Be first in line for the Cemzo experience
                  </h2>
                  <p className="mt-4 text-base text-white/70">
                    Secure early access, exclusive previews, and community-only drops. We partner with Brevo to keep your data safe and send meaningful updates only.
                  </p>
                </motion.div>
                <motion.form
                  className="flex-1 space-y-5"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.7, ease: easeCurve }}
                >
                  <div className="flex flex-col gap-2 text-left">
                    <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white/90 outline-none transition focus:border-sky-300 focus:bg-white/10 focus:ring-2 focus:ring-sky-400/40"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                      className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white/90 outline-none transition focus:border-sky-300 focus:bg-white/10 focus:ring-2 focus:ring-sky-400/40"
                      placeholder="you@futuremail.com"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_16px_45px_rgba(56,189,248,0.45)] transition duration-300 hover:from-emerald-300 hover:via-sky-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={status === "loading"}
                    aria-busy={status === "loading"}
                  >
                    {status === "loading" ? "Joining..." : "Join the Waitlist"}
                  </button>
                  <AnimatePresence>
                    {status !== "idle" && message.trim() !== "" && (
                      <motion.p
                        key={status}
                        className={
                          status === "success"
                            ? "text-sm font-medium text-emerald-300"
                            : "text-sm font-medium text-rose-300"
                        }
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: easeCurve }}
                      >
                        {message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.form>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="px-6 pb-20 sm:px-10 lg:px-16"
          {...sectionFade}
        >
          <div className="mx-auto max-w-4xl text-center">
            <motion.p
              className="text-lg text-white/75 sm:text-xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: easeCurve }}
            >
              Cemzo is reimagining how people connect and share. Stay tuned for the revolution.
            </motion.p>
          </div>
        </motion.section>

        <footer className="mt-auto border-t border-white/10 bg-black/40 px-6 py-10 text-white/70 backdrop-blur-xl sm:px-10 lg:px-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-center text-sm uppercase tracking-[0.4em] text-white/60 lg:text-left">
              © 2025 Cemzo. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.3em]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
              >
                Instagram
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
              >
                X / Twitter
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
              >
                LinkedIn
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
              >
                YouTube
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] text-white/60">
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2">
                <AndroidIcon className="h-4 w-4" />
                <span>Available on Android</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2">
                <AppleIcon className="h-4 w-4" />
                <span>Available on iOS</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <div className="pointer-events-none absolute -left-32 top-40 h-72 w-72 rounded-full bg-gradient-to-br from-sky-500/40 to-purple-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-gradient-to-br from-teal-400/40 to-sky-600/30 blur-3xl" />
    </div>
  );
}
