import { getDocs, collection } from "firebase/firestore";
import { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import { Post } from "./post";
import { useAuthState } from "react-firebase-hooks/auth";

export interface Post {
  id: string;
  userId: string;
  title: string;
  username: string;
  description: string;
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
        data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Post[]
      );
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
  };

  useEffect(() => {
    getPosts();
  }, [user]);

  return (
    <div>
      {!user ? (
        <p>Login to view the posts</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        postList?.map((post) => <Post post={post} />)
      )}
    </div>
  );
};
