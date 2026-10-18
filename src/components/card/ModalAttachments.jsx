import { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, ImageIcon, Paperclip, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

import { useBoardPermissions } from "../../context/boardPermissions";
import { fileUrl } from "../../lib/fileUrl";
import { getErrorMessage } from "../../lib/validation";
import { timeAgo } from "../../lib/time";
import {
  getAttachments,
  deleteAttachment,
  setAttachmentAsCover,
} from "../../api/attachmentApi";
import DeleteAttachmentPopover from "./DeleteAttachmentPopover";
import { SectionTitle } from "./ui";

const formatSize = (bytes = 0) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const extensionOf = (name = "") =>
  (name.split(".").pop() || "file").slice(0, 4).toUpperCase();

function ModalAttachments({ card, cardContext }) {
  const queryClient = useQueryClient();
  const { canEdit } = useBoardPermissions();

  const [preview, setPreview] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);

  const { data: attachmentsData } = useQuery({
    queryKey: ["attachments", cardContext.cardId],
    queryFn: () => getAttachments(cardContext.cardId),
  });

  const attachments = attachmentsData?.attachments || [];

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["attachments", cardContext.cardId],
    });
    queryClient.invalidateQueries({
      queryKey: ["board", cardContext.boardId],
    });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      refresh();
      toast.success("Attachment deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not delete the attachment"));
    },
  });

  const coverMutation = useMutation({
    mutationFn: setAttachmentAsCover,
    onSuccess: () => {
      refresh();
      toast.success("Cover updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not set the cover"));
    },
  });

  if (!attachments.length) return null;

  return (
    <section>
      <SectionTitle
        icon={Paperclip}
        title="Attachments"
        count={attachments.length}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {attachments.map((file) => {
          const href = fileUrl(file.fileUrl);
          const isImage = file.mimeType?.startsWith("image");
          const isCover = card.coverImage === file.fileUrl;

          return (
            <div
              key={file.id}
              className="group relative flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              {/* Thumbnail */}
              {isImage ? (
                <img
                  src={href}
                  alt={file.originalName}
                  onClick={() => setPreview({ ...file, url: href })}
                  className="h-16 w-20 shrink-0 cursor-zoom-in rounded-xl object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-16 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-brand-50 text-brand-600">
                  <FileText size={20} />
                  <span className="text-[10px] font-extrabold tracking-wider">
                    {extensionOf(file.originalName)}
                  </span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-semibold text-slate-800"
                  title={file.originalName}
                >
                  {file.originalName}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {formatSize(file.size)} · added {timeAgo(file.createdAt)}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {isCover && (
                    <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700">
                      Cover
                    </span>
                  )}

                  {canEdit && isImage && !isCover && (
                    <button
                      onClick={() => coverMutation.mutate(file.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                    >
                      <ImageIcon size={11} />
                      Make cover
                    </button>
                  )}

                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    download={file.originalName}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Download size={11} />
                    Open
                  </a>
                </div>
              </div>

              {/* Delete */}
              {canEdit && (
              <div className="relative">
                <button
                  onClick={() =>
                    setDeleteFile(deleteFile?.id === file.id ? null : file)
                  }
                  aria-label="Delete attachment"
                  className="rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>

                {deleteFile?.id === file.id && (
                  <DeleteAttachmentPopover
                    onClose={() => setDeleteFile(null)}
                    onDelete={() => {
                      deleteMutation.mutate(file.id);
                      setDeleteFile(null);
                    }}
                  />
                )}
              </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Image preview */}
      {preview &&
        createPortal(
          <div
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
            }}
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm"
          >
            <button
              onClick={() => setPreview(null)}
              aria-label="Close preview"
              className="absolute right-5 top-5 rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X size={22} />
            </button>

            <figure onClick={(e) => e.stopPropagation()} className="max-w-[92vw]">
              <img
                src={preview.url}
                alt={preview.originalName}
                className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <figcaption className="mt-3 text-center text-sm font-semibold text-white/90">
                {preview.originalName}
              </figcaption>
            </figure>
          </div>,
          document.body,
        )}
    </section>
  );
}

export default ModalAttachments;
