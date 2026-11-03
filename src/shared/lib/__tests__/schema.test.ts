import { describe, it, expect } from "vitest";
import {
  createServiceSchema,
  createEventSchema,
  createVenueSchema,
  usernameSchema,
} from "../schema";
import {
  DESCRIPTION_MAX,
  EVENT_DESCRIPTION_MAX,
  LONG_DESCRIPTION_MAX,
  NAME_MAX,
  PRICE_MAX,
  QUANTITY_MAX,
  firstLimitError,
  nameError,
  priceError,
  quantityError,
} from "../limits";

// All status enums must mirror the backend Prisma enums exactly.
// Source of truth: fox-passport-republic-api/prisma/schema.prisma

const serviceBase = {
  name: "Photography",
  description: "Professional photography service",
  category: "entertainment",
  price: 150,
};

const eventBase = {
  name: "Birthday Bash",
  eventType: "birthday",
  venueId: "venue-001",
  startDatetime: new Date("2026-08-01T10:00:00"),
  endDatetime: new Date("2026-08-01T14:00:00"),
  maxAttendees: 50,
};

const venueBase = {
  name: "The Garden",
  type: "outdoor",
  capacity: 100,
  address: "123 Main St",
  city: "Cebu",
  country: "Philippines",
  price: 10000,
};

describe("createServiceSchema — ServiceStatus enum", () => {
  it("defaults status to draft", () => {
    const result = createServiceSchema.parse(serviceBase);
    expect(result.status).toBe("draft");
  });

  it("accepts all valid backend ServiceStatus values", () => {
    for (const status of [
      "draft",
      "pending",
      "available",
      "paused",
      "archived",
      "rejected",
    ]) {
      expect(createServiceSchema.parse({ ...serviceBase, status }).status).toBe(
        status,
      );
    }
  });

  it("rejects stale frontend-only values no longer in backend enum", () => {
    for (const bad of ["active", "unavailable", "published"]) {
      expect(() =>
        createServiceSchema.parse({ ...serviceBase, status: bad }),
      ).toThrow();
    }
  });
});

describe("createEventSchema — EventStatus enum", () => {
  it("defaults status to draft", () => {
    const result = createEventSchema.parse(eventBase);
    expect(result.status).toBe("draft");
  });

  it("accepts all valid backend EventStatus values", () => {
    for (const status of [
      "draft",
      "pending",
      "ongoing",
      "completed",
      "cancelled",
    ]) {
      expect(createEventSchema.parse({ ...eventBase, status }).status).toBe(
        status,
      );
    }
  });

  it("rejects published — not a backend EventStatus value", () => {
    expect(() =>
      createEventSchema.parse({ ...eventBase, status: "published" }),
    ).toThrow();
  });

  it("rejects active — not a backend EventStatus value", () => {
    expect(() =>
      createEventSchema.parse({ ...eventBase, status: "active" }),
    ).toThrow();
  });
});

describe("createVenueSchema — VenueStatus enum", () => {
  it("defaults status to draft", () => {
    const result = createVenueSchema.parse(venueBase);
    expect(result.status).toBe("draft");
  });

  it("accepts all valid backend VenueStatus values", () => {
    for (const status of [
      "draft",
      "pending",
      "available",
      "archived",
      "rejected",
    ]) {
      expect(createVenueSchema.parse({ ...venueBase, status }).status).toBe(
        status,
      );
    }
  });

  it("rejects stale frontend-only values", () => {
    for (const bad of ["pending_review", "published", "suspended"]) {
      expect(() =>
        createVenueSchema.parse({ ...venueBase, status: bad }),
      ).toThrow();
    }
  });
});

