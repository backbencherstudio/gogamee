"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

function GiftFailedContent() {
  const searchParams = useSearchParams();
  const error =
    searchParams.get("error") ||
    "No se pudo completar el pago de la tarjeta regalo.";

  return (
    <main className="min-h-screen bg-gray-50 px-4 pt-[130px] pb-16 font-['Poppins']">
      <section className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle size={48} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-zinc-950">
          Pago no completado
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600">
          {error}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/regala-gogame"
            className="rounded bg-[#76C043] px-5 py-3 text-sm font-semibold text-white hover:bg-lime-600"
          >
            Intentarlo de nuevo
          </Link>
          <Link
            href="/"
            className="rounded border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-gray-50"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function GiftFailedPage() {
  return (
    <Suspense fallback={<div className="pt-[130px] text-center">Cargando...</div>}>
      <GiftFailedContent />
    </Suspense>
  );
}
