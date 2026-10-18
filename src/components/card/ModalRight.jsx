import Comments from "./Comments";
import Activity from "./Activity";

function ModalRight({ card, cardContext }) {
  return (
    <div className="space-y-8 px-6 py-6">
      <Comments card={card} cardContext={cardContext} />
      <div className="border-t border-slate-200 pt-6">
        <Activity cardContext={cardContext} />
      </div>
    </div>
  );
}

export default ModalRight;
