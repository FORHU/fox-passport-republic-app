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
const prefix = () => screen.queryByTestId("phone-prefix");

/**
 * The Venue Foxer contact number was a bare field with a Philippine
 * placeholder (+63 900 000 0000) and no check. It now follows the form's one
 * country (CountryField): its +code fixed in the field, formatted as typed,
 * the country's example as a hint, and no Continue past an invalid number —
 * in the Philippines, one that isn't a mobile number (api#492).
 */
describe("PhoneField", () => {
  afterEach(cleanup);

  it("formats a Philippine number as typed, after a fixed +63", () => {
    render(<Harness country="PH" />);
    expect(prefix()).toHaveTextContent("+63");
    expect(screen.getByText(/^e\.g\. 9\d\d \d{3} \d{4}$/)).toBeInTheDocument();
    fireEvent.change(numberInput(), { target: { value: "9171234567" } });
    expect(numberInput()).toHaveValue("917 123 4567");
    expect(screen.getByTestId("value")).toHaveTextContent("+639171234567");
    expect(numberInput().checkValidity()).toBe(true);
  });

  it("formats a US number for the US", () => {
    render(<Harness country="US" />);
    expect(prefix()).toHaveTextContent("+1");
    expect(screen.getByText(/^e\.g\. \d{3} \d{3} \d{4}$/)).toBeInTheDocument();
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
        /^Enter a valid mobile number for Philippines, like 9\d\d \d{3} \d{4}\.$/,
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

  // api#492: the +63 is fixed, shown in the field, and never typed.
  it("keeps the +63 out of what is typed, so it can't be removed", () => {
    render(<Harness country="PH" initial="+639171234567" />);
    expect(numberInput()).toHaveValue("917 123 4567");
    fireEvent.change(numberInput(), { target: { value: "" } });
    expect(prefix()).toHaveTextContent("+63");
    expect(screen.getByTestId("value")).toHaveTextContent(/^$/);
    expect(numberInput()).toHaveAccessibleDescription(
      expect.stringContaining("Country code +63"),
    );
  });

  it("leaves out the 0 of a number typed as 0917…", () => {
    render(<Harness country="PH" />);
    fireEvent.change(numberInput(), { target: { value: "09171234567" } });
    expect(numberInput()).toHaveValue("917 123 4567");
    expect(screen.getByTestId("value")).toHaveTextContent("+639171234567");
    expect(numberInput().checkValidity()).toBe(true);
  });

  it("takes a pasted number with its own +63 without doubling it", () => {
    render(<Harness country="PH" />);
    fireEvent.paste(numberInput(), {
      clipboardData: { getData: () => "+63 917 123 4567" },
    });
    expect(screen.getByTestId("value")).toHaveTextContent("+639171234567");
    expect(numberInput()).toHaveValue("917 123 4567");
  });

  it("refuses a Philippine landline", () => {
    render(<Harness country="PH" />);
    fireEvent.change(numberInput(), { target: { value: "281234567" } });
    expect(screen.getByTestId("value")).toHaveTextContent("+63281234567");
    expect(numberInput().checkValidity()).toBe(false);
  });

  it("keeps a US landline valid", () => {
    render(<Harness country="US" />);
    fireEvent.change(numberInput(), { target: { value: "2025550123" } });
    expect(numberInput().checkValidity()).toBe(true);
  });

  it("shows the new country's code when the country changes", () => {
    const { rerender } = render(<Harness country="PH" />);
    expect(prefix()).toHaveTextContent("+63");
    rerender(<Harness country="US" />);
    expect(prefix()).toHaveTextContent("+1");
  });

  it("shows a saved number in its country's grouping", () => {
    render(<Harness country="PH" initial="+639171234567" />);
    expect(numberInput()).toHaveValue("917 123 4567");
  });
});
