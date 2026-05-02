"use client";

import React, { useMemo, useState } from "react";
import StripeProvider from "../book/components/step10/StripeProvider";
import { Info } from "lucide-react";
import GiftCardCheckoutForm from "./components/GiftCardCheckoutForm";

const AMOUNTS = [200, 250, 300, 350];

interface GiftFormState {
  amount: number;
  customAmount: string;
  recipientName: string;
  recipientEmail: string;
  dedication: string;
  buyerName: string;
  buyerEmail: string;
}

export default function RegalaGoGamePage() {
  const [form, setForm] = useState<GiftFormState>({
    amount: 200,
    customAmount: "",
    recipientName: "",
    recipientEmail: "",
    dedication: "",
    buyerName: "",
    buyerEmail: "",
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const selectedAmount = useMemo(() => {
    if (form.amount === 0) return Number(form.customAmount || 0);
    return form.amount;
  }, [form.amount, form.customAmount]);

  const updateForm = (key: keyof GiftFormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Preparando pago..." });

    try {
      const response = await fetch("/api/gift-cards/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          recipientName: form.recipientName,
          recipientEmail: form.recipientEmail,
          dedication: form.dedication,
          buyerName: form.buyerName,
          buyerEmail: form.buyerEmail,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo crear el pago.");
      }

      setClientSecret(result.clientSecret);
      setStatus({ type: "idle", message: "" });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "No se pudo preparar el pago.",
      });
    }
  };

  return (
    <main className="mt-[110px] min-h-screen bg-white px-4 pb-16 font-['Poppins']">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-xl bg-[#F1F9EC] p-5 outline outline-[#6AAD3C]/20 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-neutral-900 md:text-4xl">
              Regala GoGame
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              Compra una tarjeta regalo digital para vivir una experiencia
              deportiva sorpresa.
            </p>
          </div>

          {!clientSecret ? (
            <form
              onSubmit={handleCreateCheckout}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="mb-3 text-lg font-semibold text-neutral-900">
                  Selecciona un importe
                </h2>
                <div className="grid md:flex grid-cols-2 gap-3 sm:grid-cols-5 w-full overflow-x-auto">
                  {AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => updateForm("amount", amount)}
                      className={`py-2.5 px-3 rounded border text-sm font-semibold text-nowrap ${
                        form.amount === amount
                          ? "border-[#76C043] bg-[#76C043] text-white"
                          : "border-lime-200 bg-white text-neutral-800"
                      }`}
                    >
                      {amount} EUR
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateForm("amount", 0)}
                    className={`py-2.5 px-3 rounded border text-sm font-semibold text-nowrap ${
                      form.amount === 0
                        ? "border-[#76C043] bg-[#76C043] text-white"
                        : "border-lime-200 bg-white text-neutral-800"
                    }`}
                  >
                    Personalizado
                  </button>
                </div>
                {form.amount === 0 && (
                  <input
                    type="number"
                    min={100}
                    max={2000}
                    value={form.customAmount}
                    onChange={(event) =>
                      updateForm("customAmount", event.target.value)
                    }
                    placeholder="Minimo 100 EUR, maximo 2000 EUR"
                    className="mt-3 h-12 w-full rounded border border-lime-400 px-4 text-sm outline-none focus:border-[#76C043]"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-800">
                    Nombre del destinatario
                  </label>
                  <input
                    required
                    value={form.recipientName}
                    onChange={(event) =>
                      updateForm("recipientName", event.target.value)
                    }
                    className="h-11 w-full rounded border border-lime-400 px-3 outline-none focus:border-[#76C043]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-800">
                    Correo electronico
                  </label>
                  <input
                    required
                    type="email"
                    value={form.recipientEmail}
                    onChange={(event) =>
                      updateForm("recipientEmail", event.target.value)
                    }
                    className="h-11 w-full rounded border border-lime-400 px-3 outline-none focus:border-[#76C043]"
                  />
                </div>
                <p className="text-xs text-zinc-500 md:col-span-2 flex">
                  <Info className="w-4 h-4 mr-2" />
                  Puedes introducir tu correo o el del destinatario, segun
                  prefieras quien reciba la tarjeta regalo.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-800">
                  Dedicatoria
                </label>
                <textarea
                  value={form.dedication}
                  onChange={(event) =>
                    updateForm("dedication", event.target.value)
                  }
                  rows={4}
                  className="w-full rounded border border-lime-400 px-3 py-3 outline-none focus:border-[#76C043]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-800">
                    Tu nombre
                  </label>
                  <input
                    required
                    value={form.buyerName}
                    onChange={(event) =>
                      updateForm("buyerName", event.target.value)
                    }
                    className="h-11 w-full rounded border border-lime-400 px-3 outline-none focus:border-[#76C043]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-800">
                    Tu correo electronico
                  </label>
                  <input
                    type="email"
                    value={form.buyerEmail}
                    onChange={(event) =>
                      updateForm("buyerEmail", event.target.value)
                    }
                    className="h-11 w-full rounded border border-lime-400 px-3 outline-none focus:border-[#76C043]"
                  />
                </div>
              </div>

              {status.message && (
                <p
                  className={`text-sm ${
                    status.type === "error" ? "text-red-600" : "text-lime-700"
                  }`}
                >
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={status.type === "loading"}
                className="h-12 rounded bg-[#76C043] px-6 text-sm font-semibold text-white hover:bg-lime-600 disabled:opacity-60"
              >
                Comprar
              </button>
            </form>
          ) : (
            <StripeProvider clientSecret={clientSecret}>
              <GiftCardCheckoutForm
                amount={selectedAmount}
                clientSecret={clientSecret}
              />
              {status.type === "success" && (
                <p className="mt-4 text-sm font-medium text-lime-700">
                  {status.message}
                </p>
              )}
            </StripeProvider>
          )}
        </section>

        <aside className="rounded-xl border border-lime-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0B5B46]">
            Regala un viaje sorpresa
          </h2>
          <div className="mt-6 space-y-5">
            {[
              "Elige el importe de la tarjeta regalo",
              "Anade los datos del destinatario y tu dedicatoria",
              "Recibe la tarjeta regalo por email",
              "Canjea el codigo al hacer tu reserva GoGame",
            ].map((item, index) => (
              <div key={item} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#76C043] text-sm font-bold text-white">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-6 text-zinc-700">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-lg bg-[#F1F9EC] p-4">
            <p className="text-sm font-medium text-neutral-900">Resumen</p>
            <div className="mt-3 flex justify-between text-sm text-zinc-700">
              <span>Tarjeta regalo</span>
              <span>{selectedAmount || 0} EUR</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-lime-200 pt-3 text-base font-semibold text-neutral-900">
              <span>Total</span>
              <span>{selectedAmount || 0} EUR</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
