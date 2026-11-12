import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SpecializationPicker from "@/features/role-application/components/SpecializationPicker";

const options = [
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "dj", label: "DJ" },
  { value: "catering", label: "Catering" },
];

describe("SpecializationPicker", () => {
  it("keeps the cap of 3 for roles that have one", () => {
    const onChange = vi.fn();
    render(
      <SpecializationPicker
        options={options}
        value={["photography", "videography", "dj"]}
        onChange={onChange}
        accentColor="#fff"
      />,
    );

    expect(screen.getByText("(optional, pick up to 3)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Catering"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("asks a Provider for at least one, with no cap (RR-3)", () => {
    const onChange = vi.fn();
    render(
      <SpecializationPicker
        options={options}
        value={["photography", "videography", "dj"]}
        onChange={onChange}
        accentColor="#fff"
        max={Infinity}
        required
      />,
    );

    expect(screen.getByText("(pick at least one)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Catering"));
    expect(onChange).toHaveBeenCalledWith([
      "photography",
      "videography",
      "dj",
      "catering",
    ]);
  });
});
