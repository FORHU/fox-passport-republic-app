import "@testing-library/jest-dom";
import { describe, it, expect, vi, afterEach } from "vitest";
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
vi.mock("@/shared/auth/RequireAuth", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));
vi.mock("@/shared/components/layout/FileUploader", () => ({
  default: () => null,
}));
vi.mock("@/features/role-application/hooks/useApplyRole", () => ({
  useApplyRole: () => ({ mutate: vi.fn(), isPending: false }),
}));

import MayorApplicationClient from "@/features/role-application/components/MayorApplicationClient";

const COUNTRIES = [
  { code: "IN", name: "India", flag: "🇮🇳", phoneCode: "91" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", phoneCode: "63" },
];
const FORMATS: Record<string, unknown> = {
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
};

function renderForm() {
  api.get.mockImplementation(async (url: string) => {
    if (url === "/locations/countries") return { data: { data: COUNTRIES } };
    if (url === "/profile")
      return { data: { data: { id: "u1", country: "Philippines" } } };
    const m = /\/countries\/(\w+)\/tin-formats$/.exec(url);
    if (m) return { data: { data: FORMATS[m[1]] } };
    throw new Error(`unexpected GET ${url}`);
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MayorApplicationClient />
    </QueryClientProvider>,
  );
}

const phone = () =>
  document.querySelector('input[name="contactNumber"]') as HTMLInputElement;
const tin = () =>
  document.querySelector('input[name="tinNumber"]') as HTMLInputElement;

/**
 * "Your business" asks for the country once, right after the business name;
 * the contact number and the TIN both follow it.
 */
describe("Venue Foxer application — one country", () => {
  afterEach(() => {
    cleanup();
    api.get.mockReset();
  });

  it("asks for the country once, after the business name", async () => {
    renderForm();
    await screen.findByText("🇵🇭 Philippines");
    expect(screen.getAllByText(/^Country \*$/)).toHaveLength(1);
    expect(screen.queryByText(/Tax Country/)).not.toBeInTheDocument();
    const labels = Array.from(document.querySelectorAll("label")).map((l) =>
      l.textContent?.trim(),
    );
    const at = (text: string) => labels.findIndex((l) => l?.startsWith(text));
    expect(at("Business / Venue Name")).toBeLessThan(at("Country"));
    expect(at("Country")).toBeLessThan(at("Contact Number"));
    expect(at("Contact Number")).toBeLessThan(at("TIN Number"));
  });

  it("re-formats the number and resets the TIN when the country changes", async () => {
    renderForm();
    await screen.findByText("🇵🇭 Philippines");
    await waitFor(() => expect(tin().placeholder).toBe("123-456-789"));
    fireEvent.change(phone(), { target: { value: "9171234567" } });
    expect(phone()).toHaveValue("917 123 4567");
    // react-imask formats on real typing, not a synthetic change event.
    await userEvent.type(tin(), "123456789");
    await waitFor(() => expect(tin()).toHaveValue("123-456-789"));

    fireEvent.click(screen.getByText("🇵🇭 Philippines"));
    fireEvent.click(await screen.findByText("🇮🇳 India"));

    // Same digits, India's grouping; the TIN starts over in India's format.
    await waitFor(() => expect(phone()).toHaveValue("91712 34567"));
    await waitFor(() => expect(tin().placeholder).toBe("ABCDE1234F"));
    expect(tin()).toHaveValue("");
    expect(
      screen.getByText("PAN: ABCDE1234F · Aadhaar: 1234 5678 9012"),
    ).toBeInTheDocument();
    expect(screen.getByText(/^e\.g\. \+91 /)).toBeInTheDocument();
  });
});
