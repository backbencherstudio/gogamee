// This script initializes the legal pages database with existing static content
// Run this once to migrate existing content to the database

const privacyContentEN = `
<div>
  <h2>Privacy Policy for GoGame</h2>
  <p>GoGame ("we," "our," or "us") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, process, and disclose your personal information when you access or use our website, mobile applications, or services (collectively, the "Services"). By using our Services, you acknowledge that you have read and understood this Privacy Policy.</p>
  
  <h3>1. Information We Collect</h3>
  <p>We collect several types of information from and about users of our Services:</p>
  <p><strong>Personal Information:</strong> Information that identifies you personally, including your name, email address, phone number, postal address, date of birth, passport information, and emergency contact details when you create an account, book services, or communicate with us.</p>
  <p><strong>Payment Information:</strong> Credit card numbers, billing addresses, and other payment-related information necessary to process transactions. This information is encrypted and processed securely through our payment processors.</p>
  <p><strong>Usage Data:</strong> Information about how you access and use our Services, including your IP address, browser type, device information, operating system, referring/exit pages, and clickstream data.</p>
  <p><strong>Location Information:</strong> With your consent, we may collect precise location data from your device to provide location-based services and enhance your travel experience.</p>
  <p><strong>Communications:</strong> Records of your communications with us, including customer service interactions, feedback, and any content you submit through our Services.</p>
  
  <h3>2. How We Use Your Information</h3>
  <p>We use the information we collect for the following business purposes:</p>
  <ul>
    <li>To provide, maintain, and improve our Services, including processing bookings, arranging travel packages, and facilitating sports event experiences</li>
    <li>To communicate with you about your bookings, account status, and provide customer support</li>
    <li>To send you marketing communications, promotional offers, and service updates (with your consent where required)</li>
    <li>To analyze usage patterns and improve our website functionality and user experience</li>
    <li>To prevent fraud, ensure security, and comply with legal obligations</li>
    <li>To personalize your experience and provide targeted recommendations based on your preferences</li>
  </ul>
  
  <h3>3. Legal Basis for Processing</h3>
  <p>We process your personal information based on the following legal grounds:</p>
  <ul>
    <li>Contract performance: To fulfill our contractual obligations when you book our services</li>
    <li>Legitimate interests: To improve our services, prevent fraud, and ensure security</li>
    <li>Consent: For marketing communications and optional features (which you can withdraw at any time)</li>
    <li>Legal compliance: To meet regulatory requirements and legal obligations</li>
  </ul>
  
  <h3>4. Information Sharing and Disclosure</h3>
  <p>We may share your personal information in the following circumstances:</p>
  <p><strong>Service Providers:</strong> With trusted third-party vendors who assist us in providing services, including airlines, hotels, event organizers, payment processors, and technology providers, under strict confidentiality agreements.</p>
  <p><strong>Legal Requirements:</strong> When required by law, court order, or government regulation, or to protect our rights, property, or safety, or that of our users or the public.</p>
  <p><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
  <p><strong>With Your Consent:</strong> We may share information for any other purpose with your explicit consent.</p>
  
  <h3>5. Data Security and Protection</h3>
  <p>We implement comprehensive security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our security practices include encryption of sensitive data, secure data transmission protocols, regular security assessments, access controls, and employee training on data protection. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
  
  <h3>6. Cookies and Tracking Technologies</h3>
  <p>We use cookies, web beacons, and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand user preferences. Types of cookies we use include:</p>
  <ul>
    <li>Essential cookies: Necessary for website functionality and security</li>
    <li>Performance cookies: Help us understand how visitors interact with our website</li>
    <li>Functionality cookies: Enable personalized features and remember your preferences</li>
    <li>Marketing cookies: Used to deliver relevant advertisements and track campaign effectiveness</li>
    <li>You can control cookie settings through your browser preferences or our cookie consent tool.</li>
  </ul>
  
  <h3>7. International Data Transfers</h3>
  <p>As we operate globally and work with international partners, your personal information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers, including adequacy decisions, standard contractual clauses, or other approved transfer mechanisms. We will take reasonable steps to ensure your data receives adequate protection in accordance with applicable data protection laws.</p>
  
  <h3>8. Data Retention</h3>
  <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Retention periods vary based on the type of information and the purpose for which it was collected. We will securely delete or anonymize your information when it is no longer needed.</p>
  
  <h3>9. Your Rights and Choices</h3>
  <p>Depending on your location and applicable laws, you may have the following rights regarding your personal information:</p>
  <ul>
    <li>Access: Request copies of your personal data we hold</li>
    <li>Rectification: Request correction of inaccurate or incomplete information</li>
    <li>Erasure: Request deletion of your personal data under certain circumstances</li>
    <li>Portability: Request transfer of your data to another service provider</li>
    <li>Restriction: Request limitation of processing under certain conditions</li>
    <li>Objection: Object to processing based on legitimate interests or for direct marketing</li>
    <li>Withdraw consent: Withdraw consent for processing where consent is the legal basis</li>
  </ul>
  
  <h3>10. Third-Party Links and Services</h3>
  <p>Our Services may contain links to third-party websites, applications, or services that are not owned or controlled by GoGame. This Privacy Policy does not apply to such third-party services. We are not responsible for the privacy practices or content of these external sites and encourage you to review their privacy policies before providing any personal information. We advise you to exercise caution and review the privacy statements applicable to the third-party websites and services you use.</p>
  
  <h3>11. Children's Privacy</h3>
  <p>Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to remove that information from our servers. If you believe we might have information from or about a child under 18, please contact us immediately.</p>
  
  <h3>12. Changes to This Privacy Policy</h3>
  <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on our website and indicating the date of the last revision. For significant changes, we may provide additional notice such as email notification. Your continued use of our Services after the effective date of any changes constitutes your acceptance of the revised Privacy Policy.</p>
  
  <h3>13. Contact Information</h3>
  <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us using the information below:</p>
  <p><strong>Email Address:</strong> privacy@gogame.co</p>
  <p><strong>Customer Support:</strong> support@gogame.co</p>
  <p><strong>Website:</strong> https://www.gogame.co</p>
  <p><strong>Last Updated:</strong> January 2025</p>
</div>
`;

