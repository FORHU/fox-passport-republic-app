import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchableDropdown from "../SearchableDropdown";
import { Sheet, SheetContent, SheetTitle } from "../sheet";

const COUNTRIES = ["Japan", "Peru", "Philippines", "Poland", "Portugal"];

function Harness({
  onChange,
  allowCustom,
  initial = "",
}: {
  onChange: (v: string) => void;
  allowCustom?: boolean;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <SearchableDropdown
      value={value}
      options={COUNTRIES}
      placeholder="Select country…"
      searchPlaceholder="Search countries…"
      allowCustom={allowCustom}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

const trigger = () =>
  screen.getByRole("button", { name: /select country|philippines/i });
const searchBox = () =>
  screen.getByRole("combobox", { name: "Search countries…" });
const highlighted = () =>
  screen
    .getAllByRole("option")
    .find((o) => o.getAttribute("aria-selected") === "true");

describe("SearchableDropdown keyboard", () => {
  it("highlights the first match while typing and Enter selects it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(trigger());
    expect(searchBox()).toHaveFocus();
    await user.type(searchBox(), "Phil");
    expect(highlighted()).toHaveTextContent("Philippines");
    expect(searchBox()).toHaveAttribute(
      "aria-activedescendant",
      highlighted()!.id,
    );

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("Philippines");
    expect(onChange).not.toHaveBeenCalledWith("");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    // Focus goes back to the trigger so Tab continues through the form.
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveTextContent("Philippines");
  });

  it("selects the full typed name with Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(trigger());
    await user.type(searchBox(), "Philippines{Enter}");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("Philippines");
  });

  it("moves the highlight with the arrow keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(trigger());
    await user.type(searchBox(), "P");
    expect(highlighted()).toHaveTextContent("Peru");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}");
    expect(highlighted()).toHaveTextContent("Philippines");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("Philippines");
  });

  it("does nothing on Enter when nothing matches", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(trigger());
    await user.type(searchBox(), "Atlantis{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("picks the typed value with Enter when custom values are allowed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} allowCustom />);

    await user.click(trigger());
    await user.type(searchBox(), "Atlantis{Enter}");
    expect(onChange).toHaveBeenCalledWith("Atlantis");
  });

  it("closes on Escape without changing the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(trigger());
    await user.type(searchBox(), "Phil{Escape}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it("starts on the current value when reopened", async () => {
    const user = userEvent.setup();
    render(<Harness onChange={vi.fn()} initial="Poland" />);

    await user.click(screen.getByRole("button", { name: "Poland" }));
    expect(highlighted()).toHaveTextContent("Poland");
  });
});

describe("SearchableDropdown placement", () => {
  it("portals the panel to <body> outside a dialog", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness onChange={vi.fn()} />);

    await user.click(trigger());
    expect(container.contains(screen.getByRole("listbox"))).toBe(false);
  });

  it("can be typed in and picked from inside a modal sheet", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Sheet open>
        <SheetContent side="bottom">
          <SheetTitle>Filters</SheetTitle>
          <Harness onChange={onChange} />
        </SheetContent>
      </Sheet>,
    );

    await user.click(trigger());
    const dialog = screen.getByRole("dialog");
    // Rendered inside the dialog, so its focus trap allows the search box.
    expect(dialog.contains(screen.getByRole("listbox"))).toBe(true);
    expect(searchBox()).toHaveFocus();

    await user.type(searchBox(), "Phil");
    expect(searchBox()).toHaveValue("Phil");
    await user.click(screen.getByRole("option", { name: "Philippines" }));
    expect(onChange).toHaveBeenCalledWith("Philippines");
  });
});
