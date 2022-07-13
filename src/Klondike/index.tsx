import styled, { CSSProperties } from "styled-components";
import {
	DndProvider,
	useDragLayer,
	useDrop,
} from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { indexToSuit, isBlackSuit, rankToIndex, suitToIndex } from "../utils";
import { Rank, Suit } from "../types";
import {
	useAppState,
	useSelector,
	AppStateProvider,
	GetTableauIndex,
	TableauIndicesSet,
	AppState,
	useAppStateRef,
} from "./store";
import { Card, CARD_HEIGHT, CARD_WIDTH } from "../components/Card";
import { useCardDoubleClick, useGetDraggedPileOfCards } from "./hooks";
import { CardState } from "./types";
import {
	useContext,
	useEffect,
	useRef,
} from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Keyboard, KeyboardContext, KeysType, useKeyboard } from "./useKeyboard";
import { GameWon } from "./GameWon";

const DumbCardPile = ({
	cards,
	style,
	onCardClick,
	getCardStyle,
	isTopMostCard,
	onCardDoubleClick,
}: {
	cards: CardState[];
	style?: CSSProperties;
	onCardClick?: () => void;
	getCardStyle?: (card: CardState, index: number) => CSSProperties;
	isTopMostCard?: (index: number) => boolean;
	onCardDoubleClick?: (card: CardState) => void;
}) => {
	return (
		<div
			style={{ position: "relative", minWidth: 80, ...style }}
		>
			{cards.map((card, index) => (
				<Card
					style={{
						transform: `translate(${index * 2}px, -${index * 100}px)`,
						...(getCardStyle && getCardStyle(card, index)),
					}}
					item={card}
					key={index}
					onCardClick={onCardClick}
					onCardDoubleClick={() => onCardDoubleClick && onCardDoubleClick(card)}
					isTopMostCard={isTopMostCard && isTopMostCard(index)}
				/>
			))}
		</div>
	);
};

const EmptyCardPile = styled.div`
	border: 1px solid black;
	width: ${CARD_WIDTH}px;
	height: ${CARD_HEIGHT}px;
	border-radius: 4px;
	position: absolute;
`;

const CardPile = ({
	cards,
	handleCardDrop,
	pileIndex,
}: {
	cards: CardState[];
	handleCardDrop: Function;
	pileIndex: number;
}) => {
	const { dispatch, state } = useAppState();
	const topCardOnThePile = cards[cards.length - 1];

	const [, ref] = useDrop<CardState, any, any>({
		accept: "CARD",
		drop(item) {
			if (topCardOnThePile === undefined) {
				// empty deck
				if (item.card.rank === Rank.KING) {
					handleCardDrop(pileIndex, item);
				}
			} else if (
				isBlackSuit(topCardOnThePile.card.suit) !== isBlackSuit(item.card.suit)
			) {
				if (
					rankToIndex(item.card.rank) ===
					rankToIndex(topCardOnThePile.card.rank) - 1
				) {
					handleCardDrop(pileIndex, item);
				}
			}
		},
	});

	function handleTableauCardClick() {
		if (topCardOnThePile.card.isFaceDown) {
			dispatch({
				type: "FACE_DOWN_TABLEAU_CARD_CLICKED",
				payload: topCardOnThePile,
			});
		}
	}

	const CardDoubleClickHandler = useCardDoubleClick();

	const faceUpCards = cards.filter((card) => !card.card.isFaceDown);
	const faceDownCards = cards.filter((card) => card.card.isFaceDown);

	const draggedCards = useGetDraggedPileOfCards();

	if (cards.length === 0) {
		<StyledFoundationPile />;
	}

	function handleMouseEnter() {
		dispatch({
			type: "SELECT_CARD_PILE",
			payload: pileIndex,
		});
	}

	function handleMouseLeave() {
		dispatch({
			type: "DESELECT_CARD_PILE",
		});
	}

	return (
		<div
			ref={ref}
			style={{
				position: "relative",
				// marginRight: 10,
				minWidth: 80,
				flex: 1,
				display: "flex",
				alignItems: "center",
				flexDirection: "column",
			}}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<EmptyCardPile />
			<DumbCardPile
				cards={faceDownCards}
				onCardClick={() => handleTableauCardClick()}
			/>
			<DumbCardPile
				cards={faceUpCards}
				onCardClick={() => handleTableauCardClick()}
				getCardStyle={(card, index) => ({
					transform: `translate(${(faceDownCards.length + index) * 2}px, -${(index + faceDownCards.length) * 100
						}px)`,
					opacity: draggedCards.has(card.id) ? 0 : 1,
				})}
				isTopMostCard={(index) => index === faceUpCards.length - 1}
				onCardDoubleClick={(card) => CardDoubleClickHandler(card)}
			/>
		</div>
	);
};

