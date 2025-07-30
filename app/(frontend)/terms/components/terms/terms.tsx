import React from 'react'

interface TermsSection {
  id: string;
  title: string;
  content: string;
  subsections?: {
    label: string;
    text: string;
  }[];
  listItems?: string[];
}

interface ContactInfo {
  label: string;
  value: string;
}

const termsData: TermsSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: "Welcome to GoGame, a surprise travel platform specializing in sports experiences. By accessing or using our website, you agree to comply with and be bound by these terms and conditions. Please read them carefully before using our services."
  },
  {
    id: "website-usage",
    title: "2. Website Usage",
    content: "The GoGame website is created but not publicly visible at this stage. It is in a pre-launch phase and is in waitlist mode.",
    listItems: [
      "You may subscribe with your email to receive notifications and be among the first to access our website once it's fully launched."
    ]
  },
  {
    id: "booking-process",
    title: "3. Booking Process",
    content: "GoGame allows users to select their desired sport, departure city, and match level (standard or premium). Based on your selections, GoGame will organize your entire travel package, including flights, hotel accommodations, and match tickets.",
    listItems: [
      "The destination or event details will remain undisclosed until 48 hours before departure."
    ]
  },
  {
    id: "surprise-pack",
    title: "4. Surprise Pack",
    content: "The surprise pack includes a match ticket (football or basketball), flights, and hotel accommodations for the selected destination.",
    listItems: [
      "Variations to the surprise pack include different sports and leagues, which will be clearly presented when you make your selection."
    ]
  },
  {
    id: "payment-terms",
    title: "5. Payment Terms",
    content: "By purchasing the surprise pack, you agree to pay the fixed price for the entire travel package, which includes the match ticket, flights, and hotel.",
    listItems: [
      "Payments must be made in full at the time of booking.",
      "Prices are fixed and non-refundable once the booking is confirmed."
    ]
  },
  {
    id: "privacy-policy",
    title: "6. Privacy Policy",
    content: "GoGame collects personal information, including but not limited to your name, email, and preferences for travel arrangements. This information is used to process your bookings and provide updates regarding your surprise trip.",
    listItems: [
      "We respect your privacy and will not share your personal data with third parties except for travel-related services."
    ]
  },
  {
    id: "cancellations-refunds",
    title: "7. Cancellations and Refunds",
    content: "All bookings are final and non-refundable once confirmed. We understand that circumstances may change, but due to the nature of our surprise travel packages and advance bookings required for flights, hotels, and event tickets, we cannot offer monetary refunds.",
    listItems: [
      "In case of unforeseen circumstances that affect the trip, GoGame will work with the user to offer alternatives within reason, but no monetary refunds will be provided."
    ]
  },
  {
    id: "limitation-liability",
    title: "8. Limitation of Liability",
    content: "GoGame is not responsible for any delays, cancellations, or issues related to flights, hotels, or match tickets that are beyond our control.",
    listItems: [
      "Users agree that GoGame will not be liable for any loss or damage arising from their use of the website or bookings made."
    ]
  },
  {
    id: "website-availability",
    title: "9. Website Availability",
    content: "GoGame strives to maintain the website and services without interruption. However, we cannot guarantee that the website will be free from errors or will operate continuously without downtime for maintenance.",
    listItems: [
      "We reserve the right to modify or discontinue any part of the website at any time."
    ]
  },
  {
    id: "governing-law",
    title: "10. Governing Law",
    content: "These terms and conditions are governed by the laws of the jurisdiction in which GoGame operates."
  },
  {
    id: "changes-terms",
    title: "11. Changes to Terms",
    content: "GoGame reserves the right to change or update these terms at any time. You will be notified of any changes, and continued use of the website after such updates signifies your acceptance of the modified terms."
  }
];

const contactInfo: ContactInfo[] = [
  { label: "Email Address:", value: "legal@gogame.co" },
  { label: "Customer Support:", value: "support@gogame.co" },
  { label: "Website:", value: "https://www.gogame.co" },
  { label: "Last Updated:", value: "May 2025" }
];

export default function Terms() {
  return (
    <div className='w-full max-w-[1200px] mx-auto'>
      <div className="w-full flex flex-col justify-start items-center gap-12 py-[100px]">
        <div className="self-stretch flex flex-col justify-start items-start gap-12">
          {/* Header */}
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="self-stretch justify-start text-zinc-950 text-2xl font-medium font-['Poppins'] leading-9">
              Terms and Conditions for GoGame
            </div>
            <div className="self-stretch justify-start text-neutral-600 text-lg font-normal font-['Poppins'] leading-loose">
              Welcome to GoGame. By accessing or using our website, you agree to the following Terms and Conditions. If you have any concerns or do not agree with these terms, we kindly ask that you refrain from using our services.
            </div>
          </div>

          {/* Terms Sections */}
          <div className="self-stretch flex flex-col justify-start items-start gap-12">
            {termsData.map((section) => (
              <div key={section.id} className="self-stretch flex flex-col justify-start items-start gap-6">
                <div className="justify-center text-zinc-950 text-3xl font-medium font-['Poppins'] leading-10">
                  {section.title}
                </div>
                
                <div className="self-stretch justify-start text-neutral-600 text-lg font-normal font-['Poppins'] leading-loose">
                  {section.content}
                </div>

                {/* Subsections with labels */}
                {section.subsections && (
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    {section.subsections.map((subsection, index) => (
                      <div key={index} className="self-stretch justify-start">
                        <span className="text-neutral-600 text-lg font-semibold font-['Poppins'] leading-loose">
                          {subsection.label}
                        </span>
                        <span className="text-neutral-600 text-lg font-normal font-['Poppins'] leading-loose">
                          {' '}{subsection.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* List items */}
                {section.listItems && (
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    {section.listItems.map((item, index) => (
                      <div key={index} className="self-stretch justify-start text-neutral-600 text-lg font-normal font-['Poppins'] leading-loose">
                        • {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Contact Information Section */}
            <div className="self-stretch flex flex-col justify-start items-start gap-6">
              <div className="self-stretch justify-center text-zinc-950 text-3xl font-medium font-['Poppins'] leading-10">
                12. Contact Information
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="w-[1180px] justify-start text-neutral-600 text-lg font-normal font-['Poppins'] leading-loose">
                  If you have any questions, concerns, or requests regarding these Terms and Conditions, please contact us using the information below:
                </div>
                {contactInfo.map((contact, index) => (
                  <div key={index} className="flex flex-col justify-start items-start gap-3">
                    <div className="w-[1180px] justify-start text-neutral-600 text-lg font-normal font-['Inter'] leading-7">
                      {contact.label}
                    </div>
                    <div className="w-[1180px] justify-start text-zinc-950 text-xl font-medium font-['Inter'] leading-loose">
                      {contact.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
