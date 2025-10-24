import { format, parseISO } from "date-fns";
import { BasicLayout } from "@/app/(marketing)/_components/BasicLayout";
import { Button } from "@/components/ui/button";
import { Prose } from "./Prose";

export function BlogPost(props: {
  date: string;
  title: string;
  author: string;
  content: React.ReactNode;
}) {
  const { date, title, author, content } = props;
  return (
    <BasicLayout>
      <div className="mx-auto max-w-7xl px-6 py-20 flex">
        <div className="flex-1">
          <article>
            {/*
              <div className="text-center">
                <time dateTime={date} className="mb-1 text-xs text-gray-600">
                  {format(parseISO(date), "LLLL d, yyyy")}
                </time>
                <p className="text-sm font-semibold">by {author}</p>
              </div>
            */}

            <div className="mt-12">
              <Prose>{content}</Prose>
            </div>
          </article>
        </div>

      </div>
    </BasicLayout>
  );
}