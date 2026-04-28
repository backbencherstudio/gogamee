"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Mail } from "lucide-react";

function GiftSuccessContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "0";
  const status = searchParams.get("status");

  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-[130px] pb-16 font-['Poppins']">
      <section className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-lime-100 text-lime-600">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-zinc-950">
          Tarjeta regalo comprada
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600">
          Hemos recibido el pago de tu tarjeta regalo GoGame. Enviaremos el
          codigo al correo indicado cuando Stripe confirme el pago.
        </p>

        <div className="mt-8 rounded-lg bg-[#F1F9EC] p-5">
          <div className="flex items-center justify-center gap-2 text-[#0B5B46]">
            <Mail size={20} />
            <span className="font-semibold">Resumen</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-lime-200 pt-4 text-sm">
            <span>Importe</span>
            <span className="font-semibold">{Number(amount).toFixed(2)} EUR</span>
          </div>
          {status === "processing" && (
            <p className="mt-3 text-xs text-zinc-500">
              El pago esta procesandose. El email se enviara automaticamente al
              confirmarse.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded bg-[#76C043] px-5 py-3 text-sm font-semibold text-white hover:bg-lime-600"
          >
            Volver al inicio
          </Link>
          <Link
            href="/book"
            className="rounded border border-lime-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-lime-50"
          >
            Hacer una reserva
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function GiftSuccessPage() {
  return (
    <Suspense fallback={<div className="pt-[130px] text-center">Cargando...</div>}>
      <GiftSuccessContent />
    </Suspense>
  );
}
