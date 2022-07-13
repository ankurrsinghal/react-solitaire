import './styles.css';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Klondike } from "./Klondike";
import { useState } from 'react';

export default function App() {
	return (
		<div className="App" style={{ background: 'green' }}>
			<div className="game">
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Klondike />} />
					</Routes>
				</BrowserRouter>
			</div>
		</div>
	);
}
