import Image from "next/image";
import Link from "next/link";


export const Logo = () => {
  return (
    <div className="hidden md:flex items-center gap-x-2">
      <Image
        src="/logo2.webp"
        height="40"
        width="40"
        alt="Logo"
        className="dark:hidden"
      />
      <Image
        src="/logo2.webp"
        height="40"
        width="40"
        alt="Logo"
        className="hidden dark:block"
      />
      <Link href="/" passHref>
        <p className="font-semibold">
          Your Social Media Sidekick.
        </p>
      </Link>
    </div>
  )
}