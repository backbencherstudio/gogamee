import React from "react";

const basketballData = [
  {
    category: "Match Ticket",
    standard: "Standard seat (upper and lateral seats)",
    premium: "VIP seat",
  },
  {
    category: "Flights",
    standard: "Round-trip from a major city",
    premium: "Round-trip from a major city",
  },
  {
    category: "Hotel",
    standard: "3-star hotel or apartment",
    premium: "4–5 star hotel in premium location",
  },
  {
    category: "Transfers",
    standard: "Public transport or shuttle",
    premium: "Private transfers (airport & stadium)",
  },
  {
    category: "Welcome Pack",
    standard: "Travel guide + surprise gift",
    premium: "Official team jersey + premium goodies",
  },
  {
    category: "Surprise Reveal",
    standard:
      "Destination revealed 48h before. A secret clue before revealing the destination.",
    premium:
      "Destination revealed 48h before. A secret clue before revealing the destination.",
  },
  {
    category: "Starting Price",
    standard: "From 279€",
    premium: "From 1279€",
  },
];

const footballData = [
  {
    category: "Match Ticket",
    standard: "General or lateral section",
    premium: "Premium or central tribune seat",
  },
  {
    category: "Flights",
    standard: "Round-trip from a major city",
    premium: "Round-trip from a major city",
  },
  {
    category: "Hotel",
    standard: "3-star hotel or apartment",
    premium: "4–5 star hotel near stadium or city center",
  },
  {
    category: "Transfers",
    standard: "Public transport or shuttle",
    premium: "Private transfers (airport & stadium)",
  },
  {
    category: "Welcome Pack",
    standard: "Exclusive GoGame merchandise",
    premium: "Official team jersey + premium goodies",
  },
  {
    category: "Surprise Reveal",
    standard:
      "Destination revealed 48h before. A secret clue before revealing the destination.",
    premium:
      "Destination revealed 48h before. A secret clue before revealing the destination.",
  },
  {
    category: "Starting Price",
    standard: "From 299€",
    premium: "From 1399€",
  },
];

const packData = {
    // Features listed as rows
    features: [
      { label: "Match Ticket", key: "ticket" },
      { label: "Flights", key: "flights" },
      { label: "Hotel", key: "hotel" },
      { label: "Transfers", key: "transfers" },
      { label: "Welcome Pack", key: "welcomePack" },
      { label: "Surprise Reveal", key: "reveal" },
      { label: "Starting Price", key: "price" },
    ],
  
    // Column data for each pack
    packs: [
      {
        id: "standard",
        typeLabel: "Standard pack",
        title: "Standard GoGame Slam",
        bgColor: "bg-[#F1F9EC]",
        borderColor: "outline-[#76C043]",
        textColor: "text-[#76C043]",
        details: {
          ticket: "Standard seat (upper and lateral seats)",
          flights: "Round-trip from a major city",
          hotel: "3-star hotel or apartment",
          transfers: "Public transport or shuttle",
          welcomePack: "Travel guide + surprise gift",
          reveal: "Destination revealed 48h before. A secret clue before revealing the destination.",
          price: "From 279€",
        },
      },
      {
        id: "premium",
        typeLabel: "Premium pack",
        title: "Premium GoGame MVP",
        bgColor: "bg-[#F1F9EC]",
        borderColor: "outline-[#76C043]",
        textColor: "text-[#76C043]",
        details: {
          ticket: "VIP seat",
          flights: "Round-trip from a major city",
          hotel: "4—5 star hotel in premium location",
          transfers: "Private transfers (airport & stadium)",
          welcomePack: "Official team jersey + premium goodies",
          reveal: "Destination revealed 48h before. A secret clue before revealing the destination.",
          price: "From 1279€",
        },
      },
    ],
  };
  

export default function PackageTable() {

    const { features, packs } = packData;

    return (
    <div className="w-full  py-24 bg-neutral-50 inline-flex flex-col justify-start items-center gap-12">
      <div className="flex flex-col justify-start items-center gap-6">
        <div className="flex flex-col justify-start items-center gap-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="text-center justify-start text-zinc-950 text-5xl font-semibold font-['Poppins'] leading-[57.60px]">Types of packs offered</div>
            </div>
          </div>
        </div>
        <div className="inline-flex justify-start items-center gap-5">
          <div className="justify-start text-zinc-500 text-lg font-normal font-['Poppins'] leading-loose">Football</div>
          <div data-pressed="True" data-size="lg" data-state="Default" className="w-11 h-6 p-0.5 bg-[#76C043] rounded-xl flex justify-end items-center overflow-hidden">
            <div className="w-5 h-5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10)]" />
          </div>
          <div className="justify-start text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">Basketball</div>
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="self-stretch">
          {/* --- Table starts here, do not edit below this line --- */}
        <div className="w-full max-w-[1200px] mx-auto my-12">

        <div className="overflow-x-auto rounded outline-[6px] outline-offset-[-6px] outline-green-50 bg-white">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="w-96 border-b border-slate-200">
              <th className="w-96 self-stretch text-start  pl-6 text-neutral-800 text-3xl font-bold font-['Poppins'] whitespace-nowrap leading-loose border-r border-slate-200">
                Compare packs
              </th>
              {packs.map((pack, idx) => (
                <th
                  key={pack.id}
                  className={`w-96 p-6 bg-white align-bottom ${idx < packs.length - 1 ? 'border-r border-slate-200' : ''}`}
                >
                  <div className="flex flex-col items-start gap-2">
                    <div
                      className={`inline-block px-3 py-2 ${pack.bgColor} rounded-4xl outline-1 outline-offset-[-1px] ${pack.borderColor} flex items-center justify-center gap-2.5 mb-1`}
                    >
                      <span className={`${pack.textColor} text-sm font-medium font-['Poppins'] flex items-center justify-center`}>
                        {pack.typeLabel}
                      </span>
                    </div>
                    <span className="text-2xl font-bold font-['Poppins'] text-zinc-950">
                      {pack.title}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.key}>
                <th className="w-96 p-6 border-b border-slate-200 text-lg font-medium font-['Poppins'] text-neutral-800 text-left bg-white align-middle border-r ">
                  {feature.label}
                </th>
                {packs.map((pack, idx) => {
                  const value = pack.details[feature.key as keyof typeof pack.details];
                  return (
                    <td
                      key={pack.id + '-' + feature.key}
                      className={`w-96 p-6 border-b border-slate-200 text-base font-normal font-['Poppins'] text-neutral-800 bg-white align-middle ${idx < packs.length - 1 ? 'border-r border-slate-200' : ''}`}
                    >
                      {feature.key === 'price' ? (
                        <>
                          <span className="font-normal">From </span>
                          <span className="font-semibold">{value.replace('From ', '')}</span>
                        </>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
          {/* --- Table ends here, do not edit above this line --- */}
        </div>
      </div>
      <div className="w-44 px-4 py-2.5 bg-[#76C043] rounded-[999px] inline-flex justify-center items-center gap-2.5">
        <div className="text-center justify-start text-white text-lg font-normal font-['Inter'] leading-7">Book Now</div>
      </div>
    </div>
  );
}
