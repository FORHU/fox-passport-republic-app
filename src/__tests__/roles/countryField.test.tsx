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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const api = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/lib/axios", () => ({ default: api }));

import { CountryField } from "@/shared/components/ui/CountryField";

const COUNTRIES = [
  { code: "AQ", name: "Antarctica", flag: "🇦🇶", phoneCode: "" },
  { code: "IN", name: "India", flag: "🇮🇳", phoneCode: "91" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", phoneCode: "63" },
  { code: "US", name: "United States", flag: "🇺🇸", phoneCode: "1" },
];

function mockApi(profileCountry?: string, countriesFail = false) {
  api.get.mockImplementation(async (url: string) => {
    if (url === "/locations/countries") {
      if (countriesFail) throw new Error("offline");
      return { data: { data: COUNTRIES } };
    }
    if (url === "/profile")
      return { data: { data: { id: "u1", country: profileCountry } } };
    throw new Error(`unexpected GET ${url}`);
  });
}

function Harness() {
  const [country, setCountry] = useState("");
  return (
    <>
      <CountryField
        value={country}
        onChange={setCountry}
        labelClassName=""
        hint="Sets the format of your contact number and TIN."
      />
      <output data-testid="country">{country}</output>
    </>
  );
}

function renderField() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <Harness />
    </QueryClientProvider>,
  );
}

const country = () => screen.getByTestId("country");

/**
 * The Venue Foxer form asked for the country twice (with the contact number
 * and with the TIN). It is now asked once; the fields after it follow it.
 */
describe("CountryField", () => {
  afterEach(() => {
    cleanup();
    api.get.mockReset();
  });

  it("starts on the profile's country", async () => {
    mockApi("India");
    renderField();
    await waitFor(() => expect(country()).toHaveTextContent("IN"));
    expect(screen.getByText("🇮🇳 India")).toBeInTheDocument();
    expect(
      screen.getByText("Sets the format of your contact number and TIN."),
    ).toBeInTheDocument();
  });

  it("starts on the Philippines when the profile names no country", async () => {
    mockApi(undefined);
    renderField();
    await waitFor(() => expect(country()).toHaveTextContent("PH"));
  });

  it("starts on the Philippines when the country list fails", async () => {
    mockApi("India", true);
    renderField();
    await waitFor(() => expect(country()).toHaveTextContent("PH"));
  });

  it("gives the picked country's code, offering only countries with phone numbering", async () => {
    mockApi("Philippines");
    renderField();
    fireEvent.click(await screen.findByText("🇵🇭 Philippines"));
    expect(screen.queryByText(/Antarctica/)).not.toBeInTheDocument();
    fireEvent.click(await screen.findByText("🇺🇸 United States"));
    expect(country()).toHaveTextContent("US");
  });
});
