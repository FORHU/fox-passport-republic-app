import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Downgraded from error: codebase uses `any` extensively for untyped API
      // responses. Flag as warnings so new instances are visible without blocking.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
      // React Compiler rules — downgraded from error; these fire on legitimate
      // patterns (early-return setState guards, Math.random order refs,
      // manual useMemo with derived-date deps) that are safe in React 18.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      // Self-referential useCallback (scheduleProactiveRefresh calls itself)
      // is safe here — the ref is captured at call time, not init time.
      "react-hooks/immutability": "warn",
    },
  },
]);

export default eslintConfig;
