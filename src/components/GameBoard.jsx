import Card from "./Card";

export default function GameBoard({
  difficulty,
  cards,
  showFront,
  wrongCardId,
  onCardSelect,
  isProcessing
}) {
  const getGridClass = () => {
    switch (difficulty) {
      case "easy":
        return "grid-easy"; // 6 cards (2x3)
      case "hard":
        return "grid-hard"; // 18 cards (3x6)
      case "medium":
      default:
        return "grid-medium"; // 12 cards (3x4)
    }
  };

  return (
    <div className="gameboard-container fade-in">
      <div className={`game-grid ${getGridClass()}`}>
        {cards.map((card) => {
          // If this is the card that caused the game over, trigger shake
          const shouldShake = wrongCardId === card.id;

          return (
            <Card
              key={card.uniqueId}
              card={card}
              showFront={showFront}
              shouldShake={shouldShake}
              onClick={() => {
                if (!isProcessing) {
                  onCardSelect(card.id);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
