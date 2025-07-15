"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Swords, Trophy, RefreshCw, AlertCircle, Info } from "lucide-react";
import type { Character, Vote } from "@/types/character";
import { getRandomMatchup, getCacheStatus, clearRecentCache } from "@/lib/api";

export default function Matchup() {
  const [currentMatchup, setCurrentMatchup] = useState<
    [Character, Character] | null
  >(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [winner, setWinner] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [battleCount, setBattleCount] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const generateRandomMatchup = async () => {
    setIsLoading(true);
    setError(null);
    setShowResult(false);
    setWinner(null);

    try {
      const matchup = await getRandomMatchup();
      setCurrentMatchup(matchup);

      // Initialize votes for new characters if they don't exist
      setVotes((prevVotes) => {
        const newVotes = [...prevVotes];

        matchup.forEach((character) => {
          if (!newVotes.find((v) => v.character.id === character.id)) {
            newVotes.push({ character, votes: 0 });
          }
        });

        return newVotes;
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load battle";
      setError(errorMessage);
      console.error("Error generating matchup:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial matchup
  useEffect(() => {
    generateRandomMatchup();
  }, []);

  const handleVote = (character: Character) => {
    setVotes((prevVotes) => {
      const existingVoteIndex = prevVotes.findIndex(
        (vote) => vote.character.id === character.id
      );

      if (existingVoteIndex >= 0) {
        // Update existing vote
        const newVotes = [...prevVotes];
        newVotes[existingVoteIndex] = {
          ...newVotes[existingVoteIndex],
          votes: newVotes[existingVoteIndex].votes + 1,
        };
        return newVotes;
      } else {
        // Add new vote entry
        return [...prevVotes, { character, votes: 1 }];
      }
    });

    setWinner(character);
    setShowResult(true);
    setBattleCount((prev) => prev + 1);
  };

  const handleNextBattle = () => {
    generateRandomMatchup();
  };

  const handleResetCache = () => {
    clearRecentCache();
    console.log("Recent character cache cleared");
  };

  const getCharacterVotes = (characterId: number) => {
    return votes.find((vote) => vote.character.id === characterId)?.votes || 0;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Battle Failed!
            </h2>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              {error}
            </p>
            <div className="space-y-2">
              <Button
                onClick={generateRandomMatchup}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  "Try Again"
                )}
              </Button>
              <Button
                onClick={handleResetCache}
                variant="outline"
                className="w-full text-sm bg-transparent"
              >
                Reset Cache & Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !currentMatchup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {battleCount === 0
              ? "Preparing Battle..."
              : "Loading Next Battle..."}
          </h2>
          <p className="text-gray-600">Summoning anime warriors</p>
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
          <div className="flex items-center justify-center gap-4 mt-2">
            {battleCount > 0 && (
              <p className="text-sm text-gray-500">
                Battles fought: {battleCount}
              </p>
            )}
            <Button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              <Info className="w-3 h-3 mr-1" />
              Debug
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        {showDebugInfo && (
          <Card className="mb-4 border-blue-200">
            <CardContent className="p-3">
              <div className="text-xs space-y-1">
                <p className="font-semibold text-blue-800">
                  Recent Character Cache:
                </p>
                <p className="text-gray-600">
                  Cached IDs: [{getCacheStatus().cache.join(", ") || "None"}]
                </p>
                <p className="text-gray-600">
                  Size: {getCacheStatus().size}/{getCacheStatus().maxSize}
                </p>
                <Button
                  onClick={handleResetCache}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs h-6 bg-transparent"
                >
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Battle Arena */}
        <Card className="mb-6 shadow-lg border-2 border-orange-200">
          <CardContent className="p-6">
            {/* Characters */}
            <div className="flex items-center justify-between mb-6">
              {/* Left Character */}
              <div className="flex-1 text-center">
                <div className="relative mb-3">
                  <div className="w-28 h-28 mx-auto rounded-lg overflow-hidden border-2 border-orange-300 shadow-md bg-gray-100">
                    <Image
                      src={currentMatchup[0].image || "/placeholder.svg"}
                      alt={currentMatchup[0].name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=112&width=112";
                      }}
                    />
                  </div>
                  {showResult && winner?.id === currentMatchup[0].id && (
                    <div className="absolute -top-2 -right-2">
                      <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-sm text-gray-800 mb-1 leading-tight">
                  {currentMatchup[0].name}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
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
                  <div className="w-28 h-28 mx-auto rounded-lg overflow-hidden border-2 border-red-300 shadow-md bg-gray-100">
                    <Image
                      src={currentMatchup[1].image || "/placeholder.svg"}
                      alt={currentMatchup[1].name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg?height=112&width=112";
                      }}
                    />
                  </div>
                  {showResult && winner?.id === currentMatchup[1].id && (
                    <div className="absolute -top-2 -right-2">
                      <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-sm text-gray-800 mb-1 leading-tight">
                  {currentMatchup[1].name}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
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
                  <p className="text-sm text-gray-600">From {winner?.anime}</p>
                </div>
                <Button
                  onClick={handleNextBattle}
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Loading Next Battle...
                    </>
                  ) : (
                    "Next Battle ⚔️"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Battle Champions */}
        {votes.length > 0 && (
          <Card className="shadow-md">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-center">
                Battle Champions
              </h3>
              <div className="space-y-3">
                {votes
                  .filter((vote) => vote.votes > 0)
                  .sort((a, b) => b.votes - a.votes)
                  .slice(0, 5)
                  .map((vote, index) => (
                    <div
                      key={vote.character.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                    >
                      <span className="text-sm font-bold text-gray-500 w-6">
                        #{index + 1}
                      </span>
                      <div className="w-8 h-8 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                        <Image
                          src={vote.character.image || "/placeholder.svg"}
                          alt={vote.character.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg?height=32&width=32";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {vote.character.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vote.character.anime}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        {vote.votes} wins
                      </span>
                    </div>
                  ))}
              </div>
              {votes.filter((vote) => vote.votes > 0).length === 0 && (
                <p className="text-center text-gray-500 text-sm">
                  No battles completed yet
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
