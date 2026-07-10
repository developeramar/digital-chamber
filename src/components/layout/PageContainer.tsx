import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="flex-grow overflow-y-auto px-4 md:px-8 py-6 w-full">
      {children}
    </main>
  );
}
