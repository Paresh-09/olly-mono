import React from "react";

const ToolsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <h1 className="font-semibold">Olly Tools</h1>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default ToolsLayout;