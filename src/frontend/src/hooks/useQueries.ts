import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ScoreEntry } from "../backend.d";
import { useActor } from "./useActor";

export function useTopScores(gameId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ScoreEntry[]>({
    queryKey: ["topScores", gameId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopScores(gameId, BigInt(5));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      game,
      playerName,
      score,
    }: { game: string; playerName: string; score: number }) => {
      if (!actor) throw new Error("No actor");
      await actor.submitScore(game, playerName, BigInt(score));
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["topScores", variables.game],
      });
    },
  });
}
