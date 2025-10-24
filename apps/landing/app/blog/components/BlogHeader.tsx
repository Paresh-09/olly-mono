import { formatDate } from "@/lib/formatDate";

interface Author {
  name: string | null;
  picture: string | null;
}

interface BlogHeaderProps {
  title: string;
  date: Date | string;
  author: Author | null;
  categories?: string[];
}

export function BlogHeader({ title, date, author, categories = [] }: BlogHeaderProps) {
  const formattedDate = typeof date === 'string' ? date : formatDate(date);
  
  return (
    <header className="flex flex-col">
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-5xl">
        {title}
      </h1>
      <div className="order-first flex items-center text-base text-slate-500 dark:text-slate-400">
        <time dateTime={formattedDate}>{formattedDate}</time>
        <span className="mx-2">•</span>
        {author?.name && (
          <div className="flex items-center">
            {author.picture && (
              <img
                src={author.picture}
                alt={author.name}
                className="mr-2 h-8 w-8 rounded-full"
              />
            )}
            <span>{author.name}</span>
          </div>
        )}
      </div>
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-100"
            >
              {category}
            </span>
          ))}
        </div>
      )}
    </header>
  );
} 