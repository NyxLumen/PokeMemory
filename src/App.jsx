import { useState, useEffect } from "react";
import { getPokemonDeck } from "./utils/pokemon";
import { audioHelper } from "./utils/audio";
import Menu from "./components/Menu";
import StatsBar from "./components/StatsBar";
import GameBoard from "./components/GameBoard";
import GameOverScreen from "./components/GameOverScreen";
import VictoryScreen from "./components/VictoryScreen";
import "./App.css";

const difficultyCounts = {
  easy: 6,
  medium: 9,
  hard: 12
};

function App() {
  const [gameState, setGameState] = useState("menu"); // menu, playing, gameover, victory
  const [difficulty, setDifficulty] = useState("medium");
  
  // Game Board states
  const [cards, setCards] = useState([]);
  const [clickedIds, setClickedIds] = useState(new Set());
  const [showFront, setShowFront] = useState(true);
  const [wrongCardId, setWrongCardId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Best Streaks per difficulty
  const [bestStreaks, setBestStreaks] = useState(() => {
    const saved = localStorage.getItem("pokememory_best_streaks");
    return saved ? JSON.parse(saved) : { easy: 0, medium: 0, hard: 0 };
  });

  // Settings
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("pokememory_theme") || "dark";
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("pokememory_sound");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Sync theme class
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      document.documentElement.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
      document.documentElement.classList.remove("light-theme");
    }
    localStorage.setItem("pokememory_theme", theme);
  }, [theme]);

  // Sync sound settings
  useEffect(() => {
    localStorage.setItem("pokememory_sound", JSON.stringify(soundEnabled));
    if (soundEnabled) {
      audioHelper.setVolume(0.5, 0.15);
      if (gameState === "playing") {
        audioHelper.startBGM();
      }
    } else {
      audioHelper.setVolume(0, 0);
      audioHelper.stopBGM();
    }
  }, [soundEnabled, gameState]);

  // Cleanup BGM
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

  // Start/Restart Game
  const handleStartGame = async (selectedDiff) => {
    setDifficulty(selectedDiff);
    setLoading(true);
    setGameState("playing");
    setClickedIds(new Set());
    setWrongCardId(null);
    setShowFront(true);
    setIsProcessing(false);

    try {
      const count = difficultyCounts[selectedDiff];
      const deck = await getPokemonDeck(count);
      setCards(deck);

      if (soundEnabled) {
        audioHelper.startBGM();
      }
    } catch (e) {
      console.error("Error setting up game deck", e);
    } finally {
      setLoading(false);
    }
  };

  // Fisher-Yates array shuffler
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Card select logic
  const handleCardSelect = (id) => {
    if (isProcessing || !showFront) return;

    if (clickedIds.has(id)) {
      // DUPLICATE CLICKED = GAME OVER
      setWrongCardId(id);
      setIsProcessing(true);
      audioHelper.stopBGM();
      
      const currentStreak = clickedIds.size;
      updateBestStreak(currentStreak);

      // Delay transition to GameOver screen so they see the card shake
      setTimeout(() => {
        setGameState("gameover");
        setIsProcessing(false);
      }, 900);
    } else {
      // SAFE CLICK
      const newClicked = new Set(clickedIds);
      newClicked.add(id);
      setClickedIds(newClicked);

      const targetCount = difficultyCounts[difficulty];

      if (newClicked.size === targetCount) {
        // VICTORY
        setIsProcessing(true);
        audioHelper.stopBGM();
        updateBestStreak(targetCount);

        setTimeout(() => {
          setGameState("victory");
          setIsProcessing(false);
        }, 800);
      } else {
        // SHUFFLE SEQUENCE
        setIsProcessing(true);
        setShowFront(false); // Rotate face-down
        audioHelper.playFlip(); // Play card slide/flip SFX

        // Wait for flip-down animation to complete, then shuffle
        setTimeout(() => {
          setCards((prevCards) => shuffleArray(prevCards));
          
          // Small delay before flipping face-up again
          setTimeout(() => {
            audioHelper.playMatch(); // Play retro score sound
            setShowFront(true); // Rotate face-up
            setIsProcessing(false);
          }, 150);
        }, 350);
      }
    }
  };

  // Update best streak record
  const updateBestStreak = (streakVal) => {
    const currentBest = bestStreaks[difficulty] || 0;
    if (streakVal > currentBest) {
      const newBest = { ...bestStreaks, [difficulty]: streakVal };
      setBestStreaks(newBest);
      localStorage.setItem("pokememory_best_streaks", JSON.stringify(newBest));
    }
  };

  const handleGoHome = () => {
    audioHelper.stopBGM();
    setGameState("menu");
  };

  // Find duplicate card details for gameover display
  const getDuplicateCard = () => {
    return cards.find((c) => c.id === wrongCardId) || null;
  };

  // Select dynamic status LED based on state
  const getLedClass = () => {
    if (gameState === "gameover") return "red";
    if (gameState === "victory") return "green";
    if (loading) return "yellow";
    return "green";
  };

  return (
    <div className="app-container">
      {/* SKEUOMORPHIC POKEDEX FRAME */}
      <div className="pokedex-wrapper">
        {/* Top Camera Lens & Indicator Lights */}
        <div className="pokedex-top-bar">
          <div className="pokedex-camera-lens"></div>
          <div className="pokedex-status-leds">
            <div className={`led ${getLedClass()}`}></div>
            <div className="led yellow"></div>
            <div className="led green"></div>
          </div>
          <div style={{ marginLeft: "auto", fontFamily: "var(--font-retro)", fontSize: "0.45rem", color: "rgba(255,255,255,0.4)" }}>
            SYSTEM-89
          </div>
        </div>

        {/* Display Screen Screen Frame */}
        <div className="pokedex-screen-bezel">
          <div className="pokedex-screen-inner">
            <div className="pokedex-scanlines"></div>
            <div className="pokedex-glare"></div>

            {/* Render appropriate view inside Screen */}
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
                  <div className="menu-container scale-up" style={{ minHeight: "450px" }}>
                    <div className="pokeball-spinner"></div>
                    <h2 className="game-title" style={{ fontSize: "1.6rem", textShadow: "none" }}>
                      <span className="title-poke">BOOTING...</span>
                    </h2>
                    <p className="game-subtitle" style={{ fontSize: "0.6rem" }}>loading PokéDex scan registry</p>
                  </div>
                ) : (
                  <>
                    <StatsBar
                      matchedCount={clickedIds.size}
                      totalPairs={difficultyCounts[difficulty]}
                      bestStreak={bestStreaks[difficulty] || 0}
                      soundEnabled={soundEnabled}
                      toggleSound={toggleSound}
                      onRestart={() => handleStartGame(difficulty)}
                      onGoBack={handleGoHome}
                    />
                    <GameBoard
                      difficulty={difficulty}
                      cards={cards}
                      showFront={showFront}
                      wrongCardId={wrongCardId}
                      onCardSelect={handleCardSelect}
                      isProcessing={isProcessing}
                    />
                  </>
                )}
              </>
            )}

            {gameState === "gameover" && (
              <GameOverScreen
                streak={clickedIds.size}
                maxStreak={difficultyCounts[difficulty]}
                duplicatePokemon={getDuplicateCard()}
                onPlayAgain={() => handleStartGame(difficulty)}
                onGoHome={handleGoHome}
              />
            )}

            {gameState === "victory" && (
              <VictoryScreen
                streak={clickedIds.size}
                onPlayAgain={() => handleStartGame(difficulty)}
                onGoHome={handleGoHome}
              />
            )}
          </div>
        </div>

        {/* Bottom Hardware Console Controls (D-pad & Buttons) */}
        <div className="pokedex-controls">
          <div className="dpad-container">
            <div className="dpad-btn horizontal"></div>
            <div className="dpad-btn vertical"></div>
            <div className="dpad-center"></div>
          </div>
          
          <div className="console-pill-buttons">
            <div className="pill-button"></div>
            <div className="pill-button"></div>
          </div>

          <div className="action-buttons-group">
            <div className="round-button b-btn">B</div>
            <div className="round-button a-btn">A</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
