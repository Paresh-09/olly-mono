import { CTAButtons } from "./cta-buttons";

interface CTAProps {
  customLink?: string;
  customText?: string;
}

export function CTA({ customLink, customText }: CTAProps = {}) {
  return (
    <div className="relative mt-12 px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-cal text-3xl text-gray-900 sm:text-4xl">
          Boost your productivity.
          <br />
          Start using Olly today.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
          Olly uses AI to improve your Social Media Engagement. What previously
          took hours, now takes seconds. Olly is your
          Social Media Sidekick in your browser.
        </p>
        <CTAButtons customLink={customLink} customText={customText} />
      </div>
    </div>
  );
}
