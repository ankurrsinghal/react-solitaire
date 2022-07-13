import React, { useContext, useReducer, useRef } from "react";
import { CardState } from "./types";
import { CreateDeck, rankToIndex, ShuffleCards, suitToIndex } from "../utils";

interface UIState {
	currentHoveredCardPile: number | null;
}

type DataState = CardState[];

export interface AppState {
	data: DataState;
	ui: UIState;
}

type Action = {
	type: string;
	payload?: any;
};

const AppReducer = (state: AppState, action: Action) => {
	let data: DataState = DataReducer(state.data, action);
	const ui: UIState = UIReducer(state.ui, action);

	return {
		data,
		ui,
	};
};

const UIReducer = (state: UIState, action: Action) => {
	if (action.type === "SELECT_CARD_PILE") {
		return {
			...state,
			currentHoveredCardPile: action.payload,
		};
	}

	if (action.type === "DESELECT_CARD_PILE") {
		return {
			...state,
			currentHoveredCardPile: null,
		};
	}

	return state;
};

const DataReducer = (state: DataState, action: Action) => {
	if (action.type === "STOCK_PILE_CLOSED_CLICKED") {
		const card = action.payload;
		return [
			...state.filter((card) => card.id !== action.payload.id),
			{
				...card,
				card: {
					...card.card,
					isFaceDown: false,
				},
				position: {
					...card.position,
					type: "STOCK_PILE_OPENED",
				},
			},
		];
	}

	if (action.type === "RESET_STOCK_OPEN_PILE") {
		return state.map((card) => {
			if (card.position.type === "STOCK_PILE_OPENED") {
				card.position.type = "STOCK_PILE_CLOSED";
				card.card.isFaceDown = true;
			}
			return card;
		});
	}

	if (action.type === "MOVE_CARD_TO_FOUNDATION") {
		const card = action.payload;
		return [
			...state.filter((card) => card.id !== action.payload.id),
			{
				...card,
				position: {
					type: "FOUNDATION",
					index: suitToIndex(card.card.suit),
				},
			},
		];
	}

	if (action.type === "CARD_MOVED_FROM_TABLEAU") {
		const { card, droppedPileIndex } = action.payload;
		if (card.position.type === "TABLEAU") {
			const allCardsFromThisPile = state.filter(
				(card) =>
					card.position.type === "TABLEAU" &&
					card.position.index === action.payload.card.position.index &&
					card.card.isFaceDown === false &&
					rankToIndex(card.card.rank) <=
						rankToIndex(action.payload.card.card.rank)
			);
			const ids = new Set(allCardsFromThisPile.map((card) => card.id));
			return [...state.filter((c) => !ids.has(c.id))].concat(
				allCardsFromThisPile.map((card) => {
					return {
						...card,
						position: {
							type: "TABLEAU",
							index: droppedPileIndex,
						},
					};
				})
			);
		}

		return [
			...state.filter((c) => c.id !== card.id),
			{
				...card,
				position: {
					type: "TABLEAU",
					index: droppedPileIndex,
				},
			},
		];
	}

	if (action.type === "FACE_DOWN_TABLEAU_CARD_CLICKED") {
		const card = action.payload;
		return [
			...state.filter((c) => c.id !== card.id),
			{
				...card,
				card: {
					...card.card,
					isFaceDown: false,
				},
			},
		];
	}

	if (action.type === "DRAW_STOCK_PILE_CARD") {
		const stockCards = state.filter((card) => {
			return card.position.type === "STOCK_PILE_CLOSED";
		});
		if (stockCards.length > 0) {
			const card = stockCards[stockCards.length - 1];
			return [
				...state.filter((c) => c.id !== card.id),
				{
					...card,
					card: {
						...card.card,
						isFaceDown: false,
					},
					position: {
						...card.position,
						type: "STOCK_PILE_OPENED",
					},
				},
			];
		} else {
			return state.map((card) => {
				if (card.position.type === "STOCK_PILE_OPENED") {
					card.position.type = "STOCK_PILE_CLOSED";
					card.card.isFaceDown = true;
				}
				return card;
			});
		}
	}

	return state;
};

type AppStateContextProps = {
	state: AppState;
	dispatch: React.Dispatch<Action>;
};

const AppStateContext = React.createContext<AppStateContextProps>(
	{} as AppStateContextProps
);

const TableauIndices = [0, 2, 5, 9, 14, 20, 27];
export const TableauIndicesSet = new Set(TableauIndices);
export const GetTableauIndex = (iindex: number) => {
	for (let index = 0; index < TableauIndices.length; index++) {
		const TableauIndex = TableauIndices[index];
		if (iindex <= TableauIndex) {
			return index;
		}
	}
};

function NewState(): AppState {
	const cards = ShuffleCards(CreateDeck());

	const data: DataState = cards.map((card, index) => {
		if (index < 28) {
			if (TableauIndicesSet.has(index)) {
				card.isFaceDown = false;
			}
			return {
				id: Date.now() + Math.random().toString(),
				card,
				position: {
					type: "TABLEAU",
					index: GetTableauIndex(index),
				},
			};
		}

		return {
			id: (Date.now() + Math.random()).toString(),
			card,
			position: {
				type: "STOCK_PILE_CLOSED",
			},
		};
	});

	return {
		data,
		ui: {
			currentHoveredCardPile: null,
		},
	};
}

const initialState: AppState = NewState();

export const AppStateProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [state, dispatch] = useReducer(AppReducer, initialState);

	return (
		<AppStateContext.Provider value={{ state, dispatch }}>
			{children}
		</AppStateContext.Provider>
	);
};

export const useAppState = () => {
	return useContext(AppStateContext);
};

export const useAppStateRef = () => {
	const { state } = useAppState();
	const stateRef = useRef<AppState>();
	stateRef.current = state;

	return stateRef.current;
};

export function useSelector<T>(fn: (state: AppState) => T): T {
	const { state } = useAppState();
	return fn(state);
}
