import clsx from "clsx";
import Image from "next/image";
import UserReviewsData from "./user-reviews-data";

const featuredTestimonial = {
  body: "Great work guys!!! Never stop, my favorite tool, has been ",
  highlightedText: "incredible for my business.",
  author: {
    name: "Noah Swiderski",
    handle: "britonmedia",
    imageUrl:
      "/testimonial/noah.jpg",
    logoUrl: "/testimonial/briton.png"
  },
};

const testimonials: {
  body: string;
  highlightedText?: string;
  afterHighlight?: string;
  author: {
    name: string;
    handle: string;
    imageUrl: string;
  };
}[][][] = [
    [
      [
        {
          body: "Congratulations on the launch. Just got myself a lifetime subscription. Its helping me ",
          highlightedText: "summarise the post better",
          afterHighlight: " for now, whereas i am keeping my own views.",
          author: {
            name: "Aman Sharma",
            handle: "amanintech",
            imageUrl: "https://ph-avatars.imgix.net/2179893/0b68c40a-0596-4222-bb92-03b99c41bb4e.png",
          },
        },
        {
          body: "Congratulations on the launch! This tool could be a ",
          highlightedText: "gamechanger for any SMM agency",
          afterHighlight: " or any business looking to boost their engagement with users/audience online without having to allocate limited time and resources to it.",
          author: {
            name: "Roberto Perez",
            handle: "rockyperezz",
            imageUrl: "https://ph-avatars.imgix.net/6212118/e65b8927-e1df-4197-a6ea-c75f1c20ee6f.gif",
          },
        },
        {
          body: "Love the pay what you use business model, as a user. Not sure how scalable that will turn out to be from a business perspective ... but that's not my problem I guess! Great work team, hope you make it to the top",
          author: {
            name: "Florian Myter",
            handle: "florian_myter",
            imageUrl:
              "https://ph-avatars.imgix.net/5413468/c0037336-08b0-4570-9375-0ea68c9b2563.png",
          },
        },
      ],
      [
        {
          body: `Best for LinkedIn: Right from the first comment that Olly crafted, I knew I would be using it for all of my socials. I especially love how it writes on LinkedIn. I only wish if I could avoid highlighting the content before it can write a comment..and make the tone and purpose available more intuitively? Even without those features, this is a steal!`,
          author: {
            name: "AppSumo User",
            handle: "jazzyb9090",
            imageUrl:
              "https://appsumo2-cdn.appsumo.com/media/users/avatars/image-1244211669559.jpg?width=256&height=256&aspect_ratio=1:1",
          },
        },
      ],
    ],
    [
      [
        {
          body: "Actually, a very useful product for those who do active social media marketing. Congratulations on the launch!",
          author: {
            name: "Alex Egorov",
            handle: "alex_egorov",
            imageUrl:
              "https://ph-avatars.imgix.net/3695082/53ef7bc8-b0d2-40c0-96df-1873caf289d9.gif",
          },
        },
        {
          body: "Congratulations, @goyashy! The virality score feature caught my eye. I envision this tool as a valuable resource to enhance the quality of written posts, making it essential for content creators.",
          author: {
            name: "Chirag",
            handle: "chiragshelar",
            imageUrl:
              "https://ph-avatars.imgix.net/6429993/c24d940d-c5c0-4ca9-903f-0e5e91a2b8ea.png",
          },
        }
      ],
      [
        {
          body: "It's really awesome to see a tool that makes commenting this easy.",
          author: {
            name: "Mike Wakoz",
            handle: "mike_wakoz",
            imageUrl:
              "https://ph-avatars.imgix.net/5873417/8599ac4a-12c3-476d-8e1a-e1c78f9e786e.jpeg",
          },
        },
        {
          body: `congratulation Yash Olly is prefect example of best use of Ai keep it up bro..`,
          author: {
            name: "Jawad Naeem",
            handle: "jawadnaeem243",
            imageUrl:
              "https://ph-avatars.imgix.net/6557527/18bf441a-1347-4969-a7ad-95fe4352cea5.jpeg",
          },
        },
      ],
    ],
  ];

