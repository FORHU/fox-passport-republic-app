import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

import { TinField } from "@/shared/components/ui/TinField";
import { tinError, tinHint, tinPlaceholder } from "@/shared/lib/tin";
import type { TinFormats } from "@/shared/api/geo";

// What GET /locations/countries/:code/tin-formats serves (the API's
// utils/tax-id-formats; its tests pin that the app's check agrees with it).
const FORMATS: Record<string, TinFormats> = {
  PH: {
    issuesTin: true,
    message: "TIN must look like 123-456-789 or 123-456-789-000",
    formats: [
      {
        label: "TIN",
        mask: "000-000-000",
        example: "123-456-789",
        pattern: "^(\\d\\d\\d)\\-?(\\d\\d\\d)\\-?(\\d\\d\\d)$",
        rule: null,
      },
      {
        label: "TIN",
        mask: "000-000-000-000",
        example: "123-456-789-000",
        pattern: "^(\\d\\d\\d)\\-?(\\d\\d\\d)\\-?(\\d\\d\\d)\\-?(\\d\\d\\d)$",
        rule: null,
      },
    ],
  },
  IN: {
    issuesTin: true,
    message: "PAN / Aadhaar must look like ABCDE1234F or 1234 5678 9012",
    formats: [
      {
        label: "PAN",
        mask: "aaaaa0000a",
        example: "ABCDE1234F",
        pattern: "^([A-Z][A-Z][A-Z][A-Z][A-Z]\\d\\d\\d\\d[A-Z])$",
        rule: null,
      },
      {
        label: "Aadhaar",
        mask: "0000 0000 0000",
        example: "1234 5678 9012",
        pattern: "^(\\d\\d\\d\\d)(\\d\\d\\d\\d)(\\d\\d\\d\\d)$",
        rule: null,
      },
    ],
  },
  AE: {
    issuesTin: false,
    message: "Tax ID must be 4-20 letters or digits",
    formats: [
      {
        label: "Tax ID",
        mask: "",
        example: "Tax ID number",
        pattern: "^[A-Z0-9](?:[A-Z0-9]|[-./](?=[A-Z0-9])){3,19}$",
        rule: null,
      },
    ],
  },
};

function mockApi() {
  api.get.mockImplementation(async (url: string) => {
    const m = /\/countries\/(\w+)\/tin-formats$/.exec(url);
    if (m) return { data: { data: FORMATS[m[1]] } };
    throw new Error(`unexpected GET ${url}`);
  });
}

const NAMES: Record<string, string> = {
  AE: "United Arab Emirates",
  IN: "India",
  PH: "Philippines",
};

function Harness({
  country,
  required = true,
}: {
  country: string;
  required?: boolean;
}) {
  const [tin, setTin] = useState("");
  return (
    <TinField
      required={required}
      country={country}
      countryName={NAMES[country] ?? country}
      value={tin}
      onChange={setTin}
      icon={null}
      labelClassName=""
      inputClassName=""
    />
  );
}

function renderField(country: string) {
  mockApi();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <Harness country={country} />
    </QueryClientProvider>,
  );
  return {
    ...view,
    setCountry: (next: string) =>
      view.rerender(
        <QueryClientProvider client={client}>
          <Harness country={next} />
        </QueryClientProvider>,
      ),
  };
}

const tinInput = () => screen.getByLabelText(/TIN Number/) as HTMLInputElement;
const errorText = () => document.querySelector('[id$="-tin-error"]');
const ready = (placeholder: string) =>
  waitFor(() => expect(tinInput()).toHaveAttribute("placeholder", placeholder));

/**
 * The Venue Foxer form showed a 12-digit TIN placeholder the API refused, and
 * only Submit found out (app#299). The TIN is now masked to the format of the
 * form's country (one CountryField sets it) and carries the API's message, so
 * the wizard stops at the field.
 */
