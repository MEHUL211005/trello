import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBoards } from "../api/boardApi";
import { useSelector } from "react-redux";

import { useTheme } from "../context/theme";
import { backgroundStyle } from "../lib/boardBackgrounds";

const SwitchBoardsModal = ({ onClose, currentWorkspaceId }) => {

  const navigate = useNavigate();
  const { isDark } = useTheme();

  const {user} = useSelector((state)=>state.auth);

// CURRENT WORKSPACE BOARDS

const {
  data: boardsData,
} = useQuery({
  queryKey: ["boards", currentWorkspaceId],
  queryFn: () => getBoards(currentWorkspaceId),
  enabled: !!user && !!currentWorkspaceId,
});


const currentBoards = boardsData?.boards || [];


  const openBoard = (workspaceId, boardId)=>{

    navigate(
      `/workspace/${workspaceId}/board/${boardId}`
    );

    onClose();

  };


return (

<div
  onClick={onClose}
  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30"
>


<div
  onClick={(e)=>e.stopPropagation()}
  className="
  w-[600px]
  max-w-[calc(100vw-1.5rem)]
  max-h-[80vh]
  overflow-y-auto
  rounded-xl
  bg-white
  shadow-2xl
  p-6
  "
>


<h2 className="text-xl font-semibold text-slate-800 mb-5">
Switch Boards
</h2>



{/* CURRENT WORKSPACE */}

<div>

<h3 className="text-sm font-semibold text-slate-500 mb-3">
Current Workspace
</h3>


<div className="grid grid-cols-2 gap-4">


{
currentBoards.map((board)=>(

<div
key={board.id}
onClick={()=>openBoard(currentWorkspaceId,board.id)}
className="
cursor-pointer
rounded-lg
border
hover:shadow-md
overflow-hidden
"
>


<div
className="h-20 w-full"
style={backgroundStyle(board.background, board.id, isDark)}
/>


<div className="p-3">

<p className="font-semibold text-slate-800">
{board.name}
</p>


<p className="text-xs text-slate-500">
{board.lists?.length || 0} Lists
</p>


</div>


</div>

))
}


</div>

</div>


<button
onClick={onClose}
className="
mt-5
w-full
rounded-lg
bg-slate-200
py-2
hover:bg-slate-300
"
>
Close
</button>


</div>


</div>

)

};


export default SwitchBoardsModal;