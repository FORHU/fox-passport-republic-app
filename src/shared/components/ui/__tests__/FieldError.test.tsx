import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldControl, FieldError } from "../FieldError";
import { FormErrorSummary } from "../FormErrorSummary";

describe("FieldError", () => {
  it("renders nothing without a message", () => {
    const { container } = render(<FieldError id="e" message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("announces the message", () => {
    render(<FieldError id="phone-error" message="Enter a phone number" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a phone number");
  });
});

describe("FieldControl", () => {
  it("shows the error icon only when invalid", () => {
    const { rerender, container } = render(
      <FieldControl invalid={false}>
        <input />
      </FieldControl>,
    );
    expect(container.querySelector("svg")).toBeNull();
    rerender(
      <FieldControl invalid>
        <input />
      </FieldControl>,
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("FormErrorSummary", () => {
  it("focuses the field an item points at", async () => {
    Element.prototype.scrollIntoView = () => {};
    render(
      <>
        <FormErrorSummary
          title="2 things to fix before you can save"
          items={[
            { message: "Fix your username", fieldId: "username" },
            { message: "Fix your phone number", fieldId: "phone" },
          ]}
        />
        <input id="username" />
        <input id="phone" />
      </>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Fix your phone number/ }),
    );
    expect(document.getElementById("phone")).toHaveFocus();
  });

  it("renders nothing with no items", () => {
    const { container } = render(<FormErrorSummary title="x" items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
