import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBoardMembers,
  toggleMember,
} from "../../api/membersApi";


function MembersPopover({ cardContext, onClose }) {

  const queryClient = useQueryClient();


  const {
    data: membersData
  } = useQuery({

    queryKey:[
      "boardMembers",
      cardContext.boardId
    ],

    queryFn:()=>getBoardMembers(cardContext.boardId),

  });


  const availableMembers = membersData?.members || [];



  const toggleMutation = useMutation({

    mutationFn: toggleMember,


   onSuccess:()=>{

  queryClient.invalidateQueries({
    queryKey:[
      "board",
      cardContext.boardId
    ]
  });

}


  });



return (
<div className="
absolute
right-0
top-full
z-50
mt-2
w-72
rounded-lg
border
border-slate-200
bg-white
p-4
shadow-xl
">

<h3 className="
mb-3
text-center
text-sm
font-semibold
">
Members
</h3>


<div className="
max-h-64
space-y-2
overflow-y-auto
">


{
availableMembers.map((member)=>(


<div

key={member.id}

onClick={()=>{

toggleMutation.mutate({

cardId:cardContext.cardId,

userId:member.id

});

}}


className="
flex
cursor-pointer
items-center
gap-3
rounded-md
p-2
hover:bg-slate-100
"


>


<div
className="
flex
h-8
w-8
items-center
justify-center
rounded-full
bg-blue-500
text-sm
font-semibold
text-white
"
>

{
member.name
?.charAt(0)
.toUpperCase()
}

</div>


<span className="text-sm">
{member.name}
</span>


</div>


))

}


</div>


</div>
);

}


export default MembersPopover;