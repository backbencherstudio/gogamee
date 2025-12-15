"use client"

import Image from "next/image"
import Link from "next/link"
import { TranslatedText } from "../../../_components/TranslatedText"

export default function HowItWorks() {
  return (
    <div className="w-full h-auto py-12 md:py-24 flex flex-col justify-start items-center gap-8 md:gap-12 max-w-[1200px] mx-auto">
      <div className="w-full flex flex-col xl:flex-row justify-start items-start xl:items-center gap-4 md:gap-6 xl:gap-24 px-4 xl:px-0">
        <div className="w-full xl:w-[533px]">
          <span className="text-zinc-950 text-3xl md:text-4xl xl:text-5xl font-semibold font-poppins leading-tight xl:leading-[57.60px]">
            <TranslatedText text="Cómo funciona GoGame" english="How it works" as="span" />
          </span>
        </div>
        <div className="flex-1 text-black text-sm md:text-base font-normal font-poppins leading-6 xl:leading-7">
          <TranslatedText
            text="Sigue unos pasos muy sencillos y nosotros te sorprenderemos con el viaje deportivo perfecto, totalmente organizado."
            english="Follow a few easy steps, and we’ll surprise you with the perfect sports trip all planned for you!"
            as="span"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 xl:px-0">
        <div className="w-full relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 justify-items-center gap-12 xl:gap-0">
          {/* Step 1 */}
          <div className="w-full max-w-72 flex flex-col justify-start items-center gap-4">
            <div className="w-28 h-28 xl:w-36 xl:h-36 p-8 xl:p-10 bg-white rounded-[75px] outline outline-1 outline-offset-[-1px] outline-lime-900 flex justify-center items-center">
              <Image
                src="/homepage/icon/calender.svg"
                alt="Calendar Icon"
                width={48}
                height={48}
                className="w-12 h-12 xl:w-16 xl:h-16"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-center gap-2">
              <div className="text-center text-lime-900 text-base xl:text-lg font-semibold font-poppins leading-relaxed xl:leading-loose">
                <TranslatedText text="Personaliza tu aventura" english="Customize your adventure" as="span" />
              </div>
              <div className="text-center text-neutral-600 text-sm xl:text-base font-normal font-poppins leading-6 xl:leading-7">
                <TranslatedText
                  text="Cuéntanos tu deporte favorito (fútbol o basket), desde qué ciudad sales y cuántas personas sois."
                  english="Tell us your favorite sport, where you're flying from, and your travel dates."
                  as="span"
                />
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
            <div className="w-28 h-28 xl:w-36 xl:h-36 p-8 xl:p-10 bg-white rounded-[75px] outline outline-1 outline-offset-[-1px] outline-lime-900 flex justify-center items-center">
              <Image
                src="/homepage/icon/pointer.svg"
                alt="Pointer Icon"
                width={48}
                height={48}
                className="w-12 h-12 xl:w-16 xl:h-16"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-center gap-2">
              <div className="text-center text-lime-900 text-base xl:text-lg font-semibold font-poppins leading-relaxed xl:leading-loose">
                <TranslatedText text="Nosotros preparamos la sorpresa" english="We plan the surprise" as="span" />
              </div>
              <div className="text-center text-neutral-600 text-sm xl:text-base font-normal font-poppins leading-6 xl:leading-7">
                <TranslatedText
                  text="Nos encargamos de reservar tus vuelos, el hotel y las entradas al partido. Tú solo tienes que esperar al gran momento sorpresa."
                  english="We'll book your flights, hotel, and game tickets; all you have to do is wait for the big reveal."
                  as="span"
                />
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
            <div className="w-28 h-28 xl:w-36 xl:h-36 p-8 xl:p-10 bg-white rounded-[75px] outline outline-1 outline-offset-[-1px] outline-lime-900 flex justify-center items-center">
              <Image
                src="/homepage/icon/go.svg"
                alt="Go Icon"
                width={48}
                height={48}
                className="w-12 h-12 xl:w-16 xl:h-16"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-center gap-2">
              <div className="text-center text-lime-900 text-base xl:text-lg font-semibold font-poppins leading-relaxed xl:leading-loose">
                <TranslatedText text="Prepárate para irte" english="Get ready to go" as="span" />
              </div>
              <div className="text-center text-neutral-600 text-sm xl:text-base font-normal font-poppins leading-6 xl:leading-7">
                <TranslatedText
                  text="Recibirás tu plan de viaje secreto. Haz la maleta y empieza a emocionarte: sabrás tu destino 48 horas antes."
                  english="Receive your secret travel plan. Pack your bags and get excited! You will know where 48 hours before!"
                  as="span"
                />
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
            <div className="w-28 h-28 xl:w-36 xl:h-36 p-8 xl:p-10 bg-white rounded-[75px] outline outline-1 outline-offset-[-1px] outline-lime-900 flex justify-center items-center">
              <Image
                src="/homepage/icon/map.svg"
                alt="Map Icon"
                width={48}
                height={48}
                className="w-12 h-12 xl:w-16 xl:h-16"
              />
            </div>
            <div className="w-full flex flex-col justify-start items-center gap-2">
              <div className="text-center text-lime-900 text-base xl:text-lg font-semibold font-poppins leading-relaxed xl:leading-loose">
                <TranslatedText text="Vive la experiencia" english="Live the experience" as="span" />
              </div>
              <div className="text-center text-neutral-600 text-sm xl:text-base font-normal font-poppins leading-6 xl:leading-7">
                <TranslatedText
                  text="Disfruta del partido, explora una nueva ciudad y crea recuerdos inolvidables."
                  english="Enjoy the game, explore a new city, and make unforgettable memories."
                  as="span"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link href="/book">
      <button className="w-1/2 mx-20 md:w-auto px-4 py-2.5 bg-[#76C043] rounded-[999px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer">
        <TranslatedText text="Empieza el juego" english="Start the game" className="text-center text-white text-base md:text-lg font-normal font-inter leading-7" />
      </button>
      </Link>
    </div>
  )
}
