import Link from "next/link";
const navigation = {
  main: [
    { name: "LinkedIn Comment Generator", href: "/products/linkedin-comment-generator" },
    { name: "Twitter / X Comment Generator", href: "/products/twitter-x-comment-generator" },
    { name: "Facebook Comment Generator", href: "/products/facebook-comment-generator" },
    { name: "Reddit Comment Generator", href: "/products/reddit-comment-generator" },
    { name: "Product Hunt Comment Generator", href: "/products/product-hunt-comment-generator" },
    { name: "YouTube Comment Generator", href: "/products/youtube-comment-generator" },
    { name: "Instagram Comment Generator", href: "/products/instagram-comment-generator" },
    { name: "All Products", href: "/products" },
  ],
  tools: [
    { name: "TikTok Comment Generator", href: "/tools/tiktok-comment-generator" },
    { name: "Instagram Comment Generator", href: "/tools/instagram-comment-generator" },
    { name: "YouTube Shorts Comment Generator", href: "/tools/youtube-shorts-comment-generator" },
    { name: "All Tools", href: "/tools" },
  ],
  otherTools: [
    { name: "Olly Social", href: "https://www.olly.social/", target: "_blank" },
    { name: "ExplainX", href: "https://www.explainx.ai/", target: "_blank" },
    { name: "BG Blur", href: "https://bgblur.com/", target: "_blank" },
    { name: "Video Background Remover", href: "https://bgremover.video/", target: "_blank" },
    { name: "Image Background Remover", href: "https://www.removebackground.pics/", target: "_blank" }
  ],
  comparisons: [
    { name: "Olly vs Engage AI co", href: "/compare/engageai" },
    { name: "Olly vs Replai", href: "/compare/replai" },
    { name: "Olly vs Magic Reply", href: "/compare/magicreply" },
    { name: "All Comparisons", href: "/compare" },
  ],
  support: [
    { name: "Pricing", href: "/#pricing" },
    { name: "Contact", href: "mailto:support@explainx.ai", target: "_blank" },
    { name: "Feature Requests", href: "mailto:support@explainx.ai", target: "_blank" },
    { name: "Cost Calculator", href: "/ai-cost-calculators" },
  ],
  company: [
    { name: "Blog", href: "/blog" },
    { name: "Affiliates", href: "https://olly-ai.lemonsqueezy.com/affiliates", target: "_blank" },
    { name: "Twitter", href: "https://twitter.com/olly_social", target: "_blank" },
    // { name: "GitHub", href: "/github", target: "_blank" },
    // { name: "Discord", href: "/discord", target: "_blank" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Contact", href: "/contact", target: "_blank" },
    { name: "Feature Requests", href: "mailto:support@explainx.ai", target: "_blank" },
    { name: "FAQ", href: "/#faq" },
    { name: "Docs", href: "https://docs.olly.social/" },
    // { name: "Who m", href: "https://goyashy.com", target: "_blank" },
  ],
  legal: [
    { name: "How to Use?", href: "/activation-guide" },
    { name: "Privacy", href: "/privacy-policy" },
    { name: "Terms", href: "/terms" },
    { name: "Sitemap", href: "/sitemap.xml" },
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/olly_social",
      target: "_blank",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/olly-social",
      target: "_blank",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 192 192" {...props}>
          <path d="M156,0h-120c-19.875,0 -36,16.125 -36,36v120c0,19.875 16.125,36 36,36h120c19.875,0 36,-16.125 36,-36v-120c0,-19.875 -16.125,-36 -36,-36zM59.36539,162.98077h-29.82693l-0.17307,-89.30769h29.82692zM43.70192,61.99038h-0.17308c-9.75,0 -16.03846,-6.72115 -16.03846,-15.08653c0,-8.56731 6.49039,-15.0577 16.41347,-15.0577c9.92308,0 16.00961,6.49038 16.21153,15.0577c0,8.36538 -6.31731,15.08653 -16.41346,15.08653zM162.77885,162.98077h-30.08654v-48.51923c0,-11.74039 -3.11538,-19.73077 -13.61538,-19.73077c-8.01923,0 -12.34615,5.39423 -14.42308,10.61538c-0.77885,1.875 -0.98077,4.44231 -0.98077,7.06731v50.56731h-30.23077l-0.17308,-89.30769h30.23077l0.17308,12.60577c3.86538,-5.97116 10.29808,-14.42308 25.70192,-14.42308c19.09616,0 33.37501,12.46154 33.37501,39.25961v51.86539z"></path>
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/olly.social_app",
      target: "_blank",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 448 512" {...props}>
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
        </svg>
      ),
    },
    {
      name: "Discord",
      href: "https://discord.gg/Phg8nwJEek",
      target: "_blank",
      icon: (props: any) => (
        <svg width="100" height="100" viewBox="0 0 48 48" {...props}>
          <path
            fill="currentColor"
            d="M40,12c0,0-4.585-3.588-10-4l-0.488,0.976C34.408,10.174,36.654,11.891,39,14c-4.045-2.065-8.039-4-15-4s-10.955,1.935-15,4c2.346-2.109,5.018-4.015,9.488-5.024L18,8c-5.681,0.537-10,4-10,4s-5.121,7.425-6,22c5.162,5.953,13,6,13,6l1.639-2.185C13.857,36.848,10.715,35.121,8,32c3.238,2.45,8.125,5,16,5s12.762-2.55,16-5c-2.715,3.121-5.857,4.848-8.639,5.815L33,40c0,0,7.838-0.047,13-6C45.121,19.425,40,12,40,12z M17.5,30c-1.933,0-3.5-1.791-3.5-4c0-2.209,1.567-4,3.5-4s3.5,1.791,3.5,4C21,28.209,19.433,30,17.5,30z M30.5,30c-1.933,0-3.5-1.791-3.5-4c0-2.209,1.567-4,3.5-4s3.5,1.791,3.5,4C34,28.209,32.433,30,30.5,30z"
          />
        </svg>
      ),
    },
    // {
    //   name: "GitHub",
    //   href: "/github",
    //   target: "_blank",
    //   icon: (props: any) => (
    //     <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    //       <path
    //         fillRule="evenodd"
    //         d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    //         clipRule="evenodd"
    //       />
    //     </svg>
    //   ),
    // },
  ],
};

