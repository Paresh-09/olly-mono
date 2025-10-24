import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

interface Leaderboard {
  level: number;
  totalComments: number;
}

interface LeaderboardRankingProps {
  leaderboard: Leaderboard | null;
}

export default function LeaderboardRanking({ leaderboard }: LeaderboardRankingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard ? (
          <div>
            <p>Level: {leaderboard.level}</p>
            <p>Total Comments: {leaderboard.totalComments}</p>
          </div>
        ) : (
          <p>No ranking data available.</p>
        )}
      </CardContent>
    </Card>
  );
}