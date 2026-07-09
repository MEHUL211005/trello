import { useState } from "react";
import { useDispatch } from "react-redux";
import { addComment , deleteComment , editComment } from "../../redux/workspaceSlice";
import DeleteCommentPopover from "./DeleteCommentPopover";

function Comments({ card, cardContext }) {
  // console.log("CARD:", card);
  // console.log("CARD COMMENTS:", card?.comments);

  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");
const [deleteCommentId, setDeleteCommentId] = useState(null);
const [editingCommentId, setEditingCommentId] = useState(null);
const [editedComment, setEditedComment] = useState("");
  const dispatch = useDispatch();

  const handleSave = () => {
  if (!comment.trim()) return;

  // console.log("Saving comment...");

  dispatch(
    addComment({
      ...cardContext,
      comment,
    })
  );

  // console.log("Dispatched");

  setComment("");
  setIsEditing(false);
};
const handleDelete = (commentId) => {
  dispatch(
    deleteComment({
      ...cardContext,
      commentId,
    })
  );
};
const handleEditSave = (commentId) => {
  if (!editedComment.trim()) return;

  dispatch(
    editComment({
      ...cardContext,
      commentId,
      text: editedComment,
    })
  );

  setEditingCommentId(null);
  setEditedComment("");
};
  return (
    <div className="mt-6">
      <h3 className="mb-3 text-lg font-semibold">
        Comments
      </h3>

      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full rounded-md bg-slate-100 px-3 py-3 text-left text-sm text-slate-500 hover:bg-slate-200"
        >
          Write a comment...
        </button>
      ) : (
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[100px] w-full rounded-md border border-slate-300 p-3 text-sm outline-none"
          />

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
            >
              Save
            </button>

            <button
              onClick={() => {
                setComment("");
                setIsEditing(false);
              }}
              className="rounded-md bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Comments */}
      {card?.comments?.length > 0 && (
  <div className="mt-5 space-y-3">
    {card.comments.map((item) => (
      <div
        key={item.id}
        className="rounded-lg border border-slate-200 bg-white p-3"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold">
              {item.user}
            </p>

            {editingCommentId === item.id ? (
  <div className="mt-2">
    <textarea
      value={editedComment}
      onChange={(e) => setEditedComment(e.target.value)}
      className="min-h-[80px] w-full rounded-md border border-slate-300 p-2 text-sm outline-none"
    />

    <div className="mt-2 flex gap-2">
      <button
        onClick={() => handleEditSave(item.id)}
        className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
      >
        Save
      </button>

      <button
        onClick={() => {
          setEditingCommentId(null);
          setEditedComment("");
        }}
        className="rounded-md bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300"
      >
        Cancel
      </button>
    </div>
  </div>
) : (
  <p className="mt-1 text-sm text-slate-700">
    {item.text}
  </p>
)}

            <p className="mt-1 text-xs text-slate-400">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>

         <div className="relative gap-2">
  <button
    onClick={() =>
      setDeleteCommentId(
        deleteCommentId === item.id ? null : item.id
      )
    }
    className="text-xs font-medium text-red-500 hover:text-red-600"
  >
    Delete
  </button>
  <button
  onClick={() => {
    setEditingCommentId(item.id);
    setEditedComment(item.text);
  }}
  className="text-xs font-medium text-blue-600 hover:text-blue-700"
>
  Edit
</button>

  {deleteCommentId === item.id && (
    <DeleteCommentPopover
      onDelete={() => {
        handleDelete(item.id);
        setDeleteCommentId(null);
      }}
      onClose={() => setDeleteCommentId(null)}
    />
  )}
</div>
        </div>
      </div>
    ))}
  </div>
)}
    </div>
  );
}

export default Comments;



