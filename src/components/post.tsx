import {
  addDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  doc,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { Timestamp } from "firebase/firestore";
import { Post as IPost } from "../pages/main/main";
import { CommentList } from "./commentList";
import { CommentForm } from "../pages/create-comment/comment-form";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";

interface Props {
  post: IPost;
  canDelete: boolean;
  onPostDelete?: (postId: string) => void;
}

interface Like {
  likeId: string;
  userId: string;
}

export const Post = (props: Props) => {
  const { post } = props;
  const [user] = useAuthState(auth);
  const [likes, setLikes] = useState<Like[] | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[] | null>(null);

  const likesRef = collection(db, "likes");
  const likesDoc = query(likesRef, where("postId", "==", post.id));

  const getLikes = async () => {
    const data = await getDocs(likesDoc);
    setLikes(
      data.docs.map((doc) => ({ userId: doc.data().userId, likeId: doc.id }))
    );
  };

  const getComments = async () => {
    try {
      const commentsRef = collection(db, "comments");
      const commentsQuery = query(commentsRef, where("postId", "==", post.id));
      const data = await getDocs(commentsQuery);
      setComments(
        data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))
      );
    } catch (err) {
      console.log("Error fetching comments:", err);
    }
  };

  const addLike = async () => {
    try {
      const newDoc = await addDoc(likesRef, {
        userId: user?.uid,
        postId: post.id,
      });
      if (user) {
        setLikes((prev) =>
          prev
            ? [...prev, { userId: user.uid, likeId: newDoc.id }]
            : [{ userId: user.uid, likeId: newDoc.id }]
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const removeLike = async () => {
    try {
      const likeToDeleteQuery = query(
        likesRef,
        where("postId", "==", post.id),
        where("userId", "==", user?.uid)
      );

      const likeToDeleteData = await getDocs(likeToDeleteQuery);
      const likeId = likeToDeleteData.docs[0].id;
      const likeToDelete = doc(db, "likes", likeId);

      await deleteDoc(likeToDelete);
      if (user) {
        setLikes(
          (prev) => prev && prev.filter((like) => like.likeId !== likeId)
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteLikesOfPost = async (postId: string) => {
    try {
      const likesToDeleteQuery = query(likesRef, where("postId", "==", postId));

      const likesToDeleteData = await getDocs(likesToDeleteQuery);

      const deletePromises = likesToDeleteData.docs.map((likeDoc) =>
        deleteDoc(doc(db, "likes", likeDoc.id))
      );

      await Promise.all(deletePromises);
      console.log(
        `Deleted ${likesToDeleteData.docs.length} likes for post ${postId}`
      );
    } catch (err) {
      console.log("Error deleting likes:", err);
    }
  };

  const deletePost = async () => {
    try {
      await deleteLikesOfPost(post.id);

      await deleteDoc(doc(db, "posts", post.id));

      if (props.onPostDelete) {
        props.onPostDelete(post.id);
      }

      console.log("Post and associated likes deleted successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const hasUserLiked = likes?.find((like) => like.userId === user?.uid);

  useEffect(() => {
    getLikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showComments) {
      getComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, post.id]);

  // Helper to format date/time
  const formatPostDate = (createdAt: any) => {
    if (!createdAt) return "";
    let dateObj;
    if (createdAt instanceof Timestamp) {
      dateObj = createdAt.toDate();
    } else if (createdAt.seconds) {
      dateObj = new Date(createdAt.seconds * 1000);
    } else {
      dateObj = new Date(createdAt);
    }
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 24) {
      // Show time (e.g., 14:30)
      return dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Show date (e.g., 2025-10-04)
      return dateObj.toLocaleDateString();
    }
  };

  return (
    <div className="posts">
      <div className="postCard">
        <div className="postHeader">
          <h1 className="postTitle">{post.title}</h1>
        </div>
        <div className="postBody">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <p className="postAuthor" style={{ marginBottom: 0 }}>
              @{post.username}
            </p>
            <span
              style={{
                color: "var(--secondary-text-color)",
                fontSize: "0.95rem",
              }}
            >
              {formatPostDate(post.createdAt)}
            </span>
          </div>
          <p className="postDescription">{post.description}</p>
        </div>

        <div className="postFooter">
          <div
            className="postComment"
            onClick={() => setShowComments(!showComments)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="commentsLabel">Comments</span>
          </div>
          <div className="postActions">
            <button
              className={`likeButton ${hasUserLiked ? "liked" : "unliked"}`}
              onClick={hasUserLiked ? removeLike : addLike}
              title={hasUserLiked ? "Unlike" : "Like"}
            >
              {hasUserLiked ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </button>
            {likes && <span className="likeCount">{likes?.length}</span>}

            {props.canDelete && (
              <button
                className="deleteButton"
                onClick={deletePost}
                title="Delete"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="commentsSection">
            <button
              className="commentsCloseBtn"
              onClick={() => setShowComments(false)}
              aria-label="Close comments"
            >
              ×
            </button>
            <h4 className="commentsTitle">Comments</h4>
            <CommentForm postId={post.id} onCommentAdded={getComments} />
            <CommentList
              commentList={comments}
              emptyMessage="No comments yet."
            />
          </div>
        )}
      </div>
    </div>
  );
};
