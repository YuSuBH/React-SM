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
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "random">(
    "newest"
  );

  const getTimestamp = (createdAt: any): number => {
    if (!createdAt) return 0;
    if (createdAt instanceof Date) return createdAt.getTime();
    if (createdAt.seconds) return createdAt.seconds * 1000;
    if (typeof createdAt === "string") return new Date(createdAt).getTime();
    return 0;
  };

  const sortPosts = (posts: Post[]): Post[] => {
    const sorted = [...posts];
    switch (sortOption) {
      case "newest":
        return sorted.sort(
          (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
        );
      case "oldest":
        return sorted.sort(
          (a, b) => getTimestamp(a.createdAt) - getTimestamp(b.createdAt)
        );
      case "random":
        return sorted.sort(() => Math.random() - 0.5);
      default:
        return sorted;
    }
  };

  const getPosts = async () => {
    try {
      if (!user) return;
      const data = await getDocs(postRef);
      const posts = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt,
      })) as Post[];
      setPostList(posts);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
  };

  useEffect(() => {
    getPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const sortedPosts = postList ? sortPosts(postList) : null;

  return (
    <div className="postContainer">
      {!user ? (
        <p className="loginPrompt">Login to view the posts</p>
      ) : error ? (
        <p className="errorMessage">{error}</p>
      ) : (
        <div className="postsFeed">
          <div className="sortOptions">
            <label htmlFor="sortSelect">Sort by: </label>
            <select
              id="sortSelect"
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value as "newest" | "oldest" | "random")
              }
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="random">Discover</option>
            </select>
          </div>
          <PostList
            postList={sortedPosts}
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
