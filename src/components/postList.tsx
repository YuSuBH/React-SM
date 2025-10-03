//gets posts array

import React from "react";
import { Post as IPost } from "../pages/main/main";
import { Post } from "./post";

interface PostListProps {
  postList: IPost[] | null;
  emptyMessage: string;
  canDelete: boolean;
  onPostDelete?: (postId: string) => void;
}

export const PostList: React.FC<PostListProps> = ({
  postList,
  emptyMessage,
  canDelete,
  onPostDelete,
}) => {
  if (postList?.length === 0) {
    return <p className="emptyMessage">{emptyMessage}</p>;
  }

  return (
    <>
      {postList?.map((post) => (
        <Post
          key={post.id}
          post={post}
          canDelete={canDelete}
          onPostDelete={onPostDelete}
        />
      ))}
    </>
  );
};
