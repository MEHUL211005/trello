import { Paperclip, Trash2, Image } from "lucide-react";
import { useState } from "react";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAttachments,
  deleteAttachment,
  setAttachmentAsCover,
} from "../../api/attachmentApi";

import DeleteAttachmentPopover from "./DeleteAttachmentPopover";


function ModalAttachments({ card, cardContext }) {

  const queryClient = useQueryClient();

  const [preview, setPreview] = useState(null);

  const [deleteFile, setDeleteFile] = useState(null);



  const {
    data: attachmentsData,
  } = useQuery({

    queryKey:[
      "attachments",
      cardContext.cardId
    ],

    queryFn:()=>
      getAttachments(cardContext.cardId),

  });



  const attachments = attachmentsData?.attachments || [];



  const deleteMutation = useMutation({

    mutationFn:deleteAttachment,

    onSuccess:()=>{

      queryClient.invalidateQueries({
        queryKey:[
          "attachments",
          cardContext.cardId
        ]
      });


      queryClient.invalidateQueries({
        queryKey:[
          "board",
          cardContext.boardId
        ]
      });

    }

  });



  const coverMutation = useMutation({

    mutationFn:setAttachmentAsCover,

    onSuccess:()=>{

      queryClient.invalidateQueries({
        queryKey:[
          "board",
          cardContext.boardId
        ]
      });

    }

  });



  if (!attachments.length) return null;



  return (
    <div className="mt-6">

      {/* Header */}
      <div className="mb-4 flex items-center gap-3">

        <Paperclip
          size={20}
          className="text-slate-700"
        />

        <h3 className="text-base font-semibold text-slate-800">
          Attachments
        </h3>

      </div>


      {/* Attachments */}
      <div className="space-y-3">

        {attachments.map((file) => {

          const fileUrl = `http://localhost:5000${file.fileUrl}`;

          const isImage = file.mimeType?.startsWith("image");

          return (

            <div
              key={file.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
            >

              {/* Preview */}
              {isImage ? (

                <img
                  src={fileUrl}
                  alt={file.originalName}
                  onClick={() =>
                    setPreview({
                      ...file,
                      url:fileUrl,
                    })
                  }
                  className="h-16 w-16 cursor-pointer rounded-lg object-cover shadow-sm"
                />

              ) : (

                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                  FILE
                </div>

              )}


              {/* File info */}
              <div className="flex-1">

                <p className="text-sm font-semibold text-slate-800">
                  {file.originalName}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>

                <button
                  onClick={() => coverMutation.mutate(file.id)}
                  className="mt-2 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200"
                >

                  <Image size={12}/>

                  Set cover

                </button>

              </div>


              {/* Delete */}
              <div className="relative">

                <button
                  onClick={() => setDeleteFile(file)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={17}/>
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

            </div>

          );

        })}

      </div>


      {/* Image Preview Modal */}
      {preview && (

        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-6"
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-xl bg-white p-5 shadow-2xl"
          >

            <img
              src={preview.url}
              alt={preview.originalName}
              className="h-[80vh] w-[80vw] rounded-lg object-contain"
            />

            <p className="mt-4 text-center text-sm font-semibold text-slate-700">
              {preview.originalName}
            </p>

          </div>

        </div>

      )}

    </div>
  );

}


export default ModalAttachments;