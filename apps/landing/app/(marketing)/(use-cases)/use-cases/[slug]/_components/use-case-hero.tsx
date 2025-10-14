import Image from 'next/image';

interface UseCaseHeroProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export function UseCaseHero({ title, subtitle, description, image }: UseCaseHeroProps) {
  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <h2 className="mt-3 text-base font-medium text-indigo-600 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
              {subtitle}
            </h2>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg md:mt-5 md:text-xl lg:mx-0">
              {description}
            </p>
            <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <a
                  href="#"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:py-4 md:px-10 md:text-lg"
                >
                  Get started
                </a>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <a
                  href="#"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-100 px-8 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-200 md:py-4 md:px-10 md:text-lg"
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
          <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full overflow-hidden rounded-lg">
                <Image
                  src={'/olly_home.png'}
                  alt={title}
                  width={800}
                  height={600}
                  className="w-full rounded-lg object-cover"
                  priority
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
