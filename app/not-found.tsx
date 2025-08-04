"use client"
import Error from '@/public/homepage/svg/error';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-[1440px] h-[743px] px-28 py-24 bg-neutral-50 inline-flex flex-col justify-center items-center gap-12">
        <div className="w-96 flex flex-col justify-center items-center gap-6">
          <div className="self-stretch h-80 relative flex items-center justify-center">
            <div className="w-96 h-80 left-0 top-0 absolute flex items-center justify-center">
              <Error/>
            </div>
          </div>
          {/* 404 page design */}
          <div className="self-stretch flex flex-col justify-start items-center gap-6">
            <div className="self-stretch flex flex-col justify-start items-center gap-3">
              <div className="self-stretch justify-start text-neutral-800 text-3xl font-medium font-['Poppins'] leading-10">Something went wrong!</div>
              <div className="self-stretch text-center justify-start text-neutral-600 text-lg font-normal font-['Poppins'] leading-snug">Sorry, We can&apos;t find this page</div>
            </div>
            <Link href="/" className="px-4 py-2.5 bg-[#76C043] rounded-[999px] inline-flex justify-center items-center gap-2.5 cursor-pointer">
              <div className="text-center justify-start text-white text-lg font-normal font-['Inter'] leading-7">Go back to Home page</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}