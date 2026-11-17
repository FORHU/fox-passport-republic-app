import "@testing-library/jest-dom";
import { describe, it, expect, afterEach } from "vitest";
import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { PhoneField } from "@/shared/components/ui/PhoneField";

function Harness({
  country,
  initial = "",
}: {
  country: string;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <PhoneField
        required
        label="Contact Number"
        country={country}
        countryName={
          { PH: "Philippines", US: "United States" }[country] ?? country
        }
        value={value}
        onChange={setValue}
        icon={null}
        labelClassName=""
        inputClassName=""
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

const numberInput = () =>
  document.querySelector('input[name="contactNumber"]') as HTMLInputElement;
const errorText = () => document.querySelector('[id$="-phone-error"]');

/**
 * The Venue Foxer contact number was a bare field with a Philippine
 * placeholder (+63 900 000 0000) and no check. It now follows the form's one
 * country (CountryField): formatted as typed, the country's example as a hint,
 * and no Continue past an invalid number.
 */
describe("PhoneField", () => {
  afterEach(cleanup);

  it("formats a Philippine number as typed, with the +63 example as hint", () => {
    render(<Harness country="PH" />);
    expect(
      screen.getByText(/^e\.g\. \+63 9\d\d \d{3} \d{4}$/),
    ).toBeInTheDocument();
    fireEvent.change(numberInput(), { target: { value: "9171234567" } });
    expect(numberInput()).toHaveValue("917 123 4567");
    expect(screen.getByTestId("value")).toHaveTextContent("+639171234567");
    expect(numberInput().checkValidity()).toBe(true);
  });

  it("formats a US number for the US", () => {
    render(<Harness country="US" />);
    expect(
      screen.getByText(/^e\.g\. \+1 \d{3} \d{3} \d{4}$/),
    ).toBeInTheDocument();
    fireEvent.change(numberInput(), { target: { value: "4155550132" } });
    expect(numberInput()).toHaveValue("415 555 0132");
    expect(screen.getByTestId("value")).toHaveTextContent("+14155550132");
  });

  it("blocks an invalid number and shows why once the field is left", async () => {
    render(<Harness country="PH" />);
    fireEvent.change(numberInput(), { target: { value: "12345" } });
    expect(numberInput().checkValidity()).toBe(false);
    expect(errorText()).toBeNull();
    fireEvent.blur(numberInput());
    await waitFor(() =>
      expect(errorText()).toHaveTextContent(
        "Enter a valid phone number for Philippines.",
      ),
    );
  });

  it("asks for the number when Continue finds it empty", async () => {
    render(<Harness country="PH" />);
    numberInput().checkValidity();
    await waitFor(() =>
      expect(errorText()).toHaveTextContent("Enter your contact number."),
    );
  });

  it("shows a saved number in its country's grouping", () => {
    render(<Harness country="PH" initial="+639171234567" />);
    expect(numberInput()).toHaveValue("917 123 4567");
  });
});
