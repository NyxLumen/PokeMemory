import Card from "./Card";

export default function GameBoard({
  difficulty,
  cards,
  selectedIndices,
  matchedIds,
  mismatchedIndices,
  onCardSelect,
  isProcessing
}) {
  
  const getGridClass = () => {
    switch (difficulty) {
      case "easy":
        return "grid-easy"; // 3x4 (12 cards)
      case "hard":
        return "grid-hard"; // 4x6 (24 cards)
      case "medium":
      default:
        return "grid-medium"; // 4x4 (16 cards)
    }
  };

  return (
    <div className="gameboard-container fade-in">
      <div className={`game-grid ${getGridClass()}`}>
        {cards.map((card, index) => {
          const isFlipped = selectedIndices.includes(index) || matchedIds.includes(card.id);
          const isMatched = matchedIds.includes(card.id);
          const shouldShake = mismatchedIndices.includes(index);

          return (
            <Card
              key={card.uniqueId}
              card={card}
              isFlipped={isFlipped}
              isMatched={isMatched}
              shouldShake={shouldShake}
              onClick={() => {
                if (!isProcessing) {
                  onCardSelect(index);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
