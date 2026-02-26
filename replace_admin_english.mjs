import fs from "fs";
import path from "path";

// This script aims to replace TranslatedText entirely with English text for Admin components
const files = [
  "app/(admin)/dashboard/about/components/AboutManagement.tsx",
  "app/(admin)/dashboard/allrequest/components/booking-summery-modal.tsx",
  "app/(admin)/dashboard/allrequest/components/request.tsx",
  "app/(admin)/dashboard/components/common/sidebar.tsx",
  "app/(admin)/dashboard/components/overview/overview.tsx",
  "app/(admin)/dashboard/faq/components/faqadd.tsx",
  "app/(admin)/dashboard/managedate/components/DateManagement.tsx",
  "app/(admin)/dashboard/package/components/FixedPriceCard.tsx",
  "app/(admin)/dashboard/package/components/PackageManagement.tsx",
  "app/(admin)/dashboard/page.tsx",
  "app/(admin)/dashboard/settings/legal/components/LegalPageManagement.tsx",
  "app/(admin)/dashboard/settings/legal/page.tsx",
  "app/(admin)/dashboard/settings/social-contact/components/SocialContactManagement.tsx",
  "app/(admin)/dashboard/testimonial/components/testimonial.tsx",
];

for (const file of files) {
  const fullPath = path.join(
    "e:\\najim's work space\\2026\\january\\gogamee",
    file,
  );
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, "utf8");

  // Strip imports of TranslatedText and ConfirmModal using useLanguage
  content = content.replace(
    /import\s*\{\s*TranslatedText\s*\}\s*from\s*['"][^'"]+['"];?\n?/g,
    "",
  );
  content = content.replace(
    /import\s*\{\s*useLanguage\s*\}\s*from\s*['"][^'"]+['"];?\n?/g,
    "",
  );

  // Strip useLanguage invocations
  content = content.replace(
    /const\s*\{\s*language(?:,\s*translateText|,\s*toggleLanguage)?\s*\}\s*=\s*useLanguage\(\);/g,
    "",
  );
  content = content.replace(
    /const\s*\{\s*translateText\s*\}\s*=\s*useLanguage\(\);/g,
    "",
  );

  // Replace <TranslatedText english="X" text="Y" /> with X (or just plain JSX strings)
  // 1. Where it's purely <TranslatedText english="A" text="B" />
  content = content.replace(
    /<TranslatedText\s+english=["']([^"']+)["']\s+text=["'][^"']+["']\s*\/>/g,
    "$1",
  );
  // 2. Where arguments might be reversed <TranslatedText text="B" english="A" />
  content = content.replace(
    /<TranslatedText\s+text=["'][^"']+["']\s+english=["']([^"']+)["']\s*\/>/g,
    "$1",
  );
  // 3. Fallback: <TranslatedText text="B" /> without english text gets converted back to text "B" (e.g if no explicit English alternative was specified)
  content = content.replace(
    /<TranslatedText\s+text=["']([^"']+)["']\s*\/>/g,
    "$1",
  );
  // 4. Expressions like <TranslatedText text={variable} english={otherVariable} />
  content = content.replace(
    /<TranslatedText\s+english={([^}]+)}\s+text={[^}]+}\s*\/>/g,
    "{$1}",
  );
  content = content.replace(
    /<TranslatedText\s+text={[^}]+}\s+english={([^}]+)}\s*\/>/g,
    "{$1}",
  );
  content = content.replace(/<TranslatedText\s+text={([^}]+)}\s*\/>/g, "{$1}");
  // 5. With className (buttons)
  content = content.replace(
    /<TranslatedText\s+text=["']([^"']+)["']\s+english=["']([^"']+)["']\s+className=["'][^"']+["']\s*\/>/g,
    "$2",
  );
  content = content.replace(
    /<TranslatedText\s+english=["']([^"']+)["']\s+text=["']([^"']+)["']\s+className=["'][^"']+["']\s*\/>/g,
    "$1",
  );

  // Also replace any literal `language === "es" ? "Spanish" : "English"` patterns
  // Replace `language === "es" ? A : B` -> `B`  since we want English
  content = content.replace(
    /language\s*===\s*['"]es['"]\s*\?\s*([^:]+)\s*:\s*(.+?)(?=\)|\}|,|\]|;|$)/g,
    (match, p1, p2) => p2.trim(),
  );
  content = content.replace(
    /language\s*===\s*['"]en['"]\s*\?\s*([^:]+)\s*:\s*(.+?)(?=\)|\}|,|\]|;|$)/g,
    (match, p1, p2) => p1.trim(),
  );

  // Conditional blocks
  content = content.replace(
    /if\s*\(\s*language\s*===\s*['"]es['"]\s*\)/g,
    "if (false)",
  );
  content = content.replace(
    /if\s*\(\s*language\s*===\s*['"]en['"]\s*\)/g,
    "if (true)",
  );

  // Boolean flags for leftover checks
  content = content.replace(/language\s*===\s*["']es["']/g, "false");
  content = content.replace(/language\s*===\s*["']en["']/g, "true");
  content = content.replace(/language\s*!==\s*["']es["']/g, "true");
  content = content.replace(/language\s*!==\s*["']en["']/g, "false");

  fs.writeFileSync(fullPath, content);
}
console.log("Admin changes replaced.");
