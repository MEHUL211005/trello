import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import toast from "react-hot-toast";

import { uploadAttachment } from "../../api/attachmentApi";
import { getErrorMessage } from "../../lib/validation";

const MAX_SIZE_MB = 10;

function AttachmentPopover({ onClose, cardContext }) {
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: uploadAttachment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", cardContext.cardId],
      });

      queryClient.invalidateQueries({
        queryKey: ["board", cardContext.boardId],
      });

      toast.success("File attached");
      onClose();
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not upload the file"));
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = "";

    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`That file is too large. The limit is ${MAX_SIZE_MB} MB.`);
      return;
    }

    uploadMutation.mutate({
      cardId: cardContext.cardId,
      file,
    });
  };

  return (
    <div>
      <button
        onClick={() => fileInputRef.current.click()}
        disabled={uploadMutation.isPending}
        className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-7 text-slate-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-60"
      >
        <UploadCloud size={28} />
        <span className="text-sm font-semibold">
          {uploadMutation.isPending ? "Uploading..." : "Choose a file"}
        </span>
        <span className="text-xs text-slate-400">
          Images, PDFs, documents and more, up to {MAX_SIZE_MB} MB
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default AttachmentPopover;
