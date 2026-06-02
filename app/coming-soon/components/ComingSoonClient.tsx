"use client";
import { useState, useEffect, useRef } from "react";

function getTimeLeft(target: Date | null) {
  if (!target) return null;
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function FlipBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="min-w-[72px] max-sm:min-w-[58px] px-3.5 py-2.5 bg-white/10 border border-[#76C043]/30 backdrop-blur-md rounded-xl text-3xl max-sm:text-2xl font-extrabold text-white font-['Inter',monospace] text-center shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-colors">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/50">
        {label}
      </div>
    </div>
  );
}

function Particles() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className={`cs-particle cs-particle-${i + 1} absolute rounded-full bg-[#76C043]/25`}
        />
      ))}
    </div>
  );
}

interface ComingSoonClientProps {
  headline: string;
  subtext: string;
  privacyNote: string;
  launchDate: string | null;
}

export default function ComingSoonClient({
  headline,
  subtext,
  privacyNote,
  launchDate,
}: ComingSoonClientProps) {
  const [timeLeft, setTimeLeft] =
    useState<ReturnType<typeof getTimeLeft>>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "duplicate"
  >("idle");
  const [message, setMessage] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!launchDate) return;
    const target = new Date(launchDate);
    setTimeLeft(getTimeLeft(target));
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [launchDate]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.9s ease, transform 0.9s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !privacyAccepted) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          privacyAccepted,
        }),
      });
      const json = await res.json();

      if (res.status === 409) {
        setStatus("duplicate");
        setMessage("¡Ya estás en la lista! 🎉");
      } else if (json.success) {
        setStatus("success");
        setMessage("¡Estás dentro! Te avisaremos cuando lancemos. 🚀");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(json.message || "Algo salió mal. Por favor, inténtalo de nuevo.");
      }
    } catch {
      setStatus("error");
      setMessage("Error de red. Por favor, inténtalo de nuevo.");
    }
  };

  const showCountdown = timeLeft !== null;

  return (
    <>
      <style>{`
        ${Array.from({ length: 18 })
          .map((_, i) => {
            const size = 4 + (i % 5) * 4;
            const left = (i * 5.5 + 2) % 100;
            const dur = 8 + (i % 7) * 3;
            const delay = -(i * 1.3);
            return `.cs-particle-${i + 1} {
              width: ${size}px; height: ${size}px;
              left: ${left}%;
              bottom: -${size}px;
              animation: cs-float ${dur}s linear ${delay}s infinite;
              opacity: ${0.15 + (i % 4) * 0.1};
            }`;
          })
          .join("")}
        @keyframes cs-float {
          0%   { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-110vh) rotate(360deg); }
        }
        #waitlist-form,
        #waitlist-email {
          color-scheme: dark;
        }
        #waitlist-email {
          background-color: transparent;
          -webkit-appearance: none;
          appearance: none;
        }
        #waitlist-email::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        #waitlist-email:autofill,
        #waitlist-email:-webkit-autofill,
        #waitlist-email:-webkit-autofill:hover,
        #waitlist-email:-webkit-autofill:focus {
          -webkit-text-fill-color: #f9fafb;
          caret-color: #f9fafb;
          border-radius: 0.75rem;
          -webkit-box-shadow: 0 0 0 1000px rgba(12, 18, 14, 0.92) inset;
          box-shadow: 0 0 0 1000px rgba(12, 18, 14, 0.92) inset;
          -webkit-background-clip: text;
          background-clip: content-box;
          transition:
            background-color 9999s ease-in-out 0s,
            color 9999s ease-in-out 0s;
        }
        #waitlist-email:-moz-autofill {
          color: #f9fafb;
          caret-color: #f9fafb;
          border-radius: 0.75rem;
          box-shadow: 0 0 0 1000px rgba(12, 18, 14, 0.92) inset;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-['Inter','Poppins',sans-serif] bg-[#0a0f0d]">
        <div className="absolute inset-0 bg-[url('/homepage/Herobg.png')] bg-cover bg-center bg-fixed z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/78 via-[#0a190a]/70 to-black/80 z-10" />
        <Particles />

        <div
          className="relative z-30 w-full max-w-5xl px-5 py-8 mx-auto flex flex-col items-center text-center gap-7"
          ref={heroRef}
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md px-8 py-10 max-sm:px-4 max-sm:py-7 w-full flex flex-col items-center gap-6">
            <h1 className="text-[clamp(2rem,6vw,3.25rem)] font-extrabold text-white leading-[1.15] font-['Inter',sans-serif] tracking-[-0.02em]">
              <span className="text-[#76C043] inline-block relative after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[3px] after:bg-gradient-to-r after:from-[#76C043] after:to-transparent after:rounded-sm">
                GoGame
              </span>
              <br />
              {headline}
            </h1>

            <div
              className="text-[1.05rem] text-white/70 leading-relaxed font-['Poppins',sans-serif] rich-text-content coming-soon-subtext"
              dangerouslySetInnerHTML={{ __html: subtext }}
            />

            {showCountdown && timeLeft && (
              <>
                <div className="w-[60px] h-[2px] bg-gradient-to-r from-transparent via-[#76C043] to-transparent rounded-sm" />
                <div className="flex gap-4 flex-wrap justify-center">
                  <FlipBox value={timeLeft.days} label="Días" />
                  <FlipBox value={timeLeft.hours} label="Horas" />
                  <FlipBox value={timeLeft.minutes} label="Minutos" />
                  <FlipBox value={timeLeft.seconds} label="Segundos" />
                </div>
              </>
            )}

            <div className="w-[60px] h-[2px] bg-gradient-to-r from-transparent via-[#76C043] to-transparent rounded-sm" />

            <form
              className="w-full max-w-[480px] flex flex-col gap-3"
              onSubmit={handleSubmit}
              id="waitlist-form"
            >
              <div className="flex max-sm:flex-col gap-2 bg-white/5 border border-white/15 rounded-xl p-1.5 pl-4 max-sm:p-2 backdrop-blur-md transition-colors focus-within:border-[#76C043]/60 focus-within:shadow-[0_0_0_3px_rgba(118,192,67,0.12)]">
                <input
                  id="waitlist-email"
                  className="flex-1 bg-transparent border-none outline-none text-white text-[0.95rem] font-['Poppins',sans-serif] min-w-0 placeholder:text-white/40 max-sm:px-2 max-sm:py-1.5"
                  type="email"
                  placeholder="Introduce tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading" || status === "success"}
                  autoComplete="email"
                />
                <button
                  id="waitlist-submit"
                  className="px-5 max-sm:w-full py-2.5 max-sm:py-3 bg-[#76C043] text-white text-sm font-semibold font-['Poppins',sans-serif] border-none rounded-lg cursor-pointer transition-all whitespace-nowrap shadow-[0_2px_12px_rgba(118,192,67,0.4)] hover:bg-[#65a836] hover:-translate-y-[1px] hover:shadow-[0_4px_18px_rgba(118,192,67,0.5)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                >
                  {status === "loading"
                    ? "Uniéndote..."
                    : status === "success"
                      ? "Unido ✓"
                      : "Únete a la lista"}
                </button>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-md">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-[#76C043] focus:ring-[#76C043]"
                />
                <span className="text-sm leading-6 text-white/75 font-['Poppins',sans-serif]">
                  He leído y acepto la{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#9ad85f] underline underline-offset-2"
                  >
                    Política de Privacidad
                  </a>
                  .
                </span>
              </label>

              {message && (
                <div
                  className={`text-[0.88rem] font-['Poppins',sans-serif] px-4 py-2 rounded-lg text-center animate-in slide-in-from-top-2 duration-300 ${
                    status === "success"
                      ? "bg-[#76C043]/20 border border-[#76C043]/40 text-[#a8e063]"
                      : status === "duplicate"
                        ? "bg-blue-500/15 border border-blue-500/30 text-blue-300"
                        : "bg-red-500/15 border border-red-500/30 text-red-300"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>

            <p className="text-xs text-white/35 font-['Poppins',sans-serif]">
              {privacyNote}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/60 font-['Poppins',sans-serif]">
              <a href="/terms" className="transition hover:text-white">
                Términos y condiciones
              </a>
              <a href="/privacy" className="transition hover:text-white">
                Política de privacidad
              </a>
              <a href="/cookies" className="transition hover:text-white">
                Política de cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
