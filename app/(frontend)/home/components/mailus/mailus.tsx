"use client";

import React, { useState } from "react";
import { TranslatedText } from "../../../_components/TranslatedText";
import { useLanguage } from "../../../../context/LanguageContext";

export default function Mailus() {
  const { language } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "name" | "email" | "message") =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred.",
      );
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto py-10 px-4 md:py-20">
      <div
        className="w-full h-auto md:h-[537px] p-4 md:p-8 rounded-3xl flex flex-col justify-center items-center gap-2.5"
        style={{
          backgroundImage: "url('/homepage/faqbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
          <div className="w-full md:w-[60%] flex flex-col justify-start items-start gap-6 md:gap-24">
            <div className="w-full text-center md:text-left justify-start text-white text-3xl md:text-6xl font-semibold font-['Inter'] leading-tight md:leading-[67.20px]">
              <TranslatedText
                text="Contáctanos ahora y sé de los primeros en viajar con "
                english="Contact us now and be the first to travel with "
                as="span"
              />
              <span className="text-[#76C043]">GoGame</span>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full md:w-[384px] p-3 bg-white rounded-lg backdrop-blur-[5px] flex flex-col justify-start items-start gap-3"
          >
            <div className="w-full p-3 bg-gray-50 rounded-xl flex flex-col justify-end items-start gap-3">
              <div className="w-full flex flex-col justify-center items-start gap-1">
                <div className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
                  <TranslatedText text="Nombre" english="Name" as="span" />
                </div>
                <div className="w-full h-11 px-3.5 py-1.5 bg-white rounded outline-1 outline-offset-[-1px] outline-neutral-300 flex justify-start items-center gap-2.5">
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder={
                      language === "en"
                        ? "Enter your name"
                        : "Introduce tu nombre"
                    }
                    className="w-full text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed bg-transparent outline-none"
                    required
                  />
                </div>
              </div>
              <div className="w-full flex justify-start items-start gap-3">
                <div className="w-full flex flex-col justify-center items-start gap-1">
                  <div className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
                    <TranslatedText
                      text="Correo electrónico"
                      english="Email"
                      as="span"
                    />
                  </div>
                  <div className="w-full h-11 px-3.5 py-1.5 bg-white rounded outline-1 outline-offset-[-1px] outline-neutral-300 flex justify-start items-center gap-2.5">
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder={
                        language === "en"
                          ? "example@gmail.com"
                          : "ejemplo@gmail.com"
                      }
                      className="w-full text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed bg-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-1">
                <div className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
                  <TranslatedText text="Mensaje" english="Message" as="span" />
                </div>
                <textarea
                  value={form.message}
                  onChange={handleChange("message")}
                  placeholder={
                    language === "en"
                      ? "Enter your message"
                      : "Escribe tu mensaje"
                  }
                  className="w-full h-36 px-3.5 py-1.5 bg-white rounded border border-neutral-300 text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed resize-none outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full h-14 px-3.5 py-1.5 rounded backdrop-blur-[5px] flex justify-center items-center gap-2.5 transition-colors ${
                  status === "loading"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#76C043] hover:bg-lime-600 cursor-pointer"
                }`}
              >
                <TranslatedText
                  text={status === "loading" ? "Enviando..." : "Enviar"}
                  english={status === "loading" ? "Sending..." : "Send"}
                  className="text-white text-base font-normal font-['Inter']"
                />
              </button>
              {status === "success" && (
                <p className="text-sm text-green-600 font-medium">
                  <TranslatedText
                    text="¡Mensaje enviado! Te responderemos pronto."
                    english="Message sent! We’ll get back to you soon."
                    as="span"
                  />
                </p>
              )}
              {status === "error" && (
                <p className="text-sm text-red-600 font-medium">
                  <TranslatedText
                    text={
                      error ?? "No se pudo enviar tu mensaje en este momento."
                    }
                    english={error ?? "Unable to send your message right now."}
                    as="span"
                  />
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
