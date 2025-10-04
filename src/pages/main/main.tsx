import { getDocs, collection } from "firebase/firestore";
import { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";

import { PostList } from "../../components/postList";
import { useAuthState } from "react-firebase-hooks/auth";

export interface Post {
  id: string;
  userId: string;
  title: string;
  username: string;
  description: string;
  createdAt?: any;
}

export const Main = () => {
  const [user] = useAuthState(auth);

  const [postList, setPostList] = useState<Post[] | null>(null);
  const postRef = collection(db, "posts");

  const [error, setError] = useState<string | null>(null);

  const getPosts = async () => {
    try {
      if (!user) return;
      const data = await getDocs(postRef);
      setPostList(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt,
        })) as Post[]
      );
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
  };

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="postContainer">
      {!user ? (
        <p className="loginPrompt">Login to view the posts</p>
      ) : error ? (
        <p className="errorMessage">{error}</p>
      ) : (
        <div className="postsFeed">
          <PostList
            postList={postList}
            emptyMessage="No posts available"
            canDelete={false}
          />
          {/* Example usage of CommentList, you can adjust as needed */}
          {/* <CommentList commentList={commentList} emptyMessage="No comments available" /> */}
        </div>
      )}
    </div>
  );
};
