// lib/tools/game-theory-transformer.ts

/**
 * Type definitions for game theory strategies and results
 */

// Available strategies
export type StrategyKey = 
  | 'alwaysCooperate' 
  | 'alwaysDefect' 
  | 'titForTat' 
  | 'grudger' 
  | 'random' 
  | 'pavlov';

// Saved favorite strategy
export interface FavoriteStrategy {
  key: StrategyKey;
  name: string;
  description: string;
}

// Strategy result with metadata
export interface StrategyResult {
  key: StrategyKey;
  name: string;
  description: string;
  characteristics: {
    cooperation: number;  // 0-10 rating of how cooperative the strategy is
    forgiveness: number;  // 0-10 rating of how forgiving the strategy is
    complexity: number;   // 0-10 rating of complexity
  };
}

/**
 * Returns all available strategies with their metadata
 */
export function getAvailableStrategies(): StrategyResult[] {
  return [
    {
      key: 'alwaysCooperate',
      name: 'Always Cooperate',
      description: 'Always chooses to cooperate regardless of what the opponent does.',
      characteristics: {
        cooperation: 10,
        forgiveness: 10,
        complexity: 1
      }
    },
    {
      key: 'alwaysDefect',
      name: 'Always Defect',
      description: 'Always chooses to defect regardless of what the opponent does.',
      characteristics: {
        cooperation: 0,
        forgiveness: 0,
        complexity: 1
      }
    },
    {
      key: 'titForTat',
      name: 'Tit for Tat',
      description: 'Cooperates on the first move, then copies the opponent\'s previous move.',
      characteristics: {
        cooperation: 7,
        forgiveness: 5,
        complexity: 3
      }
    },
    {
      key: 'grudger',
      name: 'Grudger',
      description: 'Cooperates until the opponent defects, then always defects thereafter.',
      characteristics: {
        cooperation: 5,
        forgiveness: 0,
        complexity: 4
      }
    },
    {
      key: 'random',
      name: 'Random',
      description: 'Randomly chooses to cooperate or defect with equal probability.',
      characteristics: {
        cooperation: 5,
        forgiveness: 5,
        complexity: 2
      }
    },
    {
      key: 'pavlov',
      name: 'Pavlov',
      description: 'Cooperates initially. If gets rewarded (CC or DC), repeats last move. If punished (CD or DD), changes move.',
      characteristics: {
        cooperation: 6,
        forgiveness: 7,
        complexity: 7
      }
    }
  ];
}

/**
 * Game theory common scenarios with default payoff matrices
 */
export interface PayoffMatrix {
  cooperateCooperate: [number, number];
  cooperateDefect: [number, number];
  defectCooperate: [number, number];
  defectDefect: [number, number];
}

export type ScenarioKey = 
  | 'prisonersDilemma' 
  | 'chickenGame' 
  | 'staghunt' 
  | 'battleOfSexes';

export interface GameScenario {
  key: ScenarioKey;
  name: string;
  description: string;
  payoffMatrix: PayoffMatrix;
}

export function getGameScenarios(): GameScenario[] {
  return [
    {
      key: 'prisonersDilemma',
      name: 'Prisoner\'s Dilemma',
      description: 'Classic scenario where individual rationality leads to a worse outcome for both players.',
      payoffMatrix: {
        cooperateCooperate: [3, 3],
        cooperateDefect: [0, 5],
        defectCooperate: [5, 0],
        defectDefect: [1, 1]
      }
    },
    {
      key: 'chickenGame',
      name: 'Chicken Game',
      description: 'Two drivers head toward each other on a collision course, with the worst outcome being when both refuse to swerve.',
      payoffMatrix: {
        cooperateCooperate: [3, 3],
        cooperateDefect: [2, 4],
        defectCooperate: [4, 2],
        defectDefect: [0, 0]
      }
    },
    {
      key: 'staghunt',
      name: 'Stag Hunt',
      description: 'Coordination game where cooperating to hunt a stag yields more than hunting rabbits individually.',
      payoffMatrix: {
        cooperateCooperate: [5, 5],
        cooperateDefect: [0, 3],
        defectCooperate: [3, 0],
        defectDefect: [1, 1]
      }
    },
    {
      key: 'battleOfSexes',
      name: 'Battle of Sexes',
      description: 'Coordination game where players prefer to coordinate but have different preferences.',
      payoffMatrix: {
        cooperateCooperate: [2, 1],
        cooperateDefect: [0, 0],
        defectCooperate: [0, 0],
        defectDefect: [1, 2]
      }
    }
  ];
}

/**
 * Strategy implementation functions 
 */
