import { NextResponse } from "next/server";

const UDEMY_API_URL = "https://www.udemy.com/instructor-api/v1";
const UDEMY_SECRET_TOKEN = process.env.UDEMY_SECRET;

async function fetchTaughtCourses() {
  const response = await fetch(`${UDEMY_API_URL}/taught-courses/reviews/`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${UDEMY_SECRET_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch taught courses: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
}

export async function GET(req: Request) {
  try {
    const taughtCourses = await fetchTaughtCourses();

    if (taughtCourses.length === 0) {
      return NextResponse.json({ message: "No taught courses found." });
    }

    const courseData = taughtCourses.map((course: any) => ({
      id: course.id,
      title: course.title,
      url: course.url,
      isPaid: course.is_paid,
      price: course.price,
      numEnrollments: course.num_enrollments,
      numReviews: course.num_reviews,
      numCompletions: course.num_completions,
      numPublishedLectures: course.num_published_lectures,
      instructionalLevel: course.instructional_level,
      contentInfo: course.content_info,
      publishedTime: course.published_time,
    }));

    return NextResponse.json({ courses: courseData });
  } catch (error) {
    console.error("Error retrieving course data:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}