import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { Header } from "./navbar-1";
import { PreFooter } from "./pre-footer";

export function BasicLayout(props: { children: React.ReactNode }) {
  return (
    <div className="bg-white">
      <Header />
      <main className="isolate">{props.children}</main>
      <PreFooter />
      <Footer />
    </div>
  );
}
