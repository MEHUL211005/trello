import { useRef } from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  uploadAttachment,
} from "../../api/attachmentApi";


function AttachmentPopover({
  onClose,
  cardContext,
}) {

  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();


  const uploadMutation = useMutation({

    mutationFn: uploadAttachment,


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


      onClose();

    }

  });



  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;


    uploadMutation.mutate({

      cardId: cardContext.cardId,

      file,

    });

  };



  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">

      <h3 className="mb-4 text-center text-sm font-semibold">
        Add Attachment
      </h3>


      <button
        onClick={() => fileInputRef.current.click()}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
      >

        {uploadMutation.isPending
          ? "Uploading..."
          : "Choose File"
        }

      </button>


      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />


      <button
        onClick={onClose}
        className="mt-3 w-full rounded-md bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300"
      >
        Cancel
      </button>

    </div>
  );

}


export default AttachmentPopover;