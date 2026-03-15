export const calculateNewLevels = (
  winnersLevels: number[],
  losersLevels: number[]
): { newWinnerLevels: number[]; newLoserLevels: number[] } => {
  const avgWinner = winnersLevels.reduce((a, b) => a + b, 0) / winnersLevels.length;
  const avgLoser = losersLevels.reduce((a, b) => a + b, 0) / losersLevels.length;

  const diff = avgLoser - avgWinner;
  const change = parseFloat((0.1 + Math.max(0, diff) * 0.05).toFixed(1));

  const newWinnerLevels = winnersLevels.map(l => parseFloat(Math.min(7, l + change).toFixed(1)));
  const newLoserLevels = losersLevels.map(l => parseFloat(Math.max(0.5, l - change).toFixed(1)));

  return { newWinnerLevels, newLoserLevels };
};

export const isValidSet = (score1: number, score2: number): boolean => {
  if (score1 === 6 && score2 <= 4) return true;
  if (score2 === 6 && score1 <= 4) return true;
  if (score1 === 7 && score2 === 5) return true;
  if (score2 === 7 && score1 === 5) return true;
  if (score1 === 7 && score2 === 6) return true;
  if (score2 === 7 && score1 === 6) return true;
  return false;
};

export const getMatchWinner = (sets: { team1: number; team2: number }[]): 'team1' | 'team2' | null => {
  let team1Sets = 0;
  let team2Sets = 0;

  for (const set of sets) {
    if (!isValidSet(set.team1, set.team2)) return null;
    if (set.team1 > set.team2) team1Sets++;
    else team2Sets++;
  }

  if (team1Sets >= 2) return 'team1';
  if (team2Sets >= 2) return 'team2';
  return null;
};