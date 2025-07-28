import React from "react";

export default function Mailus() {
  return (
    <div className="w-full max-w-[1200px] mx-auto py-10 px-4 md:py-20">
      <div
        className="w-full h-auto md:h-[537px] p-4 md:p-8 rounded-3xl flex flex-col justify-center items-center gap-2.5"
        style={{
          backgroundImage: "url('/homepage/faqbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
          <div className="w-full md:w-[60%] flex flex-col justify-start items-start gap-6 md:gap-24">
            <div className="w-full text-center md:text-left justify-start text-white text-3xl md:text-6xl font-semibold font-['Inter'] leading-tight md:leading-[67.20px]">
              Sign up now and be the first to travel with GoGame
            </div>
          </div>
          <div className="w-full md:w-[384px] p-3 bg-white rounded-lg backdrop-blur-[5px] flex flex-col justify-start items-start gap-3">
            <div className="w-full p-3 bg-gray-50 rounded-xl flex flex-col justify-end items-start gap-3">
              <div className="w-full flex flex-col justify-center items-start gap-1">
                <div className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
                  Name
                </div>
                <div className="w-full h-11 px-3.5 py-1.5 bg-white rounded outline-1 outline-offset-[-1px] outline-neutral-300 flex justify-start items-center gap-2.5">
                  <input 
                    type="text"
                    placeholder="Enter your name"
                    className="w-full text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed bg-transparent outline-none"
                  />
                </div>
              </div>
              <div className="w-full flex justify-start items-start gap-3">
                <div className="w-full flex flex-col justify-center items-start gap-1">
                  <div className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
                    Email
                  </div>
                  <div className="w-full h-11 px-3.5 py-1.5 bg-white rounded outline-1 outline-offset-[-1px] outline-neutral-300 flex justify-start items-center gap-2.5">
                    <input 
                      type="email"
                      placeholder="example@gmail.com"
                      className="w-full text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-1">
                <div className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
                  Message
                </div>
                <textarea 
                  placeholder="Enter your message"
                  className="w-full h-36 px-3.5 py-1.5 bg-white rounded border border-neutral-300 text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed resize-none outline-none"
                />
              </div>
              <button className="w-full h-14 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors">
                <span className="text-white text-base font-normal font-['Inter']">
                  Send
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
