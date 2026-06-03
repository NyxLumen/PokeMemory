// Pokémon fetching and preparation helper for PokéMemory

// 30 popular Pokémon fallback to ensure 100% offline-resiliency and fast startup
const FALLBACK_POKEMON = [
  { id: 25, name: "Pikachu", type: "electric" },
  { id: 6, name: "Charizard", type: "fire" },
  { id: 9, name: "Blastoise", type: "water" },
  { id: 3, name: "Venusaur", type: "grass" },
  { id: 150, name: "Mewtwo", type: "psychic" },
  { id: 151, name: "Mew", type: "psychic" },
  { id: 94, name: "Gengar", type: "ghost" },
  { id: 133, name: "Eevee", type: "normal" },
  { id: 143, name: "Snorlax", type: "normal" },
  { id: 39, name: "Jigglypuff", type: "normal" },
  { id: 448, name: "Lucario", type: "fighting" },
  { id: 494, name: "Victini", type: "psychic" },
  { id: 495, name: "Snivy", type: "grass" },
  { id: 498, name: "Tepig", type: "fire" },
  { id: 501, name: "Oshawott", type: "water" },
  { id: 635, name: "Hydreigon", type: "dark" },
  { id: 571, name: "Zoroark", type: "dark" },
  { id: 612, name: "Haxorus", type: "dragon" },
  { id: 258, name: "Mudkip", type: "water" },
  { id: 175, name: "Togepi", type: "fairy" },
  { id: 197, name: "Umbreon", type: "dark" },
  { id: 196, name: "Espeon", type: "psychic" },
  { id: 384, name: "Rayquaza", type: "dragon" },
  { id: 493, name: "Arceus", type: "normal" },
  { id: 1, name: "Bulbasaur", type: "grass" },
  { id: 4, name: "Charmander", type: "fire" },
  { id: 7, name: "Squirtle", type: "water" },
  { id: 155, name: "Cyndaquil", type: "fire" },
  { id: 158, name: "Totodile", type: "water" },
  { id: 252, name: "Treecko", type: "grass" }
];

// Color mapping based on primary type for dynamic UI shadows and gradients
export const TYPE_COLORS = {
  normal: { color: "#a8a878", glow: "rgba(168, 168, 120, 0.6)", gradient: "linear-gradient(135deg, #bbbbaa, #888877)" },
  fire: { color: "#f08030", glow: "rgba(240, 128, 48, 0.6)", gradient: "linear-gradient(135deg, #ff8c00, #ff4500)" },
  water: { color: "#6890f0", glow: "rgba(104, 144, 240, 0.6)", gradient: "linear-gradient(135deg, #4fa8ff, #1d4ed8)" },
  grass: { color: "#78c850", glow: "rgba(120, 200, 80, 0.6)", gradient: "linear-gradient(135deg, #52e59b, #15803d)" },
  electric: { color: "#f8d030", glow: "rgba(248, 208, 48, 0.6)", gradient: "linear-gradient(135deg, #ffe259, #eab308)" },
  ice: { color: "#98d8d8", glow: "rgba(152, 216, 216, 0.6)", gradient: "linear-gradient(135deg, #a5f3fc, #0891b2)" },
  fighting: { color: "#c03028", glow: "rgba(192, 48, 40, 0.6)", gradient: "linear-gradient(135deg, #f87171, #991b1b)" },
  poison: { color: "#a040a0", glow: "rgba(160, 64, 160, 0.6)", gradient: "linear-gradient(135deg, #e879f9, #86198f)" },
  ground: { color: "#e0c068", glow: "rgba(224, 192, 104, 0.6)", gradient: "linear-gradient(135deg, #fcd34d, #b45309)" },
  flying: { color: "#a890f0", glow: "rgba(168, 144, 240, 0.6)", gradient: "linear-gradient(135deg, #c084fc, #6d28d9)" },
  psychic: { color: "#f85888", glow: "rgba(248, 88, 136, 0.6)", gradient: "linear-gradient(135deg, #f472b6, #db2777)" },
  bug: { color: "#a8b820", glow: "rgba(168, 184, 32, 0.6)", gradient: "linear-gradient(135deg, #a3e635, #4d7c0f)" },
  rock: { color: "#b8a038", glow: "rgba(184, 160, 56, 0.6)", gradient: "linear-gradient(135deg, #d97706, #78350f)" },
  ghost: { color: "#705898", glow: "rgba(112, 88, 152, 0.6)", gradient: "linear-gradient(135deg, #818cf8, #3730a3)" },
  dragon: { color: "#7038f8", glow: "rgba(112, 56, 248, 0.6)", gradient: "linear-gradient(135deg, #6366f1, #4338ca)" },
  dark: { color: "#705848", glow: "rgba(112, 88, 72, 0.6)", gradient: "linear-gradient(135deg, #4b5563, #111827)" },
  steel: { color: "#b8b8d0", glow: "rgba(184, 184, 208, 0.6)", gradient: "linear-gradient(135deg, #9ca3af, #374151)" },
  fairy: { color: "#ee99ac", glow: "rgba(238, 153, 172, 0.6)", gradient: "linear-gradient(135deg, #fda4af, #be185d)" }
};

// Shuffles an array using Fisher-Yates
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Format name: capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get the GIF image URL for a Pokémon ID
export function getPokemonSprite(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
}

// In-memory cache to save loaded Pokémon details and speed up restarts
const pokemonCache = new Map();

/**
 * Prepares a shuffled deck of Pokémon cards for matching based on pairCount.
 * @param {number} pairCount The number of pairs needed (e.g., 6 for Easy, 8 for Medium, 12 for Hard).
 * @returns {Promise<Array>} The shuffled deck of cards.
 */
export async function getPokemonDeck(pairCount) {
  // 1. Pick `pairCount` random unique IDs between 1 and 649 (Gen 1-5)
  const selectedIds = new Set();
  while (selectedIds.size < pairCount) {
    const randId = Math.floor(Math.random() * 649) + 1;
    selectedIds.add(randId);
  }

  const idsArray = Array.from(selectedIds);
  const pokemonList = [];

  // 2. Fetch details for each selected ID (use cache or fetch from PokeAPI, fallback to local list on failure)
  const fetchPromises = idsArray.map(async (id) => {
    if (pokemonCache.has(id)) {
      return pokemonCache.get(id);
    }

    try {
      // Fetch with timeout to handle slow connection quickly
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("API response error");

      const data = await res.json();
      const details = {
        id: data.id,
        name: capitalize(data.name),
        type: data.types[0].type.name,
        sprite: getPokemonSprite(data.id)
      };

      pokemonCache.set(id, details);
      return details;
    } catch (err) {
      console.warn(`Failed fetching Pokémon ID ${id}, using offline fallback:`, err.message);
      // Fallback: search in local list, or generate a random fallback entry
      const localMatch = FALLBACK_POKEMON.find(p => p.id === id);
      if (localMatch) {
        const details = {
          id: localMatch.id,
          name: localMatch.name,
          type: localMatch.type,
          sprite: getPokemonSprite(localMatch.id)
        };
        pokemonCache.set(id, details);
        return details;
      } else {
        // Pick a random one from FALLBACK_POKEMON that isn't already added
        const remainingFallbacks = FALLBACK_POKEMON.filter(
          fallback => !pokemonList.some(p => p.id === fallback.id) && !selectedIds.has(fallback.id)
        );
        const fallbackSrc = remainingFallbacks.length > 0 
          ? remainingFallbacks[Math.floor(Math.random() * remainingFallbacks.length)]
          : FALLBACK_POKEMON[Math.floor(Math.random() * FALLBACK_POKEMON.length)];
          
        const details = {
          id: fallbackSrc.id,
          name: fallbackSrc.name,
          type: fallbackSrc.type,
          sprite: getPokemonSprite(fallbackSrc.id)
        };
        return details;
      }
    }
  });

  const results = await Promise.all(fetchPromises);
  
  // 3. Create pairs with unique card instances
  const deck = [];
  results.forEach((poke) => {
    // Card 1
    deck.push({
      uniqueId: `card-${poke.id}-a`,
      id: poke.id,
      name: poke.name,
      type: poke.type,
      sprite: poke.sprite,
      isFlipped: false,
      isMatched: false
    });
    // Card 2
    deck.push({
      uniqueId: `card-${poke.id}-b`,
      id: poke.id,
      name: poke.name,
      type: poke.type,
      sprite: poke.sprite,
      isFlipped: false,
      isMatched: false
    });
  });

  // 4. Shuffle and return
  return shuffle(deck);
}
