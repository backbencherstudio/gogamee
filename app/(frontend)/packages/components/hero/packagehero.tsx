import React from "react";

export default function PackageHero() {
  return (
    <div className="w-full h-[350px] md:h-[450px] relative flex-shrink-0 mt-[80px] md:mt-0 md:pt-[120px] flex justify-center">
      {/* Responsive Hero Section */}
      <div
        className="absolute inset-x-0 top-0 bottom-0 overflow-hidden -z-10"
        style={{
          backgroundImage: "url(/homepage/packbg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
      <div className="w-full h-full max-w-[1200px] mx-auto px-4 inline-flex flex-col justify-center items-center text-center relative">
        {/* Content */}
        <div className="flex flex-col justify-center items-center gap-2 sm:gap-3 w-full">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold font-['Poppins'] leading-tight sm:leading-[1.1] md:leading-[1.15] lg:leading-[86.40px] text-center">
            Nuestros packs
          </h1>
        </div>
      </div>
    </div>
  );
}
