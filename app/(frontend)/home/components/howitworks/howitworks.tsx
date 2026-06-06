"use client";

import Image from "next/image";
import Link from "next/link";

interface HowItWorksContent {
  howItWorksTitle?: string;
  howItWorksIntro?: string;
  steps?: Array<{
    title?: string;
    description?: string;
  }>;
}

const defaultHowItWorksContent = {
  howItWorksTitle: "Cómo funciona GoGame",
  howItWorksIntro:
    "Sigue unos pasos muy sencillos y nosotros te sorprenderemos con el viaje deportivo perfecto, totalmente organizado.",
  steps: [
    {
      title: "Personaliza tu aventura",
      description:
        "Cuéntanos tu deporte favorito (fútbol o basket), desde qué ciudad sales y cuántas personas sois.",
    },
    {
      title: "Nosotros preparamos la sorpresa",
      description:
        "Nos encargamos de reservar tus vuelos, el hotel y las entradas al partido. Tú solo tienes que esperar al gran momento sorpresa.",
    },
    {
      title: "Prepárate para irte",
      description:
        "Recibirás tu plan de viaje secreto. Haz la maleta y empieza a emocionarte: sabrás tu destino unos días antes.",
    },
    {
      title: "Vive la experiencia",
      description:
        "Disfruta del partido, explora una nueva ciudad y crea recuerdos inolvidables.",
    },
  ],
};

export default function HowItWorks({
  content,
}: {
  content?: HowItWorksContent | null;
}) {
  const steps =
    content?.steps?.length === 4
      ? content.steps
      : defaultHowItWorksContent.steps;

  return (
    <div className="w-full h-auto py-12 md:py-24 flex flex-col justify-start items-center gap-8 md:gap-12 max-w-[1200px] mx-auto">
      <div className="w-full flex flex-col xl:flex-row justify-start items-start xl:items-center gap-4 md:gap-6 xl:gap-24 px-4 xl:px-0">
        <div className="w-full xl:w-[533px]">
          <h2 className="text-zinc-950 text-3xl md:text-4xl xl:text-5xl font-semibold font-poppins leading-tight xl:leading-[57.60px]">
            {content?.howItWorksTitle ||
              defaultHowItWorksContent.howItWorksTitle}
          </h2>
        </div>
        <div className="flex-1 text-black text-sm md:text-base font-normal font-poppins leading-6 xl:leading-7">
          {content?.howItWorksIntro ||
            defaultHowItWorksContent.howItWorksIntro}
        </div>
      </div>

      <div className="container mx-auto px-4 xl:px-0">
        <div className="w-full relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 justify-items-center gap-12 xl:gap-0">
          {/* Step 1 */}
          <div className="w-full max-w-72 flex flex-col justify-start items-center gap-4">
            <div className="w-28 h-28 xl:w-36 xl:h-36 p-8 xl:p-10 bg-white rounded-[75px] outline outline-offset-[-1px] outline-lime-900 flex justify-center items-center">
              <Image
                src="/homepage/icon/calender.svg"
                alt="Calendar Icon"
                width={48}
                height={48}
                className="w-12 h-12 xl:w-16 xl:h-16"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-center gap-2">
              <h3 className="text-center text-lime-900 text-base xl:text-lg font-semibold font-poppins leading-relaxed xl:leading-loose">
                {steps[0]?.title || defaultHowItWorksContent.steps[0].title}
              </h3>
              <div className="text-center text-neutral-600 text-sm xl:text-base font-normal font-poppins leading-6 xl:leading-7">
                {steps[0]?.description ||
                  defaultHowItWorksContent.steps[0].description}
              </div>
            </div>
          </div>

          {/* Connector 1 - Hidden on screens smaller than 1200px */}
          <Image
            src="/homepage/icon/connector.svg"
            alt="Connector"
            width={160}
            height={20}
            className="absolute left-[220px] top-[70px] hidden xl:block"
          />

          {/* Step 2 */}
          <div className="w-full max-w-72 flex flex-col justify-start items-center gap-4">
            <div className="w-28 h-28 xl:w-36 xl:h-36 p-8 xl:p-10 bg-white rounded-[75px] outline outline-offset-[-1px] outline-lime-900 flex justify-center items-center">
              <Image
                src="/homepage/icon/pointer.svg"
                alt="Pointer Icon"
                width={48}
                height={48}
                className="w-12 h-12 xl:w-16 xl:h-16"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-center gap-2">
              <h3 className="text-center text-lime-900 text-base xl:text-lg font-semibold font-poppins leading-relaxed xl:leading-loose">
                {steps[1]?.title || defaultHowItWorksContent.steps[1].title}
              </h3>
              <div className="text-center text-neutral-600 text-sm xl:text-base font-normal font-poppins leading-6 xl:leading-7">
                {steps[1]?.description ||
                  defaultHowItWorksContent.steps[1].description}
              </div>
            </div>
          </div>

          {/* Connector 2 - Hidden on screens smaller than 1200px */}
          <Image
            src="/homepage/icon/connector.svg"
            alt="Connector"
            width={160}
            height={20}
            className="absolute left-[520px] top-[70px] hidden xl:block"
          />

          {/* Step 3 */}
          <div className="w-full max-w-72 flex flex-col justify-start items-center gap-4">
            <div className="w-28 h-28 xl:w-36 xl:h-36 p-8 xl:p-10 bg-white rounded-[75px] outline outline-offset-[-1px] outline-lime-900 flex justify-center items-center">
              <Image
                src="/homepage/icon/go.svg"
                alt="Go Icon"
                width={48}
                height={48}
                className="w-12 h-12 xl:w-16 xl:h-16"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-center gap-2">
              <h3 className="text-center text-lime-900 text-base xl:text-lg font-semibold font-poppins leading-relaxed xl:leading-loose">
                {steps[2]?.title || defaultHowItWorksContent.steps[2].title}
              </h3>
              <div className="text-center text-neutral-600 text-sm xl:text-base font-normal font-poppins leading-6 xl:leading-7">
                {steps[2]?.description ||
                  defaultHowItWorksContent.steps[2].description}
              </div>
            </div>
          </div>

          {/* Connector 3 - Hidden on screens smaller than 1200px */}
          <Image
            src="/homepage/icon/connector.svg"
            alt="Connector"
            width={160}
            height={20}
            className="absolute left-[820px] top-[70px] hidden xl:block"
          />

          {/* Step 4 */}
          <div className="w-full max-w-72 flex flex-col justify-start items-center gap-4">
            <div className="w-28 h-28 xl:w-36 xl:h-36 p-8 xl:p-10 bg-white rounded-[75px] outline outline-offset-[-1px] outline-lime-900 flex justify-center items-center">
              <Image
                src="/homepage/icon/map.svg"
                alt="Map Icon"
                width={48}
                height={48}
                className="w-12 h-12 xl:w-16 xl:h-16"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-center gap-2">
              <h3 className="text-center text-lime-900 text-base xl:text-lg font-semibold font-poppins leading-relaxed xl:leading-loose">
                {steps[3]?.title || defaultHowItWorksContent.steps[3].title}
              </h3>
              <div className="text-center text-neutral-600 text-sm xl:text-base font-normal font-poppins leading-6 xl:leading-7">
                {steps[3]?.description ||
                  defaultHowItWorksContent.steps[3].description}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link href="/book">
        <button className="w-1/2 mx-20 md:w-auto px-4 py-2.5 bg-[#76C043] rounded-[999px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer text-center text-white text-base md:text-lg font-normal font-poppins leading-7">
          Empieza el juego
        </button>
      </Link>
    </div>
  );
}
