export enum Suit {
  SPADE = "♠",
  CLUBS = "♣️",
  HEARTS = "♥️",
  DIAMOND = "♦️"
}

export enum Rank {
  ACE = "A",
  TWO = 2,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
  JACK = "J",
  QUEEN = "Q",
  KING = "K"
}

export class Card {
  isFaceDown = true;
  id = '';

  constructor(public rank: Rank, public suit: Suit) {
    this.id = rank.toString() + '-' + suit.toString();
  }
}