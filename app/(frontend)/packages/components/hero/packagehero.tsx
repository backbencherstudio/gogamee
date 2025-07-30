import React from "react";
import Image from "next/image";

export default function PackageHero() {
  return (
    <div className="w-full max-w-[1200px] mx-auto">

      <div className=" w-[1200px] h-[399px] p-6 rounded-[24px] inline-flex flex-col justify-end items-start overflow-hidden" style={{ backgroundImage: "url(/homepage/packbg.png)", backgroundSize: "cover", objectFit: "cover", backgroundPosition: "center"}}>

        <div className="flex flex-col justify-start items-start gap-2.5">
          <div className="w-[1021px] justify-start text-white text-7xl font-semibold font-['Poppins'] leading-[86.40px]">
            Our packages
          </div>
        </div>
        
      </div>

    </div>
  );
}
