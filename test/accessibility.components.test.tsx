import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { vi, expect, describe, test } from 'vitest';
import { SessionProvider } from 'next-auth/react';

// Mocks for Next hooks
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

import OrderForm from '../components/OrderForm';
import ImageUploader from '../components/ImageUploader';
import DashboardHeader from '../components/DashboardHeader';

expect.extend(toHaveNoViolations as any);

describe('Component accessibility tests (axe)', () => {
  test('OrderForm should have no detectable a11y violations', async () => {
    const { container } = render(
      <OrderForm
        listingId="test"
        pricePerUnit={1000}
        availableQuantity={10}
        unit="kg"
        sellerName="Test Seller"
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('ImageUploader should have no detectable a11y violations', async () => {
    const { container } = render(
      <ImageUploader images={[]} onImagesChange={() => { }} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });


  test('DashboardHeader should have no detectable a11y violations', async () => {
    const { container } = render(
      <SessionProvider session={null}>
        <DashboardHeader />
      </SessionProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
