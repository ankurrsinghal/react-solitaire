import { useAppState } from "./store";
import { CardState } from "./types";
import { indexToSuit, isBlackSuit, rankToIndex, suitToIndex } from "../utils";
import { useDragDropManager } from "react-dnd";
import { useEffect, useState } from "react";

export function useCardDoubleClick() {
	const { dispatch, state } = useAppState();
	return function onCardDoubleClick(item: CardState) {
		const suit = item.card.suit;
		const cardsInThisSuitFoundation = state.data.filter(
			(card) =>
				card.position.type === "FOUNDATION" &&
				card.position.index === suitToIndex(suit)
		);
		if (rankToIndex(item.card.rank) === cardsInThisSuitFoundation.length + 1) {
			dispatch({
				type: "MOVE_CARD_TO_FOUNDATION",
				payload: item,
			});
		}
	};
}

export function useGetDraggedPileOfCards() {
	const monitor = useDragDropManager().getMonitor();
	const { state } = useAppState();
	const [draggedCards, setDraggedCards] = useState(new Set<string>());

	useEffect(() => {
		const unsub = monitor.subscribeToStateChange(() => {
			const draggedItem = monitor.getItem() as CardState;
			if (draggedItem) {
				let allCardsFromThisPile: CardState[] = [];
				if (draggedItem.position.type === "TABLEAU") {
					allCardsFromThisPile = state.data.filter(
						(card) =>
							card.position.type === "TABLEAU" &&
							card.position.index === draggedItem.position.index &&
							card.card.isFaceDown === false &&
							rankToIndex(card.card.rank) <
								rankToIndex(draggedItem.card.rank)
					);
				}
				const cards = [draggedItem.id, ...allCardsFromThisPile.map((card) => card.id)];
				const ids = new Set(cards);
				setDraggedCards(ids);
			} else {
				setDraggedCards(new Set());
			}
		});

		return unsub;
	});

	return draggedCards;
}