import styled from "styled-components";

const StyledGameWon = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
`;

const StyledGameContainer = styled.div`
	background-color: white;
	width: 100%;
	padding: 1rem;
	text-align: center;
`;

export function GameWon() {
	function handlePlayAgain() {
		window.location.href = '';
	}

	return (
		<StyledGameWon>
			<StyledGameContainer>
				<p>Congratulations! That was a terrific win.</p>
				<button onClick={handlePlayAgain}>Play Again!</button>
			</StyledGameContainer>
		</StyledGameWon>
	)
}