import { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

import {
  getComments,
  addComment,
  deleteComment,
  updateComment,
} from "../../api/commentApi";
import { useBoardPermissions } from "../../context/boardPermissions";
import { getErrorMessage } from "../../lib/validation";
import { formatFullDate, timeAgo } from "../../lib/time";
import DeleteCommentPopover from "./DeleteCommentPopover";
import { Avatar, SectionTitle, primaryBtn, ghostBtn } from "./ui";

const MAX_COMMENT = 1000;

function Comments({ cardContext }) {
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const { canEdit } = useBoardPermissions();

  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState("");

  const [deleteCommentId, setDeleteCommentId] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");

  const { data: commentsData } = useQuery({
    queryKey: ["comments", cardContext.cardId],
    queryFn: () => getComments(cardContext.cardId),
  });

  const comments = commentsData?.comments || [];

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["comments", cardContext.cardId] });
    queryClient.invalidateQueries({ queryKey: ["activities", cardContext.cardId] });
    queryClient.invalidateQueries({ queryKey: ["board", cardContext.boardId] });
  };

  const onError = (message) => (error) => {
    toast.error(getErrorMessage(error, message));
  };

  const addMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      refresh();
      toast.success("Comment posted");
    },
    onError: onError("Could not post the comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      refresh();
      toast.success("Comment deleted");
    },
    onError: onError("Could not delete the comment"),
  });

  const updateMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      refresh();
      toast.success("Comment updated");
    },
    onError: onError("Could not update the comment"),
  });

  const handleSave = () => {
    if (!comment.trim()) {
      toast.error("Write something before posting");
      return;
    }

    addMutation.mutate({ cardId: cardContext.cardId, text: comment.trim() });

    setComment("");
    setIsEditing(false);
  };

  const handleEditSave = (commentId) => {
    if (!editedComment.trim()) {
      toast.error("A comment can't be empty");
      return;
    }

    updateMutation.mutate({ commentId, text: editedComment.trim() });

    setEditingCommentId(null);
    setEditedComment("");
  };

  const submitOnCtrlEnter = (action) => (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") action();
  };

  return (
    <section>
      <SectionTitle
        icon={MessageSquare}
        title="Comments"
        count={comments.length}
      />

      {/* Composer */}
      {canEdit ? (
      <div className="flex gap-3">
        <Avatar id={user?.id} name={user?.name} size={34} />

        <div className="min-w-0 flex-1">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-400 shadow-sm transition hover:border-brand-300 hover:text-slate-600"
            >
              Write a comment...
            </button>
          ) : (
            <div>
              <textarea
                value={comment}
                maxLength={MAX_COMMENT}
                autoFocus
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={submitOnCtrlEnter(handleSave)}
                placeholder="Share an update, ask a question..."
                className="min-h-[96px] w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />

              <div className="mt-2 flex items-center gap-2">
                <button onClick={handleSave} className={primaryBtn}>
                  Post
                </button>
                <button
                  onClick={() => {
                    setComment("");
                    setIsEditing(false);
                  }}
                  className={ghostBtn}
                >
                  Cancel
                </button>
                <span className="ml-auto text-xs text-slate-400">
                  {comment.length}/{MAX_COMMENT}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      ) : (
        <p className="rounded-xl bg-white/70 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">
          You have view-only access, so you can read comments but not add them.
        </p>
      )}

      {/* Thread */}
      {comments.length > 0 ? (
        <div className="mt-5 space-y-4">
          {comments.map((item) => {
            const isMine =
              canEdit && (item.userId === user?.id || item.User?.id === user?.id);

            return (
              <div key={item.id} className="flex gap-3">
                <Avatar
                  id={item.userId ?? item.User?.id}
                  name={item.User?.name || "User"}
                  size={34}
                />

                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {item.User?.name || "User"}
                      </p>
                      <span
                        className="shrink-0 text-xs text-slate-400"
                        title={formatFullDate(item.createdAt)}
                      >
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>

                    {editingCommentId === item.id ? (
                      <div className="mt-2">
                        <textarea
                          value={editedComment}
                          maxLength={MAX_COMMENT}
                          autoFocus
                          onChange={(e) => setEditedComment(e.target.value)}
                          onKeyDown={submitOnCtrlEnter(() =>
                            handleEditSave(item.id),
                          )}
                          className="min-h-[80px] w-full resize-y rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />

                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => handleEditSave(item.id)}
                            className={primaryBtn}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditedComment("");
                            }}
                            className={ghostBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                        {item.text}
                      </p>
                    )}
                  </div>

                  {isMine && editingCommentId !== item.id && (
                    <div className="relative mt-1 flex gap-3 pl-2 text-xs font-semibold">
                      <button
                        onClick={() => {
                          setEditingCommentId(item.id);
                          setEditedComment(item.text);
                        }}
                        className="text-slate-400 transition hover:text-brand-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          setDeleteCommentId(
                            deleteCommentId === item.id ? null : item.id,
                          )
                        }
                        className="text-slate-400 transition hover:text-rose-600"
                      >
                        Delete
                      </button>

                      {deleteCommentId === item.id && (
                        <DeleteCommentPopover
                          onDelete={() => {
                            deleteMutation.mutate(item.id);
                            setDeleteCommentId(null);
                          }}
                          onClose={() => setDeleteCommentId(null)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white/60 py-6 text-center text-sm text-slate-400">
          No comments yet. Start the conversation.
        </p>
      )}
    </section>
  );
}

export default Comments;
