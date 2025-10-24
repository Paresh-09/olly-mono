import React from "react";
import PostComments from "../../_components/post-comments";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

const PostCommentsPage = async () => {
  const session = await validateRequest();

  if (session.user?.isBetaTester === false) {
    return redirect("/dashboard");
  }

  return (
    <div>
      <PostComments postUrn="urn:li:activity:7284973655908876289" />
    </div>
  );
};

export default PostCommentsPage;