export function executeStrategy(
  strategy: StrategyKey,
  opponentHistory: boolean[],
  ownHistory: boolean[],
  currentRound: number
): boolean {
  switch (strategy) {
    case 'alwaysCooperate':
      return true;
    
    case 'alwaysDefect':
      return false;
    
    case 'titForTat':
      if (currentRound === 0) return true;
      return opponentHistory[currentRound - 1];
    
    case 'grudger':
      return !opponentHistory.includes(false);
    
    case 'random':
      return Math.random() > 0.5;
    
    case 'pavlov':
      if (currentRound === 0) return true;
      
      const previousOwnMove = ownHistory[currentRound - 1];
      const previousOpponentMove = opponentHistory[currentRound - 1];
      
      // If rewarded (CC or DC), repeat last move
      if ((previousOwnMove && previousOpponentMove) || 
          (!previousOwnMove && previousOpponentMove)) {
        return previousOwnMove;
      }
      // If punished (CD or DD), change move
      else {
        return !previousOwnMove;
      }
    
    default:
      return true;
  }
}

/**
 * Calculate game theory outcomes
 */
export function calculateOutcome(
  move1: boolean,
  move2: boolean,
  payoffMatrix: PayoffMatrix
): [number, number] {
  if (move1 && move2) {
    return payoffMatrix.cooperateCooperate;
  } else if (move1 && !move2) {
    return payoffMatrix.cooperateDefect;
  } else if (!move1 && move2) {
    return payoffMatrix.defectCooperate;
  } else {
    return payoffMatrix.defectDefect;
  }
}

/**
 * Analyze strategy performance
 */
export interface StrategyAnalysis {
  cooperationRate: number;
  averageScore: number;
  stabilityScore: number;
  vulnerabilityScore: number;
}

export function analyzeStrategy(
  strategy: StrategyKey,
  opponents: StrategyKey[],
  iterations: number,
  payoffMatrix: PayoffMatrix
): StrategyAnalysis {
  let totalScore = 0;
  let totalCooperations = 0;
  const scores: number[] = [];
  
  // Test against each opponent
  for (const opponent of opponents) {
    let score = 0;
    let cooperations = 0;
    
    const ownHistory: boolean[] = [];
    const opponentHistory: boolean[] = [];
    
    // Run iterations against this opponent
    for (let i = 0; i < iterations; i++) {
      const ownMove = executeStrategy(strategy, opponentHistory, ownHistory, i);
      const opponentMove = executeStrategy(opponent, ownHistory, opponentHistory, i);
      
      if (ownMove) cooperations++;
      
      const [ownScore] = calculateOutcome(ownMove, opponentMove, payoffMatrix);
      score += ownScore;
      
      ownHistory.push(ownMove);
      opponentHistory.push(opponentMove);
    }
    
    scores.push(score);
    totalScore += score;
    totalCooperations += cooperations;
  }
  
  // Calculate statistics
  const totalGames = opponents.length * iterations;
  const cooperationRate = totalCooperations / totalGames;
  const averageScore = totalScore / totalGames;
  
  // Calculate stability (inverse of standard deviation of scores)
  const meanScore = totalScore / opponents.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - meanScore, 2), 0) / opponents.length;
  const stabilityScore = 10 - Math.min(10, Math.sqrt(variance) / meanScore * 10);
  
  // Calculate vulnerability (how well it does against Always Defect)
  const vulnerabilityScore = 10 - analyzeVulnerability(strategy, payoffMatrix);
  
  return {
    cooperationRate,
    averageScore,
    stabilityScore,
    vulnerabilityScore
  };
}

function analyzeVulnerability(strategy: StrategyKey, payoffMatrix: PayoffMatrix): number {
  let totalScore = 0;
  const iterations = 20;
  
  const ownHistory: boolean[] = [];
  const opponentHistory: boolean[] = [];
  
  // Run iterations against Always Defect
  for (let i = 0; i < iterations; i++) {
    const ownMove = executeStrategy(strategy, opponentHistory, ownHistory, i);
    const opponentMove = false; // Always Defect
    
    const [ownScore] = calculateOutcome(ownMove, opponentMove, payoffMatrix);
    totalScore += ownScore;
    
    ownHistory.push(ownMove);
    opponentHistory.push(opponentMove);
  }
  
  // Return vulnerability score (0-10)
  const worstPossibleScore = payoffMatrix.cooperateDefect[0] * iterations;
  const bestPossibleScore = Math.max(
    payoffMatrix.cooperateCooperate[0],
    payoffMatrix.defectDefect[0],
    payoffMatrix.defectCooperate[0]
  ) * iterations;
  
  const range = bestPossibleScore - worstPossibleScore;
  if (range === 0) return 5; // Default mid-value if no range
  
  return ((totalScore - worstPossibleScore) / range) * 10;
}