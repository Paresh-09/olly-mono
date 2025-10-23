import { Footer } from "../(marketing)/_components/footer";
import { Header } from "../(marketing)/_components/navbar-1";
import { PreFooter } from "../(marketing)/_components/pre-footer";
import { SquaresPattern } from "../(marketing)/_components/squares-pattern";
import { PricingProvider } from "../web/providers/pricingContext";

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-full dark:bg-[#1F1F1F]">
      {/* <Navbar /> */}

      <PricingProvider>
        <main className="flex-grow pt-12 md:pt-20 isolate">
          {children}
          <SquaresPattern />
        </main>
      </PricingProvider>

    </div>
  );
}

export default MobileLayout;
