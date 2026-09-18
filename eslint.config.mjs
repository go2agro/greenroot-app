import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const serverOnlyLibImports = {
  paths: [
    {
      name: "@/lib/supabase",
      message:
        "Server-only: never import in app/ or components/. Use lib/* server actions, or getSupabaseBrowser() from @/lib/supabase-browser in rare client auth flows.",
    },
    {
      name: "@/lib/supabase-admin",
      message:
        "Server-only: never import in app/ or components/. Use lib/* server actions instead.",
    },
    {
      name: "@/lib/posthog-server",
      message:
        "Server-only: never import in app/ or components/. Use client PostHog or server actions instead.",
    },
  ],
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", serverOnlyLibImports],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
