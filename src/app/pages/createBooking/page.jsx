// pages/createBooking/index.tsx

"use client"
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const CreateBookingForm = dynamic(() => import('../../components/createBookingForm'), {
  ssr: false,
});

export default function CreateBooking() {
  return (
    <Suspense fallback="Loading...">
      <CreateBookingForm />
    </Suspense>
  );
}