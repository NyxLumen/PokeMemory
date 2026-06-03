import { useState, useEffect } from "react";
import { getPokemonDeck } from "./utils/pokemon";
import { audioHelper } from "./utils/audio";
import Menu from "./components/Menu";
import StatsBar from "./components/StatsBar";
import GameBoard from "./components/GameBoard";
import VictoryScreen from "./components/VictoryScreen";
import "./App.css";

function App() {
  const [gameState, setGameState] = useState("menu"); // menu, playing, victory
  const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard
  
  // Game state
  const [cards, setCards] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [mismatchedIndices, setMismatchedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHighScore, setIsHighScore] = useState(false);

  // Settings state (persistent)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("pokememory_theme") || "dark";
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("pokememory_sound");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const difficultyPairs = {
    easy: 6,
    medium: 8,
    hard: 12
  };

  // Sync theme to document body
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    localStorage.setItem("pokememory_theme", theme);
  }, [theme]);

  // Sync sound settings to audio helper and localStorage
  useEffect(() => {
    localStorage.setItem("pokememory_sound", JSON.stringify(soundEnabled));
    if (soundEnabled) {
      audioHelper.setVolume(0.5, 0.18);
      // Start BGM if in play state
      if (gameState === "playing") {
        audioHelper.startBGM();
      }
    } else {
      audioHelper.setVolume(0, 0);
      audioHelper.stopBGM();
    }
  }, [soundEnabled, gameState]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      audioHelper.stopBGM();
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  // Start the game and fetch the deck
  const handleStartGame = async (selectedDiff) => {
    setDifficulty(selectedDiff);
    setLoading(true);
    setGameState("playing");
    setMoves(0);
    setAccuracy(100);
    setMatchedIds([]);
    setSelectedIndices([]);
    setMismatchedIndices([]);
    setIsHighScore(false);

    try {
      const pairCount = difficultyPairs[selectedDiff];
      const deck = await getPokemonDeck(pairCount);
      setCards(deck);
      
      // Start the BGM if sound is active
      if (soundEnabled) {
        audioHelper.startBGM();
      }
    } catch (e) {
      console.error("Error setting up game deck", e);
    } finally {
      setLoading(false);
    }
  };

  // Card select logic
  const handleCardSelect = (index) => {
    if (isProcessing || selectedIndices.includes(index) || matchedIds.includes(cards[index].id)) {
      return;
    }

    // Play flip sound
    audioHelper.playFlip();

    const newSelection = [...selectedIndices, index];
    setSelectedIndices(newSelection);

    if (newSelection.length === 2) {
      const firstIdx = newSelection[0];
      const secondIdx = newSelection[1];
      const newMoves = moves + 1;
      setMoves(newMoves);

      const isMatch = cards[firstIdx].id === cards[secondIdx].id;

      if (isMatch) {
        // MATCH FOUND
        const updatedMatched = [...matchedIds, cards[firstIdx].id];
        setMatchedIds(updatedMatched);
        setSelectedIndices([]);
        
        // Play match sound
        audioHelper.playMatch();

        // Calculate Accuracy
        const totalPairs = difficultyPairs[difficulty];
        const matchPct = Math.round((updatedMatched.length / newMoves) * 100);
        setAccuracy(Math.min(100, matchPct));

        // Check for Win condition
        if (updatedMatched.length === totalPairs) {
          handleWin(newMoves, Math.min(100, matchPct));
        }
      } else {
        // MISMATCH
        setIsProcessing(true);
        setMismatchedIndices([firstIdx, secondIdx]);
        
        // Play buzz sound
        audioHelper.playMismatch();

        // Flip back after animation delay
        setTimeout(() => {
          setSelectedIndices([]);
          setMismatchedIndices([]);
          setIsProcessing(false);
        }, 1000);

        // Recalculate accuracy
        const matchPct = Math.round((matchedIds.length / newMoves) * 100);
        setAccuracy(Math.min(100, matchPct));
      }
    }
  };

  // Win logic
  const handleWin = (finalMoves, finalAccuracy) => {
    audioHelper.stopBGM();
    
    // Check and save High Score
    const storedScores = localStorage.getItem("pokememory_highscores");
    let scoresObj = { easy: [], medium: [], hard: [] };
    
    if (storedScores) {
      try {
        scoresObj = JSON.parse(storedScores);
      } catch (e) {
        console.error(e);
      }
    }

    const currentDiffScores = scoresObj[difficulty] || [];
    const newScore = {
      moves: finalMoves,
      accuracy: finalAccuracy,
      date: Date.now()
    };

    // Add score, sort primarily by fewest moves, then by highest accuracy
    const updatedScores = [...currentDiffScores, newScore]
      .sort((a, b) => a.moves - b.moves || b.accuracy - a.accuracy)
      .slice(0, 5); // Keep top 5

    scoresObj[difficulty] = updatedScores;
    localStorage.setItem("pokememory_highscores", JSON.stringify(scoresObj));

    // Check if the current game is one of the top scores
    const isTopScore = updatedScores.some(
      (score) => score.date === newScore.date
    );
    setIsHighScore(isTopScore);

    // Navigate to victory screen after cards finish matching animation
    setTimeout(() => {
      setGameState("victory");
    }, 800);
  };

  // Exit back to main menu
  const handleGoHome = () => {
    audioHelper.stopBGM();
    setGameState("menu");
  };

  return (
    <div className="app-container">
      {gameState === "menu" && (
        <Menu
          onStartGame={handleStartGame}
          theme={theme}
          toggleTheme={toggleTheme}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
        />
      )}

      {gameState === "playing" && (
        <>
          {loading ? (
            <div className="logo-area scale-up" style={{ marginTop: "12vh" }}>
              <div className="pokeball-spinner"></div>
              <h2 className="game-title" style={{ fontSize: "2rem", textShadow: "none" }}>
                <span className="title-poke">Searching...</span>
              </h2>
              <p className="game-subtitle">Catching wild Pokémon from Sinnoh & Unova</p>
            </div>
          ) : (
            <>
              <StatsBar
                difficulty={difficulty}
                matchedCount={matchedIds.length}
                totalPairs={difficultyPairs[difficulty]}
                moves={moves}
                accuracy={accuracy}
                soundEnabled={soundEnabled}
                toggleSound={toggleSound}
                onRestart={() => handleStartGame(difficulty)}
                onGoBack={handleGoHome}
              />
              <GameBoard
                difficulty={difficulty}
                cards={cards}
                selectedIndices={selectedIndices}
                matchedIds={matchedIds}
                mismatchedIndices={mismatchedIndices}
                onCardSelect={handleCardSelect}
                isProcessing={isProcessing}
              />
            </>
          )}
        </>
      )}

      {gameState === "victory" && (
        <VictoryScreen
          difficulty={difficulty}
          moves={moves}
          accuracy={accuracy}
          isHighScore={isHighScore}
          onPlayAgain={() => handleStartGame(difficulty)}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}

export default App;
