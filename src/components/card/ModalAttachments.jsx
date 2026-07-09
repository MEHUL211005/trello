import { Paperclip , Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteAttachment } from "../../redux/workspaceSlice";
import { useState } from "react";
import DeleteAttachmentPopover from "./DeleteAttachmentPopover";

function ModalAttachments({ card , cardContext }) {
    const dispatch = useDispatch();
    const [preview, setPreview] = useState(null);
   const [deleteFile, setDeleteFile] = useState(null);
  if (!card.attachments?.length) return null;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <Paperclip size={18} />

        <h3 className="text-lg font-semibold">
          Attachments
        </h3>
      </div>

      <div className="space-y-3">
        {card.attachments.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
          >
            {file.type.startsWith("image") ? (
              <img
                src={file.url}
                alt={file.name}
                onClick={() => setPreview(file)}
                className="h-14 w-14 cursor-pointer rounded object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded bg-slate-200 text-xs">
                FILE
              </div>
            )}

                      <div className="flex-1">
            <p className="text-sm font-medium">
              {file.name}
            </p>

            <p className="text-xs text-slate-500">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>

          <div className="relative">
  <button
    onClick={() => setDeleteFile(file)}
    className="text-slate-500 hover:text-red-500"
  >
    <Trash2 size={16} />
  </button>

  {deleteFile?.id === file.id && (
    <DeleteAttachmentPopover
      onClose={() => setDeleteFile(null)}
      onDelete={() => {
        dispatch(
          deleteAttachment({
            ...cardContext,
            attachmentId: file.id,
          })
        );

        setDeleteFile(null);
      }}
    />
  )}
</div>
          </div>
        ))}
      </div>
      {preview && (
  <div
    onClick={() => setPreview(null)}
    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-6"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="max-h-[90vh] max-w-[90vw] rounded-lg bg-white p-4"
    >
      {preview.type.startsWith("image") ? (
        <img
          src={preview.url}
          alt={preview.name}
          className="h-[90vh] w-[90vw] rounded object-contain"
        />
      ) : (
        <div className="p-10 text-center">
          File Preview Not Available
        </div>
      )}

      <p className="mt-3 text-center text-sm font-medium">
        {preview.name}
      </p>
    </div>
  </div>
)}
    </div>
);
}

export default ModalAttachments;