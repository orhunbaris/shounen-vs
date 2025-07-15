"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Swords, Trophy } from "lucide-react";
import type { Character, Vote } from "@/types/character";
import charactersData from "@/data/characters.json";

export default function Matchup() {
  const [characters] = useState<Character[]>(charactersData);
  const [currentMatchup, setCurrentMatchup] = useState<
    [Character, Character] | null
  >(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [winner, setWinner] = useState<Character | null>(null);

  // Initialize votes for all characters
  useEffect(() => {
    const initialVotes = characters.map((char) => ({
      characterId: char.id,
      votes: 0,
    }));
    setVotes(initialVotes);
    generateRandomMatchup();
  }, [characters]);

  const generateRandomMatchup = () => {
    if (characters.length < 2) return;

    const shuffled = [...characters].sort(() => Math.random() - 0.5);
    const matchup: [Character, Character] = [shuffled[0], shuffled[1]];
    setCurrentMatchup(matchup);
    setShowResult(false);
    setWinner(null);
  };

  const handleVote = (character: Character) => {
    setVotes((prevVotes) =>
      prevVotes.map((vote) =>
        vote.characterId === character.id
          ? { ...vote, votes: vote.votes + 1 }
          : vote
      )
    );
    setWinner(character);
    setShowResult(true);
  };

  const getCharacterVotes = (characterId: number) => {
    return votes.find((vote) => vote.characterId === characterId)?.votes || 0;
  };

  if (!currentMatchup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading battle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <span className="text-orange-600">Shounen</span>{" "}
            <span className="text-red-600">VS</span>
          </h1>
          <p className="text-gray-600">Choose your champion!</p>
        </div>

        {/* Battle Arena */}
        <Card className="mb-6 shadow-lg border-2 border-orange-200">
          <CardContent className="p-6">
            {/* Characters */}
            <div className="flex items-center justify-between mb-6">
              {/* Left Character */}
              <div className="flex-1 text-center">
                <div className="relative mb-3">
                  <Image
                    src={currentMatchup[0].image || "/placeholder.svg"}
                    alt={currentMatchup[0].name}
                    width={120}
                    height={120}
                    className="rounded-lg mx-auto border-2 border-orange-300 shadow-md"
                  />
                  {showResult && winner?.id === currentMatchup[0].id && (
                    <div className="absolute -top-2 -right-2">
                      <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">
                  {currentMatchup[0].name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {currentMatchup[0].anime}
                </p>
                <p className="text-xs text-gray-500">
                  Wins: {getCharacterVotes(currentMatchup[0].id)}
                </p>
              </div>

              {/* VS Divider */}
              <div className="px-4">
                <div className="flex flex-col items-center">
                  <Swords className="w-8 h-8 text-red-500 mb-1" />
                  <span className="text-2xl font-bold text-red-600">VS</span>
                </div>
              </div>

              {/* Right Character */}
              <div className="flex-1 text-center">
                <div className="relative mb-3">
                  <Image
                    src={currentMatchup[1].image || "/placeholder.svg"}
                    alt={currentMatchup[1].name}
                    width={120}
                    height={120}
                    className="rounded-lg mx-auto border-2 border-red-300 shadow-md"
                  />
                  {showResult && winner?.id === currentMatchup[1].id && (
                    <div className="absolute -top-2 -right-2">
                      <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">
                  {currentMatchup[1].name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {currentMatchup[1].anime}
                </p>
                <p className="text-xs text-gray-500">
                  Wins: {getCharacterVotes(currentMatchup[1].id)}
                </p>
              </div>
            </div>

            {/* Voting Buttons */}
            {!showResult ? (
              <div className="flex gap-3">
                <Button
                  onClick={() => handleVote(currentMatchup[0])}
                  className="flex-1 h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                >
                  Vote Left
                </Button>
                <Button
                  onClick={() => handleVote(currentMatchup[1])}
                  className="flex-1 h-14 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white shadow-lg"
                >
                  Vote Right
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-gray-800">
                    {winner?.name} wins this round!
                  </p>
                </div>
                <Button
                  onClick={generateRandomMatchup}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                >
                  Next Battle ⚔️
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-center">
              Battle Stats
            </h3>
            <div className="space-y-2">
              {votes
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 3)
                .map((vote, index) => {
                  const character = characters.find(
                    (c) => c.id === vote.characterId
                  );
                  if (!character) return null;

                  return (
                    <div
                      key={character.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">#{index + 1}</span>
                        <span className="font-medium">{character.name}</span>
                      </div>
                      <span className="text-gray-600">{vote.votes} wins</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
