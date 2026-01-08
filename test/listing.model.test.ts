import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Listing from "../models/Listing";
import { beforeAll, afterAll, beforeEach, describe, test, expect } from "vitest";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Listing.deleteMany({});
});

describe("Listing model stock behavior", () => {
  test("reserveQuantity and hasAvailableQuantity behavior", async () => {
    const listing = await Listing.create({
      title: "Test",
      description: "Desc",
      price: 1000,
      quantity: 100,
      location: "Testville",
      producer: new mongoose.Types.ObjectId(),
    });

    expect(listing.hasAvailableQuantity(50)).toBe(true);

    await listing.reserveQuantity(50);
    const fresh = await Listing.findById(listing._id);
    expect(fresh?.reservedQuantity).toBe(50);
    expect(fresh?.hasAvailableQuantity(51)).toBe(false);

    // Reserving more than available should throw
    await expect(listing.reserveQuantity(60)).rejects.toThrow();
  });

  test("markAsSold reduces reserved and sets status to sold when depleted", async () => {
    const listing = await Listing.create({
      title: "Test",
      description: "Desc",
      price: 1000,
      quantity: 20,
      location: "Testville",
      producer: new mongoose.Types.ObjectId(),
      reservedQuantity: 20,
    });

    await listing.markAsSold(20);
    const fresh = await Listing.findById(listing._id);
    expect(fresh?.reservedQuantity).toBe(0);
    expect(fresh?.soldQuantity).toBe(20);
    expect(fresh?.status).toBe("sold");
  });
});