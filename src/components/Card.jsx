import { TYPE_COLORS } from "../utils/pokemon";

export default function Card({ card, onClick, isFlipped, isMatched, shouldShake }) {
  const typeColorInfo = TYPE_COLORS[card.type] || TYPE_COLORS.normal;
  
  // Custom styling for the glowing shadow when matched or flipped
  const glowStyle = isFlipped || isMatched
    ? {
        boxShadow: `0 0 20px 2px ${typeColorInfo.glow}`,
        border: `1.5px solid ${typeColorInfo.color}`
      }
    : {};

  const handleCardClick = () => {
    if (!isFlipped && !isMatched) {
      onClick();
    }
  };

  return (
    <div 
      className={`pokemon-card-wrapper ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""} ${shouldShake ? "shake" : ""}`}
      onClick={handleCardClick}
    >
      <div className="pokemon-card-inner" style={glowStyle}>
        
        {/* Card Back (Hidden when flipped) */}
        <div className="pokemon-card-back">
          <div className="card-back-pattern">
            {/* Geometric Pokéball Vector Design */}
            <div className="pokeball-back-icon">
              <div className="pokeball-top"></div>
              <div className="pokeball-center-line"></div>
              <div className="pokeball-center-button">
                <div className="pokeball-inner-button"></div>
              </div>
            </div>
            <div className="card-back-decor"></div>
          </div>
        </div>

        {/* Card Front (Shown when flipped) */}
        <div 
          className="pokemon-card-front" 
          style={{ 
            background: `rgba(23, 25, 38, 0.75)`, 
            border: `1.5px solid ${typeColorInfo.color}`
          }}
        >
          {/* Subtle type-colored background radial glow */}
          <div 
            className="card-type-glow" 
            style={{ 
              background: `radial-gradient(circle, ${typeColorInfo.glow} 0%, transparent 70%)` 
            }}
          ></div>
          
          <div className="card-header-info">
            <span className="pokemon-id">#{String(card.id).padStart(3, '0')}</span>
            <span 
              className="pokemon-type-badge" 
              style={{ 
                background: typeColorInfo.gradient,
                boxShadow: `0 2px 6px ${typeColorInfo.glow}`
              }}
            >
              {card.type.toUpperCase()}
            </span>
          </div>

          <div className="card-image-container">
            <img 
              src={card.sprite} 
              alt={card.name} 
              className="pokemon-gif-sprite"
              loading="eager"
              onError={(e) => {
                // If GIF fails to load, fallback to standard static artwork
                e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${card.id}.png`;
              }}
            />
          </div>

          <h2 className="pokemon-card-name">{card.name}</h2>
        </div>

      </div>
    </div>
  );
}