const cookieContentEN = `
<div>
  <h2>Cookie Policy for GoGame</h2>
  <p>At GoGame, we use cookies to enhance your experience on our website and to analyze how users interact with our site. This Cookie Policy explains what cookies are, how we use them, and your options for managing cookies.</p>
  
  <h3>1. What Are Cookies?</h3>
  <p>Cookies are small text files that are stored on your device when you visit a website. They allow the website to recognize your device and collect information about your preferences, making your online experience smoother and more personalized.</p>
  
  <h3>2. Types of Cookies We Use</h3>
  <p>We use the following types of cookies on our website:</p>
  <p><strong>Necessary Cookies:</strong> These cookies are essential for the operation of the website and enable basic functions such as page navigation and access to secure areas of the site. Without these cookies, the website cannot function properly.</p>
  <p><strong>Preference Cookies:</strong> These cookies allow the website to remember your preferences, such as language settings or your previous actions, to provide a more personalized experience.</p>
  <p><strong>Analytics Cookies:</strong> These cookies collect information about how visitors use our website, such as which pages are visited the most and whether any error messages are shown. We use this information to improve the performance of our website.</p>
  <p><strong>Marketing/Advertising Cookies:</strong> These cookies are used to deliver relevant advertisements to users and measure the effectiveness of marketing campaigns. They track your browsing habits and may be used by third-party advertising networks to display personalized ads on other websites.</p>
  
  <h3>3. How We Use Cookies</h3>
  <p>We use cookies for the following purposes:</p>
  <ul>
    <li>To provide you with a personalized browsing experience.</li>
    <li>To analyze website usage and improve our services.</li>
    <li>To remember your preferences and settings for future visits.</li>
    <li>To display relevant advertisements based on your interests.</li>
  </ul>
  
  <h3>4. Third-Party Cookies</h3>
  <p>In addition to our own cookies, we may also use third-party cookies from service providers who assist us in analyzing website usage or providing ads. These third parties may include advertising networks and analytics services such as Google Analytics.</p>
  
  <h3>5. Your Cookie Preferences</h3>
  <p>You have control over the cookies that are set on your device. You can manage cookie settings through your web browser by:</p>
  <p><strong>Accepting or declining cookies:</strong> Most browsers automatically accept cookies, but you can change your browser settings to decline cookies or alert you when a cookie is being sent.</p>
  <p><strong>Deleting cookies:</strong> You can delete cookies stored on your device at any time by adjusting your browser settings.</p>
  
  <h3>6. How to Control Cookies</h3>
  <p>You can manage your cookie preferences through your browser settings. Here's how you can do it in common browsers:</p>
  <p><strong>Google Chrome:</strong> Go to Settings > Privacy and security > Cookies and other site data > See all cookies and site data.</p>
  <p><strong>Mozilla Firefox:</strong> Go to Options > Privacy & Security > Cookies and Site Data.</p>
  <p><strong>Safari:</strong> Go to Preferences > Privacy > Manage Website Data.</p>
  <p><strong>Microsoft Edge:</strong> Go to Settings > Cookies and site permissions.</p>
  
  <h3>Changes to This Cookie Policy</h3>
  <p>We may update this Cookie Policy from time to time. When we make changes, we will post the updated policy on our website and update the date at the top of the page. We encourage you to review this policy periodically to stay informed about how we use cookies.</p>
</div>
`;

