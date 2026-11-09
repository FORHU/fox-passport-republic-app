import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { HostBio } from "@/features/venue/components/detail/VenueExtras";

const host = { name: "Fox Partner", avatar: "/a.jpg", reviews: 0 };

describe("HostBio owner bio", () => {
  it("shows the owner's bio when there is one", () => {
    render(
      <HostBio host={{ ...host, description: "  Hosts hillside villas.  " }} />,
    );
    expect(screen.getByText("Hosts hillside villas.")).toBeInTheDocument();
  });

  it.each(["", "   "])(
    "shows no bio line or placeholder for %j",
    (description) => {
      const { container } = render(<HostBio host={{ ...host, description }} />);
      expect(screen.getByText("Listed by Fox Partner")).toBeInTheDocument();
      expect(container.querySelectorAll("p")).toHaveLength(0);
      expect(container).not.toHaveTextContent(/bio yet|""/);
    },
  );
});
