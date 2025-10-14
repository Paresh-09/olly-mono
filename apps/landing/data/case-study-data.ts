// Generated on 2024-12-12T13:07:00.460Z
interface Author {
  name: string;
  role: string;
  href: string;
  imageUrl: string;
}

interface Post {
  title: string;
  file: string;
  description: string;
  date: string;
  datetime: string;
  author: Author;
  language: string;
  url: string;
  categories: string[];
}

const caseStudyData: Post[] = [
  {
    "title": "From Zero to 300K+ Impressions: How JaanIbrahim Combined Olly & UXer for Explosive Growth",
    "file": "jaanibrahim-olly-uxer-300k-impressions-case-study",
    "description": "Discover how Usman Yusuf (JaanIbrahim) achieved 700% business awareness growth and over 300,000 impressions in just two months by strategically combining Olly's AI-powered engagement capabilities with UXer automation tools.",
    "date": "December 13, 2024",
    "datetime": "2024-12-13",
    "author": {
      "name": "Yash Thakker",
      "role": "Founder",
      "href": "#",
      "imageUrl": "/images/blog/yt.jpg"
    },
    "language": "en",
    "url": "https://www.olly.social/case-study/post/jaanibrahim-olly-uxer-300k-impressions-case-study",
    "categories": [
      "case-study",
      "success-story",
      "social-media",
      "automation",
      "growth"
    ]
  }
];

export default caseStudyData;
