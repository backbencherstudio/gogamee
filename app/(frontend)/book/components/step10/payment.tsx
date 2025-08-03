import React from 'react'

export default function Payment() {
  return (
    <div className="w-[894px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-6">
  <div className="self-stretch flex flex-col justify-center items-start gap-3">
    <div className="self-stretch h-12 flex flex-col justify-start items-start gap-3">
      <div className="justify-center text-neutral-800 text-3xl font-semibold font-['Poppins'] leading-10">Payment Informations</div>
    </div>
    <div className="self-stretch flex flex-col justify-start items-start gap-6">
      <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-5">
        <div className="self-stretch inline-flex justify-start items-center gap-2">
          <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">Payment Method</div>
        </div>
        <div className="self-stretch p-3 outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-5">
          <div className="self-stretch py-4 rounded inline-flex justify-between items-center">
            <div className="flex justify-start items-center gap-2.5">
              <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">Credit Card/Debit Card</div>
            </div>
            <div className="flex justify-start items-center gap-3">
              <div className="w-16 p-2 bg-white rounded-[2.92px] outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-start items-start gap-2">
                <img className="self-stretch h-4" src="https://placehold.co/55x17" />
              </div>
              <div className="w-16 h-8 p-2 bg-white rounded-[2.91px] outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                <img className="w-10 h-6" src="https://placehold.co/40x25" />
              </div>
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-5">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="self-stretch inline-flex justify-start items-start gap-6">
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Name on Card</div>
                  <div className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 inline-flex justify-start items-center gap-2.5">
                    <div className="justify-start text-zinc-500 text-base font-normal font-['Poppins'] leading-normal">Enter your name</div>
                  </div>
                </div>
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Expiry</div>
                  <div className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 inline-flex justify-start items-center gap-2.5">
                    <div className="justify-start text-zinc-500 text-base font-normal font-['Poppins'] leading-normal">08/2025</div>
                  </div>
                </div>
              </div>
              <div className="self-stretch inline-flex justify-start items-start gap-4">
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Card number</div>
                  <div className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 inline-flex justify-start items-center gap-2.5">
                    <div className="w-44 justify-start text-zinc-500 text-base font-normal font-['Poppins'] leading-normal">1234 5678 9012 3456</div>
                  </div>
                </div>
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">CVV</div>
                  <div className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 inline-flex justify-start items-center gap-2.5">
                    <div className="justify-start text-zinc-500 text-base font-normal font-['Poppins'] leading-normal">....</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch p-4 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-2.5">
            <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">Google Pay</div>
          </div>
          <div className="flex justify-start items-center gap-2.5">
            <div className="p-2 bg-white rounded outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-start items-start gap-2">
              <img className="w-24 h-4" src="https://placehold.co/91x17" />
            </div>
          </div>
        </div>
        <div className="self-stretch p-4 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-2.5">
            <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">Apple Pay</div>
          </div>
          <div className="w-20 flex justify-start items-center gap-2.5">
            <div className="flex-1 p-2 bg-white rounded outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
              <img className="w-10 h-4" src="https://placehold.co/41x17" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div className="self-stretch flex flex-col justify-center items-start gap-3">
    <div className="self-stretch flex flex-col justify-start items-start gap-6">
      <div className="w-44 h-11 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5">
        <div className="text-center justify-start text-white text-base font-normal font-['Inter']">Confirm</div>
      </div>
    </div>
  </div>
</div>
  )
}