describe("TinField", () => {
  afterEach(() => {
    cleanup();
    api.get.mockReset();
  });

  it("shows the country's formats as placeholder and hint", async () => {
    renderField("PH");
    await ready("123-456-789");
    expect(
      screen.getByText("TIN: 123-456-789 or 123-456-789-000"),
    ).toBeInTheDocument();
    expect(tinInput()).toBeRequired();
  });

  it("masks a 12-digit PH TIN as typed and accepts it", async () => {
    renderField("PH");
    await ready("123-456-789");
    await userEvent.type(tinInput(), "123456789000");
    expect(tinInput()).toHaveValue("123-456-789-000");
    expect(tinInput().validationMessage).toBe("");
    expect(tinInput().checkValidity()).toBe(true);
  });

  it("blocks a TIN that fits no format, with the API's message", async () => {
    renderField("PH");
    await ready("123-456-789");
    await userEvent.type(tinInput(), "1234567890");
    expect(tinInput().checkValidity()).toBe(false);
    expect(tinInput().validationMessage).toBe(
      "TIN must look like 123-456-789 or 123-456-789-000",
    );
  });

  it("shows the API's message under the field once it is left", async () => {
    renderField("PH");
    await ready("123-456-789");
    await userEvent.type(tinInput(), "1234567890");
    // Not while the first try is still being typed.
    expect(errorText()).toBeNull();
    fireEvent.blur(tinInput());
    expect(errorText()).toHaveTextContent(
      "TIN must look like 123-456-789 or 123-456-789-000",
    );
    expect(tinInput()).toHaveAttribute("aria-invalid", "true");
    // Fixed as typed: the message goes.
    await userEvent.type(tinInput(), "00");
    expect(tinInput()).toHaveValue("123-456-789-000");
    expect(errorText()).toBeNull();
  });

  it("shows the message when Continue finds the TIN empty", async () => {
    renderField("PH");
    await ready("123-456-789");
    // The wizard calls checkValidity() on Continue, which fires `invalid`.
    tinInput().checkValidity();
    await waitFor(() =>
      expect(errorText()).toHaveTextContent("Enter your TIN"),
    );
  });

  it("follows the form's country, and starts over when it changes", async () => {
    const { setCountry } = renderField("PH");
    await ready("123-456-789");
    tinInput().checkValidity();
    await waitFor(() => expect(errorText()).not.toBeNull());
    setCountry("IN");
    await ready("ABCDE1234F");
    expect(errorText()).toBeNull();
    expect(
      screen.getByText("PAN: ABCDE1234F · Aadhaar: 1234 5678 9012"),
    ).toBeInTheDocument();
    await userEvent.type(tinInput(), "abcde1234f");
    expect(tinInput()).toHaveValue("ABCDE1234F");
    expect(tinInput().checkValidity()).toBe(true);
  });

  it("makes the TIN optional where the country issues none", async () => {
    renderField("AE");
    await waitFor(() =>
      expect(
        screen.getByText(/United Arab Emirates does not issue a TIN/),
      ).toBeInTheDocument(),
    );
    expect(tinInput()).not.toBeRequired();
    expect(screen.getByText("TIN Number (Optional)")).toBeInTheDocument();
  });
});

describe("tinError / tinPlaceholder / tinHint", () => {
  it("passes empty (required covers it) and unloaded formats", () => {
    expect(tinError(FORMATS.PH, "")).toBeNull();
    expect(tinError(undefined, "anything")).toBeNull();
  });

  it("accepts with or without separators", () => {
    expect(tinError(FORMATS.PH, "123456789")).toBeNull();
    expect(tinError(FORMATS.PH, "123-456-789-000")).toBeNull();
    expect(tinError(FORMATS.PH, "12345")).toBe(FORMATS.PH.message);
  });

  it("uses the first example as the placeholder", () => {
    expect(tinPlaceholder(FORMATS.PH)).toBe("123-456-789");
    expect(tinPlaceholder(undefined)).toBe("");
  });

  it("lists every format, grouped by name", () => {
    expect(tinHint(FORMATS.PH)).toBe("TIN: 123-456-789 or 123-456-789-000");
    expect(tinHint(FORMATS.IN)).toBe(
      "PAN: ABCDE1234F · Aadhaar: 1234 5678 9012",
    );
    expect(tinHint(FORMATS.AE)).toBe("Any tax ID, 4–20 letters or digits");
    expect(tinHint(undefined)).toBe("");
  });
});
