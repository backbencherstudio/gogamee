import React from "react";
import CookieHero from "./components/cookiehero/cookiehero";
import CookiePolicy from "./components/cookie-policy/cookiepolicy";

export default function Cookies() {
  return (
    <div>
      <CookieHero />
      <CookiePolicy />
    </div>
  );
}
