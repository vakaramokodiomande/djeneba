import { vi, describe, test, beforeEach, expect } from "vitest";

// Mock DB connect to avoid environment-specific connection
vi.mock("@/lib/mongodb", () => ({ default: async () => undefined }));

import Listing from "../models/Listing";
import Order from "../models/Order";
import { createOrder } from "../services/orderService";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Order service (mocked DB)", () => {
  test("creates order and reserves quantity", async () => {
    const producerId = "producer123";

    // Mock Listing.findById
    const listing: any = {
      _id: "listing1",
      status: "active",
      price: 100,
      quantity: 50,
      soldQuantity: 0,
      reservedQuantity: 0,
      producer: producerId,
      hasAvailableQuantity: (q: number) => q <= 50,
      reserveQuantity: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Listing, "findById").mockResolvedValue(listing as any);

    // Mock Order.create
    vi.spyOn(Order, "create").mockImplementation(async (data: any) => ({ ...data, _id: "order1" } as any));

    // Mock findOneAndUpdate to simulate successful atomic reserve
    vi.spyOn(Listing, "findOneAndUpdate").mockResolvedValue({ ...listing, reservedQuantity: 10 } as any);

    const buyer = { id: "buyer1", role: "acheteur" };

    const order = await createOrder(buyer, { listingId: listing._id, quantity: 10 });

    expect(order.quantity).toBe(10);
    expect(Listing.findOneAndUpdate).toHaveBeenCalled();
  });

  test("rejects when buyer tries to order own product", async () => {
    const producerId = "producer123";

    const listing: any = {
      _id: "listing2",
      status: "active",
      price: 100,
      quantity: 50,
      soldQuantity: 0,
      reservedQuantity: 0,
      producer: producerId,
      hasAvailableQuantity: (q: number) => true,
      reserveQuantity: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Listing, "findById").mockResolvedValue(listing as any);
    vi.spyOn(Listing, "findOneAndUpdate").mockResolvedValue(null as any);

    const buyer = { id: producerId, role: "acheteur" };

    // findOneAndUpdate should not be called (we reject earlier)
    await expect(createOrder(buyer, { listingId: listing._id, quantity: 5 })).rejects.toThrow();
    expect(Listing.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("rejects when insufficient quantity", async () => {
    const producerId = "producer123";

    const listing: any = {
      _id: "listing3",
      status: "active",
      price: 100,
      quantity: 5,
      soldQuantity: 0,
      reservedQuantity: 0,
      producer: producerId,
      hasAvailableQuantity: (q: number) => false,
      reserveQuantity: vi.fn().mockResolvedValue(undefined),
    };

    vi.spyOn(Listing, "findById").mockResolvedValue(listing as any);

    // Make a spy on findOneAndUpdate but since hasAvailableQuantity returns false, it should not be called
    vi.spyOn(Listing, "findOneAndUpdate").mockResolvedValue(null as any);

    const buyer = { id: "buyer2", role: "acheteur" };

    await expect(createOrder(buyer, { listingId: listing._id, quantity: 10 })).rejects.toThrow();
    expect(Listing.findOneAndUpdate).not.toHaveBeenCalled();
  });
});