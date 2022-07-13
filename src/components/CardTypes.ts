import { DragObjectFactory, DragSourceMonitor } from "react-dnd";
import { CSSProperties } from "styled-components";
import { useDrag } from 'react-dnd';
import { AnimationControls, TargetAndTransition, Transition, VariantLabels } from "framer-motion";

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export interface CardProps<T> {
	item: T;
	style?: CSSProperties;
	onCardClick?: () => void;
	onCardDoubleClick?: () => void;
	isTopMostCard?: boolean;
	canDrag?: boolean | ((monitor: any) => boolean);
	isDragging2?: boolean;
	animate?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
	transition?: Transition;
}

export interface CardContainerProps {
	isRed?: boolean;
}