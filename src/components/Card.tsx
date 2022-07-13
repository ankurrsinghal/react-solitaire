import styled, { CSSProperties } from "styled-components";
import {
	DndProvider,
	useDrag,
	useDragDropManager,
	useDragLayer,
	useDrop,
} from "react-dnd";
import { motion } from 'framer-motion';

import { CardContainerProps, CardProps } from "./CardTypes";
import { Card as CardType, Rank, Suit } from "../types";
import { useEffect } from "react";
import { getEmptyImage } from "react-dnd-html5-backend";
import { rankToIndex } from "../utils";
import { PositionType } from "../Klondike/types";
import { CardPosition } from "../Klondike/types";
import { useAppState } from "../Klondike/store";

const CARD_FACTOR = 110;
export const CARD_WIDTH = 0.8 * CARD_FACTOR;
export const CARD_HEIGHT = 1.2 * CARD_FACTOR;

function Background() {
	return (
		<div style={{ display: "flex", justifyContent: "space-evenly" }}>
			<div>♠</div>
			<div>♣️</div>
			<div>♥️</div>
			<div>♦️</div>
		</div>
	);
}

function Backgrounds() {
	return (
		<div>
			<Background />
			<Background />
			<Background />
			<Background />
			<Background />
			<Background />
		</div>
	);
}

const CardFaceDown = styled.div`
	border: 1px solid black;
	border-radius: 4px;
	width: ${CARD_WIDTH}px;
	height: ${CARD_HEIGHT}px;
	cursor: pointer;
	position: relative;
	background-color: pink;
	display: flex;
	justify-content: space-evenly;
	flex-direction: column;
`;

const CardContainer = styled.div<CardContainerProps>`
	border: 1px solid black;
	border-radius: 4px;
	width: ${CARD_WIDTH}px;
	height: ${CARD_HEIGHT}px;
	position: relative;
	cursor: pointer;
	color: ${(props) => (props.isRed ? "red" : "black")};
	background-color: white;
	overflow: hidden;
`;
const CardAnnotationContainer = styled.div`
	position: absolute;
	top: 4px;
	left: 4px;
`;
const CardAnnotationRank = styled.div``;
const CardAnnotationSuit = styled.div`
	font-size: 20px;
`;

const CardSuitCollection = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-evenly;
	font-size: 4rem;
`;

const CardSuit = styled.div``;

const CardAnnotation = ({
	rank,
	suit,
	upside,
}: {
	rank: Rank;
	suit: Suit;
	upside?: boolean;
}) => {
	const styles = upside ? { transform: "scale(-1)", bottom: 4, right: 4 } : {};

	return (
		<CardAnnotationContainer style={styles}>
			<CardAnnotationRank>{rank}</CardAnnotationRank>
			<CardAnnotationSuit>{suit}</CardAnnotationSuit>
		</CardAnnotationContainer>
	);
};

export function Card<T extends { card: CardType, isDraggin?: boolean }>(
	props: CardProps<T>
) {
	const {
		item,
		style,
		onCardClick,
		isTopMostCard,
		onCardDoubleClick,
		canDrag,
		isDragging2,
		animate,
		transition
	} = props;
	const { card, isDraggin } = item;
	const { rank, suit, isFaceDown } = card;
	if (isFaceDown) {
		return (
			<motion.div
				animate={animate}
				transition={transition}
			>
				<CardFaceDown style={style} onClick={onCardClick}>
					<Backgrounds />
				</CardFaceDown>
			</motion.div>
		);
	}

	const [{ isDragging }, ref, preview] = useDrag({
		type: "CARD",
		item: () => {
			return { ...item, isTopMostCard };
		},
		canDrag,
		collect: (monitor) => {
			return {
				isDragging: monitor.isDragging(),
			};
		},
	});

	useEffect(() => {
		preview(getEmptyImage());
	}, []);

	const isRed = suit === Suit.HEARTS || suit === Suit.DIAMOND;
	return (
		<motion.div
			animate={animate}
			transition={transition}
			onClick={onCardClick}
			onDoubleClick={onCardDoubleClick}
			style={{ ...style }}
		>
			<CardContainer ref={ref} isRed={isRed}>
				<CardAnnotation rank={rank} suit={suit} />
				<CardSuitCollection>
					{Array(1)
						.fill(0)
						.map((_, i) => {
							return <CardSuit key={i}>{suit}</CardSuit>;
						})}
				</CardSuitCollection>
				<CardAnnotation rank={rank} suit={suit} upside={true} />
			</CardContainer>
		</motion.div>
	);
}
