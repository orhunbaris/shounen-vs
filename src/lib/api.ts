import type {
  JikanResponse,
  JikanCharacter,
  Character,
  AnimeInfo,
} from "@/types/character";

export const ANIME_LIST: AnimeInfo[] = [
  {
    id: 21,
    name: "One Piece",
    apiUrl: "https://api.jikan.moe/v4/anime/21/characters",
  },
  {
    id: 20,
    name: "Naruto",
    apiUrl: "https://api.jikan.moe/v4/anime/20/characters",
  },
  {
    id: 269,
    name: "Bleach",
    apiUrl: "https://api.jikan.moe/v4/anime/269/characters",
  },
];

function isValidCharacter(item: JikanCharacter): boolean {
  return !!(
    item.character?.name &&
    item.character?.images?.jpg?.image_url &&
    item.character.name.trim().length > 0 &&
    item.character.images.jpg.image_url.startsWith("http")
  );
}

export async function fetchAnimeCharacters(
  animeInfo: AnimeInfo
): Promise<Character[]> {
  try {
    const response = await fetch(animeInfo.apiUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${animeInfo.name} characters: ${response.status}`
      );
    }

    const data: JikanResponse = await response.json();

    // Filter out invalid characters and transform to our format
    const characters: Character[] = data.data
      .filter(isValidCharacter) // Only keep characters with valid name and image
      .slice(0, 20) // Get more characters to have better selection
      .map((item: JikanCharacter) => ({
        id: item.character.mal_id,
        name: item.character.name.trim(),
        anime: animeInfo.name,
        image: item.character.images.jpg.image_url,
      }));

    if (characters.length === 0) {
      throw new Error(`No valid characters found for ${animeInfo.name}`);
    }

    return characters;
  } catch (error) {
    console.error(`Error fetching ${animeInfo.name} characters:`, error);
    throw error;
  }
}

export async function getRandomCharacterFromAnime(
  animeInfo: AnimeInfo
): Promise<Character> {
  const characters = await fetchAnimeCharacters(animeInfo);

  if (characters.length === 0) {
    throw new Error(`No characters found for ${animeInfo.name}`);
  }

  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters[randomIndex];
}

export function getRandomAnimeSelection(): [AnimeInfo, AnimeInfo] {
  const shuffled = [...ANIME_LIST].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export async function getRandomMatchup(): Promise<[Character, Character]> {
  const maxRetries = 5;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const [anime1, anime2] = getRandomAnimeSelection();

      // Fetch characters from both anime in parallel
      const [character1, character2] = await Promise.all([
        getRandomCharacterFromAnime(anime1),
        getRandomCharacterFromAnime(anime2),
      ]);

      // Prevent duplicate matchups - ensure characters are different
      if (character1.id !== character2.id) {
        return [character1, character2];
      }

      // If same character, try again
      attempts++;
      console.log(
        `Duplicate characters detected (${character1.name}), retrying... (${attempts}/${maxRetries})`
      );
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        throw error;
      }
      console.log(`Attempt ${attempts} failed, retrying...`);
    }
  }

  throw new Error("Failed to generate unique matchup after multiple attempts");
}