const CardPiles = () => {
	const { state, dispatch } = useAppState();

	function getCardsForTableau(index: number) {
		return state.data.filter((card) => {
			return card.position.type === "TABLEAU" && card.position.index === index;
		});
	}

	function handleCardDrop(droppedPileIndex: number, card: CardState) {
		dispatch({
			type: "CARD_MOVED_FROM_TABLEAU",
			payload: { droppedPileIndex, card },
		});
	}

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				width: "100%",
			}}
		>
			{Array(7)
				.fill(0)
				.map((_, index) => {
					return (
						<CardPile
							key={index}
							cards={getCardsForTableau(index)}
							handleCardDrop={handleCardDrop}
							pileIndex={index}
						/>
					);
				})}
		</div>
	);
};

const StyledFoundationPile = styled.div`
	border: 1px solid black;
	border-radius: 4px;
	width: ${CARD_WIDTH}px;
	height: ${CARD_HEIGHT}px;
	cursor: pointer;
	position: relative;
	margin-right: 1rem;
`;

function StockCardsEmpty({ onClick }: { onClick: () => void }) {
	return <StyledFoundationPile onClick={onClick}></StyledFoundationPile>;
}

function StockPile() {
	const { dispatch, state } = useAppState();
	const stockCards = useSelector<CardState[]>((state) =>
		state.data.filter((card) => card.position.type === "STOCK_PILE_CLOSED")
	);

	const openedCards = useSelector<CardState[]>((state) =>
		state.data.filter((card) => card.position.type === "STOCK_PILE_OPENED")
	);

	function handleOnStockPileCardClick(card: CardState) {
		dispatch({
			type: "STOCK_PILE_CLOSED_CLICKED",
			payload: card,
		});
	}

	function handleOpenedPileCardClick() {
		if (stockCards.length === 0) {
			dispatch({
				type: "RESET_STOCK_OPEN_PILE",
			});
		}
	}

	const CardDoubleClickHandler = useCardDoubleClick();
	const stockCardsIsEmptyNow = stockCards.length === 0;

	const draggedCards = useGetDraggedPileOfCards();

	const { registerHandler, unRegisterHandler } = useContext(KeyboardContext);

	useEffect(() => {
		registerHandler(KeysType.SPACE, (e) => {
			e.preventDefault();
			dispatch({
				type: "DRAW_STOCK_PILE_CARD",
			});
		});

		return () => unRegisterHandler(KeysType.SPACE);
	}, []);

	return (
		<div className="stock-pile" style={{ display: "flex" }}>
			<div style={{ width: 110, height: 120, marginBottom: 20 }}>
				{stockCardsIsEmptyNow ? (
					<StockCardsEmpty onClick={() => handleOpenedPileCardClick()} />
				) : (
					stockCards.map((props, index) => (
						<Card
							style={{
								position: "absolute",
								transform: `translateX(${index * 0.5}px)`,
							}}
							item={props}
							key={index}
							onCardClick={() => handleOnStockPileCardClick(props)}
						/>
					))
				)}
			</div>
			<div style={{ width: 80, height: 120, marginBottom: 20 }}>
				{openedCards.map((props, index) => (
					<Card
						animate={{
							x: [-100, 0],
						}}
						transition={{
							duration: 0.2,
						}}
						style={{
							position: "absolute",
							transform: `translateX(${index * 0.5}px)`,
							opacity: draggedCards.has(props.id) ? 0 : 1,
						}}
						item={props}
						key={index}
						onCardDoubleClick={() => CardDoubleClickHandler(props)}
					/>
				))}
			</div>
		</div>
	);
}

const WaterMark = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 3rem;
	color: #ddd;
	height: 100%;
`;

function FoundationPile({ suit }: { suit: Suit }) {
	const { dispatch } = useAppState();

	const cards = useSelector((state) =>
		state.data.filter(
			(card) =>
				card.position.type === "FOUNDATION" &&
				card.position.index === suitToIndex(suit)
		)
	);

	const [, ref] = useDrop<CardState, any, any>({
		accept: "CARD",
		drop(item) {
			if (item.card.suit === suit) {
				if (rankToIndex(item.card.rank) === cards.length + 1) {
					dispatch({
						type: "MOVE_CARD_TO_FOUNDATION",
						payload: item,
					});
				}
			}
		},
	});

	const draggedCards = useGetDraggedPileOfCards();

	return (
		<StyledFoundationPile ref={ref}>
			{cards.length === 0 ? (
				<WaterMark>{suit}</WaterMark>
			) : (
				<div style={{ width: 80, height: 120, marginBottom: 20 }}>
					{cards.map((props, index) => (
						<Card
							style={{
								position: "absolute",
								opacity: draggedCards.has(props.id) ? 0 : 1,
							}}
							item={props}
							key={index}
						// canDrag={props.position.type !== "FOUNDATION"}
						/>
					))}
				</div>
			)}
		</StyledFoundationPile>
	);
}

function FoundationPiles() {
	const { dispatch, state } = useAppState();
	const { registerHandler, unRegisterHandler } = useContext(KeyboardContext);
	const stateRef = useRef<AppState>();
	stateRef.current = state;

	useEffect(() => {
		let pressedTimes = 0;
		let timeWhenPressedOnce = 0;

		registerHandler(KeysType.ENTER, (e) => {
			e.preventDefault();
			pressedTimes++;
			if (pressedTimes % 2 === 0) {
				const timePassed = Date.now() - timeWhenPressedOnce;
				if (timePassed < 250) {
					// send card to stock pile
					if (stateRef.current) {
						const state = stateRef.current;
						const CurrentHoveredPileIndex = state.ui.currentHoveredCardPile;

						// first check if there is a pile hovered by pointer
						// and there is a valid card to be moved to the foundation
						if (CurrentHoveredPileIndex !== null) {
							// get all the cards from this pile which are faceUp
							const cards = state.data.filter(
								(card) =>
									card.position.type === "TABLEAU" &&
									card.position.index === CurrentHoveredPileIndex &&
									card.card.isFaceDown === false
							);

							if (cards.length > 0) {
								// check whether the top most card can be moved to foundation
								const topMostCard = cards[cards.length - 1];

								// if the card is an Ace move it
								if (topMostCard.card.rank === Rank.ACE) {
									dispatch({
										type: "MOVE_CARD_TO_FOUNDATION",
										payload: topMostCard,
									});
								} else {
									// get the cards from foundation of this card suite
									const cards = state.data.filter(
										(card) =>
											card.position.type === "FOUNDATION" &&
											card.position.index === suitToIndex(topMostCard.card.suit)
									);

									// if it can be moved to this foundation
									// move it
									if (cards.length + 1 === rankToIndex(topMostCard.card.rank)) {
										dispatch({
											type: "MOVE_CARD_TO_FOUNDATION",
											payload: topMostCard,
										});
									}
								}
							}
						} else {
							// do the stock pile cards now
							const stockPileOpenCards = state.data.filter(
								(card) => card.position.type === "STOCK_PILE_OPENED"
							);
							const topMostStockPileCard =
								stockPileOpenCards[stockPileOpenCards.length - 1];

							if (topMostStockPileCard) {
								// an ace card
								if (topMostStockPileCard.card.rank === Rank.ACE) {
									// send to foundation pile of that index;
									dispatch({
										type: "MOVE_CARD_TO_FOUNDATION",
										payload: topMostStockPileCard,
									});
								} else {
									const cardsInFoundation = state.data.filter(
										(card) =>
											card.position.type === "FOUNDATION" &&
											card.position.index ===
											suitToIndex(topMostStockPileCard.card.suit)
									);
									if (
										cardsInFoundation.length + 1 ===
										rankToIndex(topMostStockPileCard.card.rank)
									) {
										dispatch({
											type: "MOVE_CARD_TO_FOUNDATION",
											payload: topMostStockPileCard,
										});
									}
								}
							}
						}
					}
				} else {
					pressedTimes = 0;
				}
			} else {
				timeWhenPressedOnce = Date.now();
			}
		});

		return () => unRegisterHandler(KeysType.SPACE);
	}, []);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
			}}
		>
			{Array(4)
				.fill(0)
				.map((_, index) => {
					return <FoundationPile key={index} suit={indexToSuit(index)} />;
				})}
		</div>
	);
}

function DragLayerComponent() {
	const { state } = useAppState();
	const { isDragging, item, offSet } = useDragLayer((monitor) => {
		return {
			isDragging: monitor.isDragging(),
			item: monitor.getItem(),
			offSet: monitor.getSourceClientOffset(),
		};
	});

	if (!isDragging || !offSet) {
		return null;
	}

	let allCardsFromThisPile: CardState[] = [];
	if (item.position.type === "TABLEAU") {
		allCardsFromThisPile = state.data.filter(
			(card) =>
				card.position.type === "TABLEAU" &&
				card.position.index === item.position.index &&
				card.card.isFaceDown === false &&
				rankToIndex(card.card.rank) < rankToIndex(item.card.rank)
		);
	}

	return (
		<DumbCardPile
			cards={[item, ...allCardsFromThisPile]}
			style={{
				position: "fixed",
				pointerEvents: "none",
				top: 0,
				left: 0,
				transform: `translate(${offSet?.x}px, ${offSet?.y}px)`,
				zIndex: 100,
			}}
		/>
	);
}

function AnimatedCardPiles({ onComplete }: { onComplete: () => void }) {
	const { state, dispatch } = useAppState();

	const cards = state.data.filter((card) => {
		return card.position.type === "TABLEAU";
	});

	let counter = 0;
	function getYIndex(index: number) {
		if (TableauIndicesSet.has(index)) {
			const rv = counter++;
			counter = 0;
			return rv;
		} else {
			const rv = counter;
			counter++;
			return rv;
		}
	}

	function onAnimationComplete() {
		onComplete();
	}

	let allCards = [];
	for (let index = 0; index < cards.length; index++) {
		const card = cards[index];
		allCards.push(
			<motion.div
				onAnimationComplete={
					index === cards.length - 1 ? onAnimationComplete : undefined
				}
				animate={{
					x: [-152, 0 + (GetTableauIndex(index) || 0) * 175],
					y: [-32, 20 * getYIndex(index)],
					opacity: [0, 1],
				}}
				transition={{
					duration: 0.1,
					delay: 0.1 * index,
				}}
				key={index}
				style={{ position: "absolute" }}
			>
				<Card item={card} key={index} />
			</motion.div>
		);
	}

	return <div className="animated-card-piles">{allCards}</div>;
}

function KlondikeApp() {
	const [isAnimationDone, setIsAniamtionDone] = useState(false);

	function onComplete() {
		setIsAniamtionDone(true);
	}

	const { dispatch } = useAppState();
	const state = useAppStateRef();

	const hasUserWonGame = state.data.every(cardState => {
		return cardState.position.type === "FOUNDATION";
	});

	useKeyboard(KeysType.Z, (e) => {
		console.log("Dispatching undo");
		dispatch({
			type: 'UNDO'
		});
	});

	return (
		<div
			style={{ pointerEvents: isAnimationDone ? "all" : "none" }}
			className="Klondike"
		>
			{hasUserWonGame ? <GameWon /> : null}
			<DragLayerComponent />
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<StockPile />
				<FoundationPiles />
			</div>
			<br />
			{isAnimationDone ? (
				<CardPiles />
			) : (
				<AnimatedCardPiles onComplete={onComplete} />
			)}
		</div>
	)
}

export function Klondike() {
	return (
		<DndProvider backend={HTML5Backend}>
			<Keyboard>
				<AppStateProvider>
					<KlondikeApp />
				</AppStateProvider>
			</Keyboard>
		</DndProvider>
	);
}
