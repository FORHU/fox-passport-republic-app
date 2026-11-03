import { describe, expect, it } from "vitest";
import { getApiErrorMessage, uploadErrorMessage } from "../apiError";

const failure = (status: number, data: unknown) => ({ response: { status, data } });

describe("getApiErrorMessage", () => {
  it("shows the sentence a 4xx carries", () => {
    expect(getApiErrorMessage(failure(400, { message: "Posts can be up to 5,000 characters." }), "x")).toBe(
      "Posts can be up to 5,000 characters.",
    );
  });

  it("falls back to data.error and plain string bodies", () => {
    expect(getApiErrorMessage(failure(422, { error: "Pick a later end date." }), "x")).toBe("Pick a later end date.");
    expect(getApiErrorMessage(failure(413, "File is too large."), "x")).toBe("File is too large.");
  });

  it("masks 5xx messages", () => {
    expect(getApiErrorMessage(failure(500, { message: "P2002 on User.email" }), "fallback")).toBe("fallback");
  });

  it("masks developer-oriented validation text", () => {
    expect(
      getApiErrorMessage(failure(400, { message: '"content" length must be less than or equal to 5000 characters long' }), "fallback"),
    ).toBe("fallback");
    expect(getApiErrorMessage(failure(400, { message: '"endDate" must be greater than or equal to "ref:date"' }), "fallback")).toBe("fallback");
  });

  it("never returns an axios error message or handles a missing response", () => {
    expect(getApiErrorMessage(new Error("Request failed with status code 400"), "fallback")).toBe("fallback");
    expect(getApiErrorMessage(null, "fallback")).toBe("fallback");
    expect(getApiErrorMessage(failure(400, {}), "fallback")).toBe("fallback");
  });
});

describe("uploadErrorMessage", () => {
  it("blames the connection only when there was no response", () => {
    expect(uploadErrorMessage({ message: "Network Error" })).toMatch(/connection/);
    expect(uploadErrorMessage(failure(400, { message: "This file is empty." }))).toBe("This file is empty.");
  });

  it("maps size and storage rejections by status", () => {
    expect(uploadErrorMessage(failure(413, "<Error/>"), true)).toMatch(/too large/);
    expect(uploadErrorMessage(failure(403, "<Error/>"), true)).toMatch(/refused/);
    expect(uploadErrorMessage(failure(500, { message: "boom" }))).toMatch(/Try a different file/);
  });
});
