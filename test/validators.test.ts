import { describe, test, expect } from "vitest";
import { assignTransporterSchema, orderSchema, registerSchema } from "../lib/validators";

describe("Validators — assignTransporterSchema", () => {
  test("accepts valid payload", () => {
    const result = assignTransporterSchema.safeParse({
      transporterId: "64b9f1e0c5e6b0a6d4f0a1b2",
      transportPrice: 150.5,
      estimatedDeliveryDate: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  test("rejects empty transporterId", () => {
    const result = assignTransporterSchema.safeParse({ transporterId: "" });
    expect(result.success).toBe(false);
  });

  test("rejects negative price", () => {
    const result = assignTransporterSchema.safeParse({ transporterId: "abc", transportPrice: -10 });
    expect(result.success).toBe(false);
  });

  test("rejects invalid date", () => {
    const result = assignTransporterSchema.safeParse({ transporterId: "abc", estimatedDeliveryDate: "not-a-date" });
    expect(result.success).toBe(false);
  });
});

describe("Validators — orderSchema", () => {
  test("accepts valid order", () => {
    const result = orderSchema.safeParse({ listingId: "l1", quantity: 5, paymentMethod: "cash" });
    expect(result.success).toBe(true);
  });

  test("rejects missing listingId", () => {
    const result = orderSchema.safeParse({ quantity: 1 });
    expect(result.success).toBe(false);
  });

  test("rejects non-positive quantity", () => {
    const result = orderSchema.safeParse({ listingId: "l1", quantity: 0 });
    expect(result.success).toBe(false);
  });
});

describe("Validators — registerSchema (basic checks)", () => {
  test("accepts basic user", () => {
    const result = registerSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "secret12",
      role: "acheteur",
    });
    expect(result.success).toBe(true);
  });

  test("rejects short password", () => {
    const result = registerSchema.safeParse({ name: "A", email: "bad", password: "123", role: "acheteur" });
    expect(result.success).toBe(false);
  });
});