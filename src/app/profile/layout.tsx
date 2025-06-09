import React from 'react';

export const metadata = {
  title: 'Profile - BCA Buy Sell',
  description: 'Your profile information',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div>
      {children}
    </div>
  );
} 