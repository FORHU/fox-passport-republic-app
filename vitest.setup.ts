// Registers jest-dom's custom matchers (toBeInTheDocument, toHaveClass, ...)
// and their TypeScript augmentation for vitest's `expect`.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount anything a test rendered so DOM state can't leak between tests.
afterEach(() => {
  cleanup();
});