export function PreFooter() {
  return (
    <footer className="relative z-50 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Navigation grid */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <FooterList title="Products" items={navigation.main.slice(0, 6)} />
          </div>
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-8">
              <FooterList title="Free Tools" items={navigation.tools} />
            </div>
            <FooterList title="Compare" items={navigation.comparisons} />
          </div>
          <div className="col-span-1">
            <FooterList title="Company" items={navigation.company.slice(0, 6)} />
          </div>
          <div className="col-span-1">
            <FooterList title="Support" items={[
              { name: "Help Center", href: "https://docs.olly.social/", target: "_blank" },
              { name: "Contact Us", href: "/contact" },
              { name: "Feature Requests", href: "mailto:support@explainx.ai", target: "_blank" },
              { name: "Pricing", href: "/#pricing" },
              { name: "FAQ", href: "/#faq" },
            ]} />
          </div>
          <div className="col-span-1">
            <FooterList title="Legal" items={navigation.legal} />
          </div>
          <div className="col-span-1">
            <FooterList title="Other Tools" items={navigation.otherTools} />
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} AISOLO Technologies Private Limited
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <Link href="/privacy-policy" className="hover:text-gray-700 transition-colors">
                  Privacy
                </Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-gray-700 transition-colors">
                  Terms
                </Link>
                <span>•</span>
                <Link href="/sitemap.xml" className="hover:text-gray-700 transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made with</span>
              <span className="text-red-500">♥</span>
              <span>for creators worldwide</span>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-8 flex justify-center space-x-6">
            {navigation.social.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.target}
                className="group relative p-3 rounded-full bg-white shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon
                  className="h-5 w-5 text-gray-500 group-hover:text-blue-600 transition-colors"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterList(props: {
  title: string;
  items: { name: string; href: string; target?: string }[];
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold leading-6 text-gray-900 uppercase tracking-wider">
        {props.title}
      </h3>
      <ul role="list" className="space-y-3">
        {props.items.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              target={item.target}
              prefetch={item.target !== "_blank"}
              className="text-sm leading-6 text-gray-600 hover:text-blue-600 transition-colors duration-200 block group"
            >
              <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                {item.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}