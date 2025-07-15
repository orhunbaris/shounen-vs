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

    // Transform API data to our Character format
    const characters: Character[] = data.data
      .filter(
        (item: JikanCharacter) =>
          item.character.images?.jpg?.image_url &&
          item.character.name &&
          item.role === "Main" // Only get main characters for better quality
      )
      .slice(0, 10) // Limit to first 10 main characters
      .map((item: JikanCharacter) => ({
        id: item.character.mal_id,
        name: item.character.name,
        anime: animeInfo.name,
        image: item.character.images.jpg.image_url,
      }));

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
