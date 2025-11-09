// apps/web/src/components/layout/AppContainer.tsx
import React from "react";

/*
  AppContainer = layout principal:
  - Empêche le scroll horizontal (overflow-x-hidden)
  - Centre le contenu et limite la largeur (max-w-* responsive)
  - Applique des paddings cohérents mobile-first
  - Assure min-h-screen pour éviter les débordements
*/
export default function AppContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-neutral-900 text-neutral-100">
      <main className="mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-screen-lg">
        {children}
      </main>
    </div>
  );
}
