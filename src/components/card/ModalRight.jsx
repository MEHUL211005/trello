import Comments from "./Comments";
import Activity  from "./Activity";
function ModalRight({card , cardContext}) {
    // console.log("MODAL RIGHT CARD:", card);
  return (
    <div className="w-[380px] border-l overflow-y-auto border-slate-300 bg-slate-50 p-5">
     <Comments card={card} cardContext={cardContext} />
     <Activity cardContext={cardContext} />
    </div>
  );
}

export default ModalRight;