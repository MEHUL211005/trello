import { useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getWorkspaces } from "../api/workspaceApi";
import { createBoard } from "../api/boardApi";
import { useNavigate } from "react-router-dom";


const CreateBoardPopover = ({ onClose }) => {

  const navigate = useNavigate();


  const [name, setName] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [error, setError] = useState("");



  const {
    data: workspaceData,
    isLoading
  } = useQuery({

    queryKey:["workspaces"],

    queryFn:getWorkspaces

  });



  const mutation = useMutation({

    mutationFn:createBoard,


    onSuccess:(response)=>{

      const board = response.board;


      onClose();


      navigate(
        `/workspace/${board.workspaceId}/board/${board.id}`
      );

    },


    onError:(error)=>{

      setError(
        error.response?.data?.message ||
        "Failed to create board"
      );

    }

  });






  const handleSubmit = (e)=>{

    e.preventDefault();


    setError("");



    if(!name.trim()){

      setError("Board title is required");
      return;

    }


    if(!workspaceId){

      setError("Please select workspace");
      return;

    }



    mutation.mutate({

      name:name.trim(),

      workspaceId

    });

  };





  return (

    <div className="absolute top-full mt-2 right-0 w-80 rounded-xl bg-white border border-slate-200 shadow-xl z-[9999] text-slate-800">



      {/* HEADER */}

      <div
        className="
        flex
        justify-between
        items-center
        px-4
        py-3
        border-b
        "
      >

        <h2 className="font-semibold text-slate-800">
          Create Board
        </h2>


        <button
          onClick={onClose}
          className="
          text-slate-500
          hover:text-slate-800
          cursor-pointer
          "
        >

          <X size={18}/>

        </button>


      </div>







      <form
        onSubmit={handleSubmit}
        className="p-4 space-y-4"
      >




        {/* BOARD NAME */}

        <div>

          <label className="text-sm text-slate-600">
            Board title
          </label>


          <input

            value={name}

            onChange={(e)=>setName(e.target.value)}

            placeholder="Enter board name"

          className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 text-slate-800 placeholder:text-slate-400"

          />

        </div>








        {/* WORKSPACE */}

        <div>


          <label className="text-sm text-slate-600">
            Workspace
          </label>



          <select

            value={workspaceId}

            onChange={(e)=>setWorkspaceId(e.target.value)}

            className="
            w-full
            border
            rounded-lg
            px-3
            py-2
            mt-1
            outline-none
            focus:border-sky-500
            "

          >


            <option value="">
              Select workspace
            </option>



            {
              isLoading ? (

                <option>
                  Loading...
                </option>

              ) : (


                workspaceData?.workspaces?.map(
                  (workspace)=>(

                    <option
                      key={workspace.id}
                      value={workspace.id}
                    >

                      {workspace.name}

                    </option>

                  )

                )


              )

            }


          </select>


        </div>






        {
          error && (

            <p
              className="
              text-sm
              text-red-500
              "
            >
              {error}
            </p>

          )
        }






        <button

          disabled={mutation.isPending}

          className="
          w-full
          bg-sky-600
          hover:bg-sky-700
          text-white
          rounded-lg
          py-2
          cursor-pointer
          disabled:opacity-50
          "

        >

          {
            mutation.isPending
            ? "Creating..."
            : "Create"
          }


        </button>



      </form>



    </div>

  );

};


export default CreateBoardPopover;