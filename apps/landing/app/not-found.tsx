import { ErrorPage } from "@/components/ErrorPage";
import { BasicLayout } from "./(marketing)/_components/BasicLayout";

export default function NotFound() {
  return (
    <BasicLayout>
      <ErrorPage
        title="You seem lost 🧐"
        description="Let's take you back home."
      />
    </BasicLayout>
  );
}