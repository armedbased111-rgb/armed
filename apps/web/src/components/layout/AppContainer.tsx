import React from "react";

export default function AppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <main className="mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-screen-2xl">
        {children}
      </main>
    </div>
  );
}
