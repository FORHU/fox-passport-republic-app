import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

let reactHooksConfig = null;
for (const c of [...nextVitals, ...nextTs]) {
  if (c.plugins?.["react-hooks"]) {
    reactHooksConfig = c;
    break;
  }
}

if (reactHooksConfig) {
  Object.assign(reactHooksConfig, {
    rules: {
      ...reactHooksConfig.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "off",
    },
  });
}

// jsx-a11y's recommended options: inputs and textareas are covered by
// label-has-associated-control, so only buttons, links, cells and the like are
// checked here. Depth 3 reaches text inside a button's nested spans.
const a11yControlLabel = {
  ignoreElements: [
    "audio",
    "canvas",
    "embed",
    "input",
    "textarea",
    "tr",
    "video",
  ],
  ignoreRoles: [
    "grid",
    "listbox",
    "menu",
    "menubar",
    "radiogroup",
    "row",
    "tablist",
    "toolbar",
    "tree",
    "treegrid",
  ],
  includeRoles: ["alert", "dialog"],
  depth: 3,
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**",
  ]),
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "off",
      // Missing alt must fail CI (lint warnings don't). alt="" stays valid
      // for decorative images.
      "jsx-a11y/alt-text": ["error", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/img-redundant-alt": "error",
    },
  },
  // Form labels and control names (screen readers). A ratchet: errors, which
  // fail CI, in the folders already fixed; warnings everywhere else until the
  // remaining admin/dashboard forms are fixed too.
  {
    files: ["src/**/*.{jsx,tsx}"],
    rules: {
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/control-has-associated-label": ["warn", a11yControlLabel],
    },
  },
  {
    files: [
      "src/features/auth/**/*.{jsx,tsx}",
      "src/app/auth/**/*.{jsx,tsx}",
      "src/features/booking/**/*.{jsx,tsx}",
      "src/app/booking/**/*.{jsx,tsx}",
      "src/app/checkout/**/*.{jsx,tsx}",
      "src/features/landing/**/*.{jsx,tsx}",
      "src/app/search/**/*.{jsx,tsx}",
      "src/shared/components/ui/**/*.{jsx,tsx}",
    ],
    rules: {
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/control-has-associated-label": ["error", a11yControlLabel],
    },
  },
]);

export default eslintConfig;
