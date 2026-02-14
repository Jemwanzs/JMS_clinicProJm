import React from "react";

const MaintenancePage = () => (
  <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-center">
    <div className="rounded-full bg-primary/10 p-4 mb-4">
      <svg
        className="h-12 w-12 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </div>
    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
      System Maintenance
    </h1>
    <p className="mt-4 max-w-[600px] text-muted-foreground md:text-xl">
      We are currently pushing some exciting updates to the platform. 
      Please check back in a few minutes!
    </p>
  </div>
);

export default MaintenancePage;