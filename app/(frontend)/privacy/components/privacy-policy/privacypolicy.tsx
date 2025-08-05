import React from 'react'

interface PrivacySection {
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

const privacyData: PrivacySection[] = [
  {
    id: "information-collect",
    title: "1. Information We Collect",
    content: "We collect several types of information from and about users of our Services:",
    subsections: [
      {
        label: "Personal Information:",
        text: "Information that identifies you personally, including your name, email address, phone number, postal address, date of birth, passport information, and emergency contact details when you create an account, book services, or communicate with us."
      },
      {
        label: "Payment Information:",
        text: "Credit card numbers, billing addresses, and other payment-related information necessary to process transactions. This information is encrypted and processed securely through our payment processors."
      },
      {
        label: "Usage Data:",
        text: "Information about how you access and use our Services, including your IP address, browser type, device information, operating system, referring/exit pages, and clickstream data."
      },
      {
        label: "Location Information:",
        text: "With your consent, we may collect precise location data from your device to provide location-based services and enhance your travel experience."
      },
      {
        label: "Communications:",
        text: "Records of your communications with us, including customer service interactions, feedback, and any content you submit through our Services."
      }
    ]
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: "We use the information we collect for the following business purposes:",
    listItems: [
      "To provide, maintain, and improve our Services, including processing bookings, arranging travel packages, and facilitating sports event experiences",
      "To communicate with you about your bookings, account status, and provide customer support",
      "To send you marketing communications, promotional offers, and service updates (with your consent where required)",
      "To analyze usage patterns and improve our website functionality and user experience",
      "To prevent fraud, ensure security, and comply with legal obligations",
      "To personalize your experience and provide targeted recommendations based on your preferences"
    ]
  },
  {
    id: "legal-basis",
    title: "3. Legal Basis for Processing",
    content: "We process your personal information based on the following legal grounds:",
    listItems: [
      "Contract performance: To fulfill our contractual obligations when you book our services",
      "Legitimate interests: To improve our services, prevent fraud, and ensure security",
      "Consent: For marketing communications and optional features (which you can withdraw at any time)",
      "Legal compliance: To meet regulatory requirements and legal obligations"
    ]
  },
  {
    id: "information-sharing",
    title: "4. Information Sharing and Disclosure",
    content: "We may share your personal information in the following circumstances:",
    subsections: [
      {
        label: "Service Providers:",
        text: "With trusted third-party vendors who assist us in providing services, including airlines, hotels, event organizers, payment processors, and technology providers, under strict confidentiality agreements."
      },
      {
        label: "Legal Requirements:",
        text: "When required by law, court order, or government regulation, or to protect our rights, property, or safety, or that of our users or the public."
      },
      {
        label: "Business Transfers:",
        text: "In connection with any merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity."
      },
      {
        label: "With Your Consent:",
        text: "We may share information for any other purpose with your explicit consent."
      }
    ]
  },
  {
    id: "data-security",
    title: "5. Data Security and Protection",
    content: "We implement comprehensive security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our security practices include encryption of sensitive data, secure data transmission protocols, regular security assessments, access controls, and employee training on data protection. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security."
  },
  {
    id: "cookies",
    title: "6. Cookies and Tracking Technologies",
    content: "We use cookies, web beacons, and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand user preferences. Types of cookies we use include:",
    listItems: [
      "Essential cookies: Necessary for website functionality and security",
      "Performance cookies: Help us understand how visitors interact with our website",
      "Functionality cookies: Enable personalized features and remember your preferences",
      "Marketing cookies: Used to deliver relevant advertisements and track campaign effectiveness",
      "You can control cookie settings through your browser preferences or our cookie consent tool."
    ]
  },
  {
    id: "international-transfers",
    title: "7. International Data Transfers",
    content: "As we operate globally and work with international partners, your personal information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers, including adequacy decisions, standard contractual clauses, or other approved transfer mechanisms. We will take reasonable steps to ensure your data receives adequate protection in accordance with applicable data protection laws."
  },
  {
    id: "data-retention",
    title: "8. Data Retention",
    content: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Retention periods vary based on the type of information and the purpose for which it was collected. We will securely delete or anonymize your information when it is no longer needed."
  },
  {
    id: "your-rights",
    title: "9. Your Rights and Choices",
    content: "Depending on your location and applicable laws, you may have the following rights regarding your personal information:",
    listItems: [
      "Access: Request copies of your personal data we hold",
      "Rectification: Request correction of inaccurate or incomplete information",
      "Erasure: Request deletion of your personal data under certain circumstances",
      "Portability: Request transfer of your data to another service provider",
      "Restriction: Request limitation of processing under certain conditions",
      "Objection: Object to processing based on legitimate interests or for direct marketing",
      "Withdraw consent: Withdraw consent for processing where consent is the legal basis"
    ]
  },
  {
    id: "third-party",
    title: "10. Third-Party Links and Services",
    content: "Our Services may contain links to third-party websites, applications, or services that are not owned or controlled by GoGame. This Privacy Policy does not apply to such third-party services. We are not responsible for the privacy practices or content of these external sites and encourage you to review their privacy policies before providing any personal information. We advise you to exercise caution and review the privacy statements applicable to the third-party websites and services you use."
  },
  {
    id: "children-privacy",
    title: "11. Children's Privacy",
    content: "Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to remove that information from our servers. If you believe we might have information from or about a child under 18, please contact us immediately."
  },
  {
    id: "policy-changes",
    title: "12. Changes to This Privacy Policy",
    content: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on our website and indicating the date of the last revision. For significant changes, we may provide additional notice such as email notification. Your continued use of our Services after the effective date of any changes constitutes your acceptance of the revised Privacy Policy."
  }
];

const contactInfo: ContactInfo[] = [
  { label: "Email Address:", value: "privacy@gogame.co" },
  { label: "Customer Support:", value: "support@gogame.co" },
  { label: "Website:", value: "https://www.gogame.co" },
  { label: "Last Updated:", value: "January 2025" }
];

export default function PrivacyPolicy() {
  return (
    <div className='w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'>
      <div className="w-full flex flex-col justify-start items-center gap-8 lg:gap-12 py-12 sm:py-16 lg:py-[100px]">
        <div className="self-stretch flex flex-col justify-start items-start gap-8 lg:gap-12">
          {/* Header */}
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="self-stretch justify-start text-zinc-950 text-xl sm:text-2xl font-medium font-['Poppins'] leading-7 sm:leading-9">
              Privacy Policy for GoGame
            </div>
            <div className="self-stretch justify-start text-neutral-600 text-base sm:text-lg font-normal font-['Poppins'] leading-relaxed sm:leading-loose">
              GoGame (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, process, and disclose your personal information when you access or use our website, mobile applications, or services (collectively, the &quot;Services&quot;). By using our Services, you acknowledge that you have read and understood this Privacy Policy.
            </div>
          </div>

          {/* Privacy Sections */}
          <div className="self-stretch flex flex-col justify-start items-start gap-8 lg:gap-12">
            {privacyData.map((section) => (
              <div key={section.id} className="self-stretch flex flex-col justify-start items-start gap-4 sm:gap-6">
                <div className="justify-center text-zinc-950 text-2xl sm:text-3xl font-medium font-['Poppins'] leading-8 sm:leading-10">
                  {section.title}
                </div>
                
                <div className="self-stretch justify-start text-neutral-600 text-base sm:text-lg font-normal font-['Poppins'] leading-relaxed sm:leading-loose">
                  {section.content}
                </div>

                {/* Subsections with labels */}
                {section.subsections && (
                  <div className="self-stretch flex flex-col justify-start items-start gap-3">
                    {section.subsections.map((subsection, index) => (
                      <div key={index} className="self-stretch justify-start">
                        <span className="text-neutral-600 text-base sm:text-lg font-semibold font-['Poppins'] leading-relaxed sm:leading-loose">
                          {subsection.label}
                        </span>
                        <span className="text-neutral-600 text-base sm:text-lg font-normal font-['Poppins'] leading-relaxed sm:leading-loose">
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
                      <div key={index} className="self-stretch justify-start text-neutral-600 text-base sm:text-lg font-normal font-['Poppins'] leading-relaxed sm:leading-loose">
                        • {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Contact Information Section */}
            <div className="self-stretch flex flex-col justify-start items-start gap-4 sm:gap-6">
              <div className="self-stretch justify-center text-zinc-950 text-2xl sm:text-3xl font-medium font-['Poppins'] leading-8 sm:leading-10">
                13. Contact Information
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="w-full justify-start text-neutral-600 text-base sm:text-lg font-normal font-['Poppins'] leading-relaxed sm:leading-loose">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us using the information below:
                </div>
                {contactInfo.map((contact, index) => (
                  <div key={index} className="flex flex-col justify-start items-start gap-3">
                    <div className="w-full justify-start text-neutral-600 text-base sm:text-lg font-normal font-['Inter'] leading-6 sm:leading-7">
                      {contact.label}
                    </div>
                    <div className="w-full justify-start text-zinc-950 text-lg sm:text-xl font-medium font-['Inter'] leading-relaxed sm:leading-loose">
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