// const testimonials: {
//     body: string;
//     author: {
//       name: string;
//       handle: string;
//       imageUrl: string;
//     };
//   }[][][] = UserReviewsData.map((reviewData) => [
//     [
//       {
//         body: reviewData.review,
//         author: {
//           name: reviewData.reviewerName,
//           handle: reviewData.userName || "",
//           imageUrl: reviewData.userImage || "",
//         },
//       },
//     ],
//   ]);


export function Testimonials() {
  return (
    <div className="relative isolate pb-20 pt-24 sm:pb-32 sm:pt-32 " id="testimonials">
      {/* Grid Background */}

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">

          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Trusted by thousands of<br />
            <span className="text-teal-600">professionals worldwide</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-gray-700 max-w-2xl mx-auto font-medium">
            See how industry leaders are transforming their social media strategy with our platform
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
          {/* Featured testimonial */}
          <figure className="col-span-1 sm:col-span-2 xl:col-start-2 xl:row-end-1">
            <div className="group relative overflow-hidden rounded-2xl bg-white backdrop-blur-sm shadow-lg ring-1 ring-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-teal-300">
              <div className="relative">
                <div className="p-8 sm:p-10 lg:p-12">
                  <div className="flex items-start gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-teal-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="text-lg sm:text-xl font-medium leading-8 text-gray-800">
                    <p className="relative">
                      {featuredTestimonial.body}
                      <span className="relative inline-block font-semibold">
                        <span className="absolute inset-0 bg-teal-100 -z-10 rounded-md px-1 py-0.5" />
                        <span className="relative text-teal-700">{featuredTestimonial.highlightedText}</span>
                      </span>
                    </p>
                  </blockquote>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-8 py-6 sm:px-10">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <Image
                        className="h-full w-full rounded-full object-cover ring-2 ring-white shadow-md"
                        src={featuredTestimonial.author.imageUrl}
                        alt=""
                        width={48}
                        height={48}
                      />
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-teal-500 ring-2 ring-white"></div>
                    </div>
                    <div className="flex-auto min-w-0">
                      <div className="font-semibold text-gray-900">{featuredTestimonial.author.name}</div>
                      <div className="text-sm text-gray-600">@{featuredTestimonial.author.handle}</div>
                    </div>
                    <Image
                      className="h-8 w-auto flex-none opacity-70"
                      src={featuredTestimonial.author.logoUrl}
                      alt=""
                      height={32}
                      width={98}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </figure>

          {testimonials.map((columnGroup, columnGroupIdx) => (
            <div key={columnGroupIdx} className="space-y-6 sm:space-y-8 xl:contents xl:space-y-0">
              {columnGroup.map((column, columnIdx) => (
                <div
                  key={columnIdx}
                  className={clsx(
                    (columnGroupIdx === 0 && columnIdx === 0) ||
                      (columnGroupIdx === testimonials.length - 1 &&
                        columnIdx === columnGroup.length - 1)
                      ? "xl:row-span-2"
                      : "xl:row-start-1",
                    "space-y-6 sm:space-y-8"
                  )}
                >
                  {column.map((testimonial) => (
                    <figure
                      key={testimonial.author.handle}
                      className="group relative overflow-hidden rounded-2xl bg-white backdrop-blur-sm p-6 sm:p-8 shadow-md ring-1 ring-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:ring-teal-300"
                    >
                      <div className="relative">
                        {/* Star rating */}
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="h-4 w-4 text-teal-500 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>

                        <blockquote className="text-gray-800">
                          <p className="text-sm sm:text-base leading-6 sm:leading-7 font-medium">
                            {testimonial.body}
                            {testimonial.highlightedText && (
                              <span className="relative inline-block font-semibold">
                                <span className="absolute inset-0 bg-teal-100 -z-10 rounded-md px-1 py-0.5" />
                                <span className="relative text-teal-700">{testimonial.highlightedText}</span>
                              </span>
                            )}
                            {testimonial.afterHighlight}
                          </p>
                        </blockquote>

                        <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100">
                          <div className="relative h-10 w-10 flex-shrink-0">
                            <Image
                              className="h-full w-full rounded-full bg-gray-50 object-cover ring-2 ring-white shadow-sm"
                              src={testimonial.author.imageUrl}
                              alt=""
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="min-w-0 flex-auto">
                            <div className="font-semibold text-gray-900 text-sm">{testimonial.author.name}</div>
                            {testimonial.author.handle && (
                              <div className="text-xs text-gray-500">@{testimonial.author.handle}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