describe("usernameSchema", () => {
  it("lowercases and trims a valid username", () => {
    expect(usernameSchema.parse(" Multi.Role_1 ")).toBe("multi.role_1");
  });

  it.each(["bad name", "a@b!", "hi-there", "ab", "fox😀", "a".repeat(31), "a".repeat(100)])(
    "rejects %j",
    (value) => {
      expect(usernameSchema.safeParse(value).success).toBe(false);
    },
  );

  it("names the allowed characters when a space is used", () => {
    const result = usernameSchema.safeParse("bad name");
    expect(result.error?.issues[0].message).toMatch(/letters, numbers, dots and underscores/);
  });
});

describe("field limits", () => {
  const service = { ...serviceBase };

  it("rejects a name over 100 characters and explains why", () => {
    const result = createServiceSchema.safeParse({
      ...service,
      name: "a".repeat(NAME_MAX + 1),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Names can be up to 100 characters.",
    );
    expect(
      createServiceSchema.safeParse({ ...service, name: "a".repeat(NAME_MAX) })
        .success,
    ).toBe(true);
  });

  it("rejects a service description over 500 characters", () => {
    const over = "a".repeat(DESCRIPTION_MAX + 1);
    expect(
      createServiceSchema.safeParse({ ...service, description: over }).success,
    ).toBe(false);
  });

  it("rejects a negative service price with a clear message", () => {
    const result = createServiceSchema.safeParse({ ...service, price: -1 });
    expect(result.error?.issues[0].message).toBe("Prices cannot be negative.");
  });

  it.each([
    ["above the maximum", PRICE_MAX + 0.01],
    ["three decimals", 1.005],
  ])("rejects a price %s", (_label, price) => {
    expect(createServiceSchema.safeParse({ ...service, price }).success).toBe(
      false,
    );
  });

  it("keeps event descriptions up to 5000 characters and venue up to 2000", () => {
    expect(
      createEventSchema.shape.description.safeParse(
        "a".repeat(EVENT_DESCRIPTION_MAX),
      ).success,
    ).toBe(true);
    expect(
      createEventSchema.shape.description.safeParse(
        "a".repeat(EVENT_DESCRIPTION_MAX + 1),
      ).success,
    ).toBe(false);
    expect(
      createVenueSchema.shape.description.safeParse(
        "a".repeat(LONG_DESCRIPTION_MAX + 1),
      ).success,
    ).toBe(false);
  });

  it.each([0, -5, QUANTITY_MAX + 1, 2_147_483_648, 1.5])(
    "rejects capacity and attendees of %s",
    (value) => {
      expect(createVenueSchema.shape.capacity.safeParse(value).success).toBe(
        false,
      );
      expect(
        createEventSchema.shape.maxAttendees.safeParse(value).success,
      ).toBe(false);
    },
  );

  it("accepts capacity at 1 and at the maximum", () => {
    expect(createVenueSchema.shape.capacity.safeParse(1).success).toBe(true);
    expect(
      createVenueSchema.shape.capacity.safeParse(QUANTITY_MAX).success,
    ).toBe(true);
  });
});

describe("form limit messages", () => {
  it("returns null for fine or empty values", () => {
    expect(nameError("")).toBeNull();
    expect(nameError("Fox Hall")).toBeNull();
    expect(quantityError("")).toBeNull();
    expect(quantityError("200")).toBeNull();
    expect(priceError("")).toBeNull();
    expect(priceError(0)).toBeNull();
  });

  it("flags the cases from the bug report", () => {
    expect(nameError("a".repeat(101))).toMatch(/up to 100 characters/);
    expect(quantityError("10000000")).toMatch(/1 to 100,000/);
    expect(quantityError("-3")).toMatch(/1 to 100,000/);
    expect(priceError(-5)).toBe("Prices cannot be negative.");
    expect(priceError("12.345")).toMatch(/at most 2 decimals/);
  });

  it("returns the first broken limit for the save gates", () => {
    expect(firstLimitError({ name: "ok", price: -1 })).toBe(
      "Prices cannot be negative.",
    );
    expect(firstLimitError({ name: "ok", quantity: "5", price: 10 })).toBeNull();
  });
});
