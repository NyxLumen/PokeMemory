import { useState } from "react";
import heroImg from "./assets/hero.png";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<section id="center">
				<div className="hero">
					<img src={heroImg} className="base" width="170" height="179" alt="" />
					<h1>PokéMemory</h1>
				</div>
				<div>
					<p>A matching game built with React</p>
				</div>
			</section>
		</>
	);
}

export default App;
