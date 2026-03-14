import { vi, describe, test, beforeEach, expect } from "vitest";

vi.mock("@/lib/mongodb", () => ({ default: async () => undefined }));

import { assignTransporterService } from "../services/assignTransporterService";
import Order from "../models/Order";
import User from "../models/User";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("assignTransporterService", () => {
  test("is idempotent when assigning same transporter", async () => {
    const order: any = {
      _id: "order1",
      transporter: { toString: () => "t1" },
      buyer: "b1",
      seller: "s1",
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Order, "findById").mockResolvedValue(order as any);

    const result = await assignTransporterService({ id: "b1", role: "acheteur" }, "order1", { transporterId: "t1" });

    expect(result).toBe(order);
  });

  test("assigns transporter when valid", async () => {
    const order: any = {
      _id: "order2",
      transporter: undefined,
      buyer: "b1",
      seller: "s1",
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Order, "findById").mockResolvedValue(order as any);
    vi.spyOn(User, "findOne").mockResolvedValue({ _id: "t2", role: "transporteur" } as any);

    const result = await assignTransporterService({ id: "b1", role: "acheteur" }, "order2", { transporterId: "t2" });

    expect(result.transporter).toBe("t2");
    expect(order.save).toHaveBeenCalled();
  });

  test("throws when transporter not found or invalid role", async () => {
    const order: any = {
      _id: "order3",
      transporter: undefined,
      buyer: "b1",
      seller: "s1",
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Order, "findById").mockResolvedValue(order as any);
    vi.spyOn(User, "findOne").mockResolvedValue(null as any);

    await expect(assignTransporterService({ id: "b1", role: "acheteur" }, "order3", { transporterId: "t3" })).rejects.toThrow();
  });

  test("only buyer, seller or admin can modify", async () => {
    const order: any = {
      _id: "order4",
      transporter: undefined,
      buyer: "b1",
      seller: "s1",
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Order, "findById").mockResolvedValue(order as any);

    await expect(assignTransporterService({ id: "other", role: "acheteur" }, "order4", { transporterId: "t3" })).rejects.toThrow();
  });
});