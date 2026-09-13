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
      "@typescript-eslint/no-unused-vars": "warn",
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
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;
