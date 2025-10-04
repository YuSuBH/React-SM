import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

interface CommentFormData {
  text: string;
}

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

export const CommentForm = ({ postId, onCommentAdded }: CommentFormProps) => {
  const [user] = useAuthState(auth);

  const schema = yup.object().shape({
    text: yup
      .string()
      .required("Comment cannot be empty.")
      .max(500, "Comment is too long."),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: CommentFormData) => {
    if (!user) return;
    await addDoc(collection(db, "comments"), {
      postId,
      userId: user.uid,
      username: user.displayName || user.email || "Anonymous",
      text: data.text.trim(),
      createdAt: serverTimestamp(),
    });
    reset();
    if (onCommentAdded) onCommentAdded();
  };

  return (
    <form className="commentForm" onSubmit={handleSubmit(onSubmit)}>
      <textarea
        placeholder="Write a comment..."
        rows={3}
        {...register("text")}
        disabled={isSubmitting || !user}
      />
      <p className="inputErrors">{errors.text?.message}</p>
      <button type="submit" disabled={isSubmitting || !user}>
        {isSubmitting ? "Posting..." : "Post"}
      </button>
      {!user && (
        <div className="commentFormError">
          You must be logged in to comment.
        </div>
      )}
    </form>
  );
};
