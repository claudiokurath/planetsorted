import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true, varsIgnorePattern: "^_" }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "raw-standalone-templates/**",
    "tmp/**",
    "outputs/**",
    // Raw design-handoff dumps dropped into the tree (Claude Design .jsx
    // exports with unresolved Tweak*/CopyButton helpers). Not app code —
    // the app is .tsx. Wired-up tools live in components/*App.tsx.
    "**/*.jsx",
    "**/design_handoff_*/**",
  ]),
]);

export default eslintConfig;