const termsContentEN = `
<div>
  <h2>Terms and Conditions for GoGame</h2>
  <p>Welcome to GoGame. By accessing or using our website, you agree to the following Terms and Conditions. If you have any concerns or do not agree with these terms, we kindly ask that you refrain from using our services.</p>
  
  <h3>1. Introduction</h3>
  <p>Welcome to GoGame, a surprise travel platform specializing in sports experiences. By accessing or using our website, you agree to comply with and be bound by these terms and conditions. Please read them carefully before using our services.</p>
  
  <h3>2. Website Usage</h3>
  <p>The GoGame website is created but not publicly visible at this stage. It is in a pre-launch phase and is in waitlist mode.</p>
  <ul>
    <li>You may subscribe with your email to receive notifications and be among the first to access our website once it's fully launched.</li>
  </ul>
  
  <h3>3. Booking Process</h3>
  <p>GoGame allows users to select their desired sport, departure city, and match level (standard or premium). Based on your selections, GoGame will organize your entire travel package, including flights, hotel accommodations, and match tickets.</p>
  <ul>
    <li>The destination or event details will remain undisclosed until 48 hours before departure.</li>
  </ul>
  
  <h3>4. Surprise Pack</h3>
  <p>The surprise pack includes a match ticket (football or basketball), flights, and hotel accommodations for the selected destination.</p>
  <ul>
    <li>Variations to the surprise pack include different sports and leagues, which will be clearly presented when you make your selection.</li>
  </ul>
  
  <h3>5. Payment Terms</h3>
  <p>By purchasing the surprise pack, you agree to pay the fixed price for the entire travel package, which includes the match ticket, flights, and hotel.</p>
  <ul>
    <li>Payments must be made in full at the time of booking.</li>
    <li>Prices are fixed and non-refundable once the booking is confirmed.</li>
  </ul>
  
  <h3>6. Privacy Policy</h3>
  <p>GoGame collects personal information, including but not limited to your name, email, and preferences for travel arrangements. This information is used to process your bookings and provide updates regarding your surprise trip.</p>
  <ul>
    <li>We respect your privacy and will not share your personal data with third parties except for travel-related services.</li>
  </ul>
  
  <h3>7. Cancellations and Refunds</h3>
  <p>All bookings are final and non-refundable once confirmed. We understand that circumstances may change, but due to the nature of our surprise travel packages and advance bookings required for flights, hotels, and event tickets, we cannot offer monetary refunds.</p>
  <ul>
    <li>In case of unforeseen circumstances that affect the trip, GoGame will work with the user to offer alternatives within reason, but no monetary refunds will be provided.</li>
  </ul>
  
  <h3>8. Limitation of Liability</h3>
  <p>GoGame is not responsible for any delays, cancellations, or issues related to flights, hotels, or match tickets that are beyond our control.</p>
  <ul>
    <li>Users agree that GoGame will not be liable for any loss or damage arising from their use of the website or bookings made.</li>
  </ul>
  
  <h3>9. Website Availability</h3>
  <p>GoGame strives to maintain the website and services without interruption. However, we cannot guarantee that the website will be free from errors or will operate continuously without downtime for maintenance.</p>
  <ul>
    <li>We reserve the right to modify or discontinue any part of the website at any time.</li>
  </ul>
  
  <h3>10. Governing Law</h3>
  <p>These terms and conditions are governed by the laws of the jurisdiction in which GoGame operates.</p>
  
  <h3>11. Changes to Terms</h3>
  <p>GoGame reserves the right to change or update these terms at any time. You will be notified of any changes, and continued use of the website after such updates signifies your acceptance of the modified terms.</p>
  
  <h3>12. Contact Information</h3>
  <p>If you have any questions, concerns, or requests regarding these Terms and Conditions, please contact us using the information below:</p>
  <p><strong>Email Address:</strong> legal@gogame.co</p>
  <p><strong>Customer Support:</strong> support@gogame.co</p>
  <p><strong>Website:</strong> https://www.gogame.co</p>
  <p><strong>Last Updated:</strong> May 2025</p>
</div>
`;

// Export for use in initialization
export { privacyContentEN, cookieContentEN, termsContentEN };

