import { getDocs, collection, query, where } from "firebase/firestore";
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
}

export const MyPosts = () => {
  const [user] = useAuthState(auth);

  const [postList, setPostList] = useState<Post[] | null>(null);
  const postRef = collection(db, "posts");

  const [error, setError] = useState<string | null>(null);

  const getPosts = async () => {
    try {
      if (!user) return;

      const userPostsQuery = query(postRef, where("userId", "==", user.uid));
      const data = await getDocs(userPostsQuery);

      setPostList(
        data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Post[]
      );
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
  };

  const removePostFromList = (postId: string) => {
    setPostList((prevPosts) =>
      prevPosts ? prevPosts.filter((post) => post.id !== postId) : null
    );
  };

  useEffect(() => {
    getPosts();
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
            emptyMessage="You have not posted yet!!!"
            canDelete={true}
            onPostDelete={removePostFromList}
          />
        </div>
      )}
    </div>
  );
};
