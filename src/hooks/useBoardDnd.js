import { useCallback, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import toast from "react-hot-toast";

import { reorderCards } from "../api/cardApi";
import { reorderLists } from "../api/listApi";
import { getErrorMessage } from "../lib/validation";
import {
  applyLayoutToBoardData,
  cloneLists,
  diffCardPlacements,
  diffListPositions,
  findListOfCard,
  moveCardToEnd,
  moveCardToList,
  reorderCardInList,
  reorderLists as reorderListsLocal,
  sameId,
} from "../lib/boardDnd";

// Drag and drop for the board.
//
// While a drag is in progress we work on a private copy of the lists
// ("draft") so cards visibly slide into other lists as you move over them.
// On drop the final arrangement is written to React Query's cache first (so
// nothing flickers back) and then saved with a single request.
export const useBoardDnd = ({
  boardId,
  lists,
  enabled,
  isDraggingRef,
  onSettled,
}) => {
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const draftRef = useRef(null);
  const lastOverId = useRef(null);

  const setDraftBoth = useCallback((next) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  // What the board shows: the draft while dragging, the real lists otherwise
  const displayLists = draft ?? lists;
  const currentRef = useRef(displayLists);
  currentRef.current = displayLists;

  const finish = useCallback(() => {
    setDraftBoth(null);
    setActiveItem(null);
    lastOverId.current = null;
    isDraggingRef.current = false;
    onSettled?.();
  }, [isDraggingRef, onSettled, setDraftBoth]);

  // ---------------------------------------------------------------
  // Which droppable is under the pointer
  // ---------------------------------------------------------------
  const collisionDetection = useCallback((args) => {
    const type = args.active.data.current?.type;
    const isListTarget = (container) => container.data.current?.type === "list";

    // Dragging a list: only other lists matter
    if (type === "list") {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(isListTarget),
      });
    }

    // Dragging a card: cards, and the empty area of a list
    const targets = args.droppableContainers.filter((c) => !isListTarget(c));

    const pointerHits = pointerWithin({ ...args, droppableContainers: targets });
    const hits = pointerHits.length
      ? pointerHits
      : rectIntersection({ ...args, droppableContainers: targets });

    let overId = getFirstCollision(hits, "id");

    if (overId != null) {
      const overContainer = targets.find((c) => c.id === overId);

      // Over a list's body: aim at the card nearest to the pointer
      if (overContainer?.data.current?.type === "cards") {
        const list = currentRef.current.find((l) =>
          sameId(l.id, overContainer.data.current.listId),
        );

        if (list && list.cards.length > 0) {
          const ids = new Set(list.cards.map((card) => `card:${card.id}`));
          const nearest = closestCenter({
            ...args,
            droppableContainers: targets.filter((c) => ids.has(c.id)),
          });

          overId = nearest[0]?.id ?? overId;
        }
      }

      lastOverId.current = overId;
      return [{ id: overId }];
    }

    // Between targets: stay on the last one to avoid flicker
    return lastOverId.current ? [{ id: lastOverId.current }] : [];
  }, []);

  // ---------------------------------------------------------------
  // Drag lifecycle
  // ---------------------------------------------------------------
  const onDragStart = useCallback(
    (event) => {
      if (!enabled) return;

      isDraggingRef.current = true;
      setDraftBoth(cloneLists(lists));

      const data = event.active.data.current;
      const rect = event.active.rect.current.initial;

      setActiveItem({
        type: data?.type,
        id: data?.type === "list" ? data.listId : data?.cardId,
        width: rect?.width,
        height: rect?.height,
      });
    },
    [enabled, isDraggingRef, lists, setDraftBoth],
  );

  // A card dragged over another list moves into it straight away
  const onDragOver = useCallback((event) => {
    const { active, over } = event;
    const data = active.data.current;

    if (!over || data?.type !== "card") return;

    const overData = over.data.current;

    setDraftBoth(
      (() => {
        const current = draftRef.current;
        if (!current) return current;

        const overList =
          overData?.type === "card"
            ? findListOfCard(current, overData.cardId)
            : current.find((list) => sameId(list.id, overData?.listId));

        const fromList = findListOfCard(current, data.cardId);

        if (!overList || !fromList || sameId(overList.id, fromList.id)) {
          return current;
        }

        let index = overList.cards.length;

        if (overData?.type === "card") {
          const overIndex = overList.cards.findIndex((card) =>
            sameId(card.id, overData.cardId),
          );
          const translated = active.rect.current.translated;
          const below =
            translated &&
            translated.top > over.rect.top + over.rect.height / 2;

          index = overIndex + (below ? 1 : 0);
        }

        return moveCardToList(current, data.cardId, overList.id, index);
      })(),
    );
  }, [setDraftBoth]);

  const onDragCancel = useCallback(() => finish(), [finish]);

  const onDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      const data = active.data.current;
      const overData = over?.data.current;

      try {
        if (!enabled || !over) return;

        const base = draftRef.current ?? lists;
        let next = base;

        if (data?.type === "list") {
          next = reorderListsLocal(base, data.listId, overData?.listId);

          const changes = diffListPositions(lists, next);
          if (changes.length === 0) return;

          queryClient.setQueryData(["board", boardId], (old) =>
            applyLayoutToBoardData(old, next),
          );

          await reorderLists({ lists: changes });
        } else if (data?.type === "card") {
          // The card may already sit in the list it was dropped on (the
          // preview moved it); only the order inside that list is left.
          if (overData?.type === "card") {
            const here = findListOfCard(base, data.cardId);
            const target = findListOfCard(base, overData.cardId);

            next =
              here && target && !sameId(here.id, target.id)
                ? moveCardToList(
                    base,
                    data.cardId,
                    target.id,
                    target.cards.findIndex((card) =>
                      sameId(card.id, overData.cardId),
                    ),
                  )
                : reorderCardInList(base, data.cardId, overData.cardId);
          } else if (overData?.type === "cards") {
            const here = findListOfCard(base, data.cardId);
            next = sameId(here?.id, overData.listId)
              ? moveCardToEnd(base, data.cardId)
              : moveCardToList(
                  base,
                  data.cardId,
                  overData.listId,
                  Number.MAX_SAFE_INTEGER,
                );
          }

          const changes = diffCardPlacements(lists, next);
          if (changes.length === 0) return;

          queryClient.setQueryData(["board", boardId], (old) =>
            applyLayoutToBoardData(old, next),
          );

          await reorderCards({ cards: changes });
        }

        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
        queryClient.invalidateQueries({
          queryKey: ["board", boardId, "filters"],
        });
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not save that change"));
        queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      } finally {
        finish();
      }
    },
    [enabled, lists, boardId, queryClient, finish],
  );

  // Smooth landing: the floating copy glides into its slot
  const dropAnimation = useMemo(
    () => ({
      duration: 220,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      sideEffects: defaultDropAnimationSideEffects({
        styles: { active: { opacity: "0.4" } },
      }),
    }),
    [],
  );

  return {
    displayLists,
    activeItem,
    collisionDetection,
    dropAnimation,
    handlers: { onDragStart, onDragOver, onDragEnd, onDragCancel },
  };
};
