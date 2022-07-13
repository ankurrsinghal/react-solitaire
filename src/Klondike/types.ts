import { Card } from "../types";

export type PositionType =
	| "FOUNDATION"
	| "STOCK_PILE_CLOSED"
	| "STOCK_PILE_OPENED"
	| "TABLEAU";

export interface CardPosition {
	type: PositionType;
	index?: number;
}

export interface CardState {
	id: string;
	card: Card;
	position: CardPosition;
	isDraggin?: boolean;
}
