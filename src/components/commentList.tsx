import { Timestamp } from "firebase/firestore";

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Timestamp | { seconds: number } | null;
}

interface CommentListProps {
  commentList: Comment[] | null;
  emptyMessage?: string;
}

export const CommentList = ({
  commentList,
  emptyMessage = "No comments yet.",
}: CommentListProps) => {
  const formatDate = (createdAt: any) => {
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

  if (!commentList) return <div>Loading comments...</div>;

  return (
    <div className="commentList">
      {commentList.length === 0 ? (
        <div>{emptyMessage}</div>
      ) : (
        commentList.map((comment) => (
          <div key={comment.id} className="commentItem">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div className="commentAuthor">@{comment.username}</div>
              <div className="commentDate">{formatDate(comment.createdAt)}</div>
            </div>
            <div className="commentText">{comment.text}</div>
          </div>
        ))
      )}
    </div>
  );
};
