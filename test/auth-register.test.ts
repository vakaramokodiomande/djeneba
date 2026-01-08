import { beforeEach, describe, it, expect, vi } from 'vitest';

// Mock connectDB to avoid real DB connections and avoid mongodb-memory-server
vi.mock('../../lib/mongodb', () => ({ default: async () => Promise.resolve() }));
vi.mock('@/lib/mongodb', () => ({ default: async () => Promise.resolve() }));

// In-memory fake for User model
const users: any[] = [];
vi.mock('../../models/User', () => {
  return {
    default: {
      create: async (data: any) => {
        const u = { ...data, _id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
        users.push(u);
        return u;
      },
      findOne: async (query: any) => users.find((u) => u.email === query.email) || null,
    },
  };
});
vi.mock('@/models/User', () => ({
  default: {
    create: async (data: any) => {
      const u = { ...data, _id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
      users.push(u);
      return u;
    },
    findOne: async (query: any) => users.find((u) => u.email === query.email) || null,
  },
}));

beforeEach(() => {
  // reset module cache and in-memory users before each test
  users.length = 0;
  vi.resetModules();
});

describe('POST /api/auth/register', () => {
  it('creates a transporteur successfully', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const payload = {
      name: 'Test Transporteur',
      email: 'test.transporteur@example.com',
      password: 'secret123',
      role: 'transporteur',
      companyName: 'TransCo',
      vehicleType: 'camion_moyen',
      vehicleCapacity: 5,
      vehiclePlate: 'ML-1234-AB',
      coverageZones: ['Bamako', 'Sikasso'],
      pricePerKm: 500,
      basePrice: 50000,
    };

    const mockReq: any = { json: async () => payload };

    const res: any = await POST(mockReq as Request);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.user).toBeTruthy();
    expect(body.user.role).toBe('transporteur');

    // Verify DB contains user via mocked model
    const User = (await import("@/models/User")).default;
    const created = await User.findOne({ email: payload.email });
    expect(created).toBeTruthy();
    expect(created?.companyName).toBe(payload.companyName);
    expect(created?.vehicleType).toBe(payload.vehicleType);
  });

  it('creates a producteur successfully', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const payload = { name: 'Test Producteur', email: 'test.producteur@example.com', password: 'secret123', role: 'producteur' };

    const mockReq: any = { json: async () => payload };
    const res: any = await POST(mockReq as Request);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.user.role).toBe('producteur');
  });

  it('rejects invalid role', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const payload = { name: 'Test Invalid', email: 'test.invalid@example.com', password: 'secret123', role: 'invalid_role' };
    const mockReq: any = { json: async () => payload };
    const res: any = await POST(mockReq as Request);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBeTruthy();
  });
});