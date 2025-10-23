"use client";
import React from "react";
import StickyBanner from "./tools/_components/sticky";
import { Navbar } from "../(marketing)/_components/navbar";
import { Footer } from "../(marketing)/_components/footer";
import { PreFooter } from "../(marketing)/_components/pre-footer";
import { Header } from "../(marketing)/_components/navbar-1";

const ToolsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <StickyBanner show={true} /> */}
      <main className="flex-grow pt-[96px]">{children}</main>

    </div>
  );
};

export default ToolsLayout;