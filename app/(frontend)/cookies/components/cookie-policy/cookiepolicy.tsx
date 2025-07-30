import React from 'react'

interface CookieSection {
  id: string;
  title: string;
  content: string;
  subsections?: {
    label: string;
    text: string;
  }[];
  listItems?: string[];
}

const cookieData: CookieSection[] = [
  {
    id: "what-are-cookies",
    title: "1. What Are Cookies?",
    content: "Cookies are small text files that are stored on your device when you visit a website. They allow the website to recognize your device and collect information about your preferences, making your online experience smoother and more personalized."
  },
  {
    id: "types-of-cookies",
    title: "2. Types of Cookies We Use",
    content: "We use the following types of cookies on our website:",
    subsections: [
      {
        label: "Necessary Cookies:",
        text: "These cookies are essential for the operation of the website and enable basic functions such as page navigation and access to secure areas of the site. Without these cookies, the website cannot function properly."
      },
      {
        label: "Preference Cookies:",
        text: "These cookies allow the website to remember your preferences, such as language settings or your previous actions, to provide a more personalized experience."
      },
      {
        label: "Analytics Cookies:",
        text: "These cookies collect information about how visitors use our website, such as which pages are visited the most and whether any error messages are shown. We use this information to improve the performance of our website."
      },
      {
        label: "Marketing/Advertising Cookies:",
        text: "These cookies are used to deliver relevant advertisements to users and measure the effectiveness of marketing campaigns. They track your browsing habits and may be used by third-party advertising networks to display personalized ads on other websites."
      }
    ]
  },
  {
    id: "how-we-use-cookies",
    title: "3. How We Use Cookies",
    content: "We use cookies for the following purposes:",
    listItems: [
      "To provide you with a personalized browsing experience.",
      "To analyze website usage and improve our services.",
      "To remember your preferences and settings for future visits.",
      "To display relevant advertisements based on your interests."
    ]
  },
  {
    id: "third-party-cookies",
    title: "4. Third-Party Cookies",
    content: "In addition to our own cookies, we may also use third-party cookies from service providers who assist us in analyzing website usage or providing ads. These third parties may include advertising networks and analytics services such as Google Analytics."
  },
  {
    id: "cookie-preferences",
    title: "5. Your Cookie Preferences",
    content: "You have control over the cookies that are set on your device. You can manage cookie settings through your web browser by:",
    subsections: [
      {
        label: "Accepting or declining cookies:",
        text: "Most browsers automatically accept cookies, but you can change your browser settings to decline cookies or alert you when a cookie is being sent."
      },
      {
        label: "Deleting cookies:",
        text: "You can delete cookies stored on your device at any time by adjusting your browser settings."
      }
    ]
  },
  {
    id: "control-cookies",
    title: "6. How to Control Cookies",
    content: "You can manage your cookie preferences through your browser settings. Here's how you can do it in common browsers:",
    subsections: [
      {
        label: "Google Chrome:",
        text: "Go to Settings > Privacy and security > Cookies and other site data > See all cookies and site data."
      },
      {
        label: "Mozilla Firefox:",
        text: "Go to Options > Privacy & Security > Cookies and Site Data."
      },
      {
        label: "Safari:",
        text: "Go to Preferences > Privacy > Manage Website Data."
      },
      {
        label: "Microsoft Edge:",
        text: "Go to Settings > Cookies and site permissions."
      }
    ]
  },
  {
    id: "policy-changes",
    title: "Changes to This Cookie Policy",
    content: "We may update this Cookie Policy from time to time. When we make changes, we will post the updated policy on our website and update the date at the top of the page. We encourage you to review this policy periodically to stay informed about how we use cookies."
  }
];

export default function CookiePolicy() {
  return (
    <div className='w-full max-w-[1200px] mx-auto'>
      <div className="w-full flex flex-col justify-start items-center gap-12 py-[100px]">
        <div className="self-stretch flex flex-col justify-start items-start gap-12">
          {/* Header */}
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="self-stretch justify-start text-zinc-950 text-2xl font-medium font-['Poppins'] leading-9">
              Cookie Policy for GoGame
            </div>
            <div className="self-stretch justify-start text-neutral-600 text-lg font-normal font-['Poppins'] leading-loose">
              At GoGame, we use cookies to enhance your experience on our website and to analyze how users interact with our site. This Cookie Policy explains what cookies are, how we use them, and your options for managing cookies.
            </div>
          </div>

          {/* Cookie Policy Sections */}
          <div className="self-stretch flex flex-col justify-start items-start gap-12">
            {cookieData.map((section) => (
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
          </div>
        </div>
      </div>
    </div>
  )
}
