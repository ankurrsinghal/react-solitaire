import { Card, Rank, Suit } from "./types";

export function rankToIndex(rank: Rank) {
	if (rank === Rank.ACE) {
		return 1;
	}

	if (rank === Rank.JACK) {
		return 11;
	}

	if (rank === Rank.QUEEN) {
		return 12;
	}

	if (rank === Rank.KING) {
		return 13;
	}

	return rank;
}

export function indexToRank(index: number): Rank {
	switch (index) {
		case 1:
			return Rank.ACE;
		case 2:
			return Rank.TWO;
		case 3:
			return Rank.THREE;
		case 4:
			return Rank.FOUR;
		case 5:
			return Rank.FIVE;
		case 6:
			return Rank.SIX;
		case 7:
			return Rank.SEVEN;
		case 8:
			return Rank.EIGHT;
		case 9:
			return Rank.NINE;
		case 10:
			return Rank.TEN;
		case 11:
			return Rank.JACK;
		case 12:
			return Rank.QUEEN;
		case 13:
			return Rank.KING;
		default:
			throw new Error("Unknown Index :" + index);
	}
}

const SPADE_INDEX = 0;
const HEARTS_INDEX = 1;
const CLUBS_INDEX = 2;
const DIAMOND_INDEX = 3;

export function indexToSuit(index: number): Suit {
	switch (index) {
		case SPADE_INDEX:
			return Suit.SPADE;
		case HEARTS_INDEX:
			return Suit.HEARTS;
		case CLUBS_INDEX:
			return Suit.CLUBS;
		case DIAMOND_INDEX:
			return Suit.DIAMOND;
		default:
			throw new Error("Unknown Index :" + index);
	}
}

export function suitToIndex(suit: Suit): number {
	switch (suit) {
		case Suit.SPADE:
			return SPADE_INDEX;
		case Suit.HEARTS:
			return HEARTS_INDEX;
		case Suit.CLUBS:
			return CLUBS_INDEX;
		case Suit.DIAMOND:
			return DIAMOND_INDEX;
		default:
			throw new Error("Unknown Index :" + suit);
	}
}

export function CreateDeck(): Card[] {
	const NUMBER_OF_CARDS = 52;
	return Array(NUMBER_OF_CARDS)
		.fill(0)
		.map((_, index) => {
			const suitIndex = Math.floor(index / 13);
			const rankIndex = index % 13;
			return new Card(indexToRank(rankIndex + 1), indexToSuit(suitIndex));
		});
}

export function ShuffleCards(cards: Card[]): Card[] {
	const LENGTH_OF_CARDS = cards.length;
	for (let index = 0; index < LENGTH_OF_CARDS; index++) {
		const randomIndex1 = Math.floor(Math.random() * LENGTH_OF_CARDS);
		const randomIndex2 = Math.floor(Math.random() * LENGTH_OF_CARDS);
		const temp = cards[randomIndex1];
		cards[randomIndex1] = cards[index];
		cards[index] = temp;
	}

	return cards;
}

export function isBlackSuit(suit: Suit): boolean {
	return suit === Suit.SPADE || suit === Suit.CLUBS;
}

export function isRedSuit(suit: Suit): boolean {
	return !isBlackSuit(suit);
}
