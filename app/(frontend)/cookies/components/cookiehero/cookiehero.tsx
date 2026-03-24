import React from "react";

export default function CookieHero() {
  return (
    <div className="w-full h-[350px] md:h-[450px] relative flex-shrink-0 mt-[80px] md:mt-0 md:pt-[120px] flex justify-center">
      <div className="absolute inset-x-0 top-0 bottom-0 bg-[#6AAD3C] -z-10"></div>
      <div className="w-full h-full max-w-[1200px] mx-auto px-4 flex justify-center items-center">
        <div className="text-white text-2xl sm:text-3xl lg:text-5xl font-semibold font-['Poppins'] leading-tight sm:leading-normal lg:leading-[57.60px] text-center">
          Política de cookies
        </div>
      </div>
    </div>
  );
}
