'use client';

import CarList from './CarList';

export default function CarListWrapper() {
  // Since we've removed authentication, just render the CarList directly
  return <CarList />;
} 