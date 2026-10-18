import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import ModalHeader from "./card/ModalHeader";
import ModalLeft from "./card/ModalLeft";
import ModalRight from "./card/ModalRight";

function CardModal({ card, list, cardContext, onClose }) {
  const [title, setTitle] = useState(card.title);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Rendered in a portal so a dragged / transformed list can't offset it
  return createPortal(
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up flex max-h-[92vh] w-full min-w-0 max-w-[1120px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/40 ring-1 ring-white/10"
      >
        <ModalHeader
          card={card}
          list={list}
          title={title}
          setTitle={setTitle}
          onClose={onClose}
          cardContext={cardContext}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          {/* MAIN */}
          <div className="min-w-0 flex-1 lg:overflow-y-auto">
            <ModalLeft
              card={card}
              cardContext={cardContext}
              title={title}
              setTitle={setTitle}
            />
          </div>

          {/* COMMENTS + ACTIVITY */}
          <aside className="min-w-0 shrink-0 border-t border-slate-200 bg-slate-50 lg:w-[400px] lg:overflow-y-auto lg:border-l lg:border-t-0">
            <ModalRight card={card} cardContext={cardContext} />
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default CardModal;
