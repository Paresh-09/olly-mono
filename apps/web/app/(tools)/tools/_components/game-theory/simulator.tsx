'use client'

import React, { useState, useEffect, FC } from 'react'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Label } from '@repo/ui/components/ui/label'
import { Input } from '@repo/ui/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { Slider } from '@repo/ui/components/ui/slider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/components/ui/table'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'

// Game Theory Strategy Types
type StrategyType = 
  | 'alwaysCooperate' 
  | 'alwaysDefect' 
  | 'titForTat' 
  | 'grudger' 
  | 'random' 
  | 'pavlov'
  | 'custom';

// Preset Game Scenarios
type GameScenario = 
  | 'prisonersDilemma' 
  | 'chickenGame' 
  | 'staghunt' 
  | 'battleOfSexes'
  | 'custom';

// Agent definition
interface Agent {
  id: string;
  name: string;
  strategy: StrategyType;
  customStrategy?: string;
  totalScore: number;
  moveHistory: Array<boolean>;
  color: string;
}

// Game Payoff Matrix
interface PayoffMatrix {
  cooperateCooperate: [number, number];
  cooperateDefect: [number, number];
  defectCooperate: [number, number];
  defectDefect: [number, number];
}

// Simulation Results
interface SimulationResult {
  round: number;
  agents: {
    [id: string]: {
      move: boolean;
      roundScore: number;
      totalScore: number;
    }
  };
}

// Saved Simulation
interface SavedSimulation {
  id: string;
  name: string;
  agents: Agent[];
  payoffMatrix: PayoffMatrix;
  iterations: number;
  results: SimulationResult[];
}

// Agent Card Component
interface AgentCardProps {
  agent: Agent;
  onUpdateAgent: (updatedAgent: Agent) => void;
  onRemoveAgent: () => void;
  strategyDescriptions: { [key in StrategyType]: string };
  isActive: boolean;
}

const AgentCard: FC<AgentCardProps> = ({ 
  agent, 
  onUpdateAgent, 
  onRemoveAgent, 
  strategyDescriptions,
  isActive
}) => {
  const colorOptions = [
    "rgb(239, 68, 68)", // Red
    "rgb(59, 130, 246)", // Blue
    "rgb(34, 197, 94)", // Green
    "rgb(168, 85, 247)", // Purple
    "rgb(249, 115, 22)", // Orange
    "rgb(236, 72, 153)", // Pink
    "rgb(20, 184, 166)", // Teal
    "rgb(234, 179, 8)"   // Yellow
  ];

  return (
    <Card className={`transition-all hover:shadow-md ${isActive ? 'border-2 border-blue-500' : ''}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: agent.color }}
            ></div>
            <Label htmlFor={`agent-name-${agent.id}`}>Name</Label>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={onRemoveAgent}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18"></path>
              <path d="M6 6L18 18"></path>
            </svg>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Input
                id={`agent-name-${agent.id}`}
                value={agent.name}
                onChange={(e) => onUpdateAgent({ ...agent, name: e.target.value })}
                placeholder="Agent Name"
              />
            </div>
            <div>
              <Select 
                value={agent.color} 
                onValueChange={(value) => onUpdateAgent({ ...agent, color: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: color }}
                        ></div>
                        <span>
                          {color === "rgb(239, 68, 68)" ? "Red" :
                           color === "rgb(59, 130, 246)" ? "Blue" :
                           color === "rgb(34, 197, 94)" ? "Green" :
                           color === "rgb(168, 85, 247)" ? "Purple" :
                           color === "rgb(249, 115, 22)" ? "Orange" :
                           color === "rgb(236, 72, 153)" ? "Pink" :
                           color === "rgb(20, 184, 166)" ? "Teal" :
                           color === "rgb(234, 179, 8)" ? "Yellow" : "Color"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor={`agent-strategy-${agent.id}`}>Strategy</Label>
            <Select 
              value={agent.strategy} 
              onValueChange={(value: StrategyType) => onUpdateAgent({ ...agent, strategy: value })}
            >
              <SelectTrigger id={`agent-strategy-${agent.id}`}>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alwaysCooperate">Always Cooperate</SelectItem>
                <SelectItem value="alwaysDefect">Always Defect</SelectItem>
                <SelectItem value="titForTat">Tit for Tat</SelectItem>
                <SelectItem value="grudger">Grudger</SelectItem>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="pavlov">Pavlov</SelectItem>
                <SelectItem value="custom">Custom Strategy</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              {strategyDescriptions[agent.strategy]}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Payoff Matrix Component
interface PayoffMatrixEditorProps {
  payoffMatrix: PayoffMatrix;
  onUpdatePayoff: (updatedMatrix: PayoffMatrix) => void;
  scenarioType: GameScenario;
  onUpdateScenario: (scenario: GameScenario) => void;
}

const PayoffMatrixEditor: FC<PayoffMatrixEditorProps> = ({ 
  payoffMatrix, 
  onUpdatePayoff,
  scenarioType,
  onUpdateScenario
}) => {
  // Predefined game scenarios
  const scenarios: Record<GameScenario, PayoffMatrix> = {
    prisonersDilemma: {
      cooperateCooperate: [3, 3],
      cooperateDefect: [0, 5],
      defectCooperate: [5, 0],
      defectDefect: [1, 1]
    },
    chickenGame: {
      cooperateCooperate: [3, 3],
      cooperateDefect: [2, 4],
      defectCooperate: [4, 2],
      defectDefect: [0, 0]
    },
    staghunt: {
      cooperateCooperate: [5, 5],
      cooperateDefect: [0, 3],
      defectCooperate: [3, 0],
      defectDefect: [1, 1]
    },
    battleOfSexes: {
      cooperateCooperate: [2, 1],
      cooperateDefect: [0, 0],
      defectCooperate: [0, 0],
      defectDefect: [1, 2]
    },
    custom: payoffMatrix
  };

  const handleScenarioChange = (type: GameScenario) => {
    if (type !== 'custom') {
      onUpdatePayoff(scenarios[type]);
    }
    onUpdateScenario(type);
  };

  const updatePayoffValue = (
    scenario: keyof PayoffMatrix, 
    playerIndex: 0 | 1, 
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    const newPayoff = { ...payoffMatrix };
    const currentValues = [...newPayoff[scenario]];
    currentValues[playerIndex] = numValue;
    newPayoff[scenario] = currentValues as [number, number];
    onUpdatePayoff(newPayoff);
    
    // If modifying values, switch to custom scenario
    if (scenarioType !== 'custom') {
      onUpdateScenario('custom');
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <Label>Game Type</Label>
          <Select value={scenarioType} onValueChange={(value: GameScenario) => handleScenarioChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select game type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prisonersDilemma">Prisoner's Dilemma</SelectItem>
              <SelectItem value="chickenGame">Chicken Game</SelectItem>
              <SelectItem value="staghunt">Stag Hunt</SelectItem>
              <SelectItem value="battleOfSexes">Battle of Sexes</SelectItem>
              <SelectItem value="custom">Custom Payoffs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Payoff Matrix</Label>
          <div className="border rounded-md mt-2 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Player 1 ↓ Player 2 →</TableHead>
                  <TableHead className="text-center">Cooperate</TableHead>
                  <TableHead className="text-center">Defect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Cooperate</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Input 
                        value={payoffMatrix.cooperateCooperate[0]} 
                        onChange={(e) => updatePayoffValue('cooperateCooperate', 0, e.target.value)}
                        type="number"
                        className="w-16"
                      />
                      <Input 
                        value={payoffMatrix.cooperateCooperate[1]} 
                        onChange={(e) => updatePayoffValue('cooperateCooperate', 1, e.target.value)}
                        type="number"
                        className="w-16"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Input 
                        value={payoffMatrix.cooperateDefect[0]} 
                        onChange={(e) => updatePayoffValue('cooperateDefect', 0, e.target.value)}
                        type="number"
                        className="w-16"
                      />
                      <Input 
                        value={payoffMatrix.cooperateDefect[1]} 
                        onChange={(e) => updatePayoffValue('cooperateDefect', 1, e.target.value)}
                        type="number"
                        className="w-16"
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Defect</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Input 
                        value={payoffMatrix.defectCooperate[0]} 
                        onChange={(e) => updatePayoffValue('defectCooperate', 0, e.target.value)}
                        type="number"
                        className="w-16"
                      />
                      <Input 
                        value={payoffMatrix.defectCooperate[1]} 
                        onChange={(e) => updatePayoffValue('defectCooperate', 1, e.target.value)}
                        type="number"
                        className="w-16"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Input 
                        value={payoffMatrix.defectDefect[0]} 
                        onChange={(e) => updatePayoffValue('defectDefect', 0, e.target.value)}
                        type="number"
                        className="w-16"
                      />
                      <Input 
                        value={payoffMatrix.defectDefect[1]} 
                        onChange={(e) => updatePayoffValue('defectDefect', 1, e.target.value)}
                        type="number"
                        className="w-16"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            <p>Each cell shows the payoff for (Player 1, Player 2)</p>
            <p>Higher numbers are better for the player</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Simulation Results Component
interface SimulationResultsProps {
  agents: Agent[];
  results: SimulationResult[];
  activeRound: number;
  onRoundChange: (round: number) => void;
}

const SimulationResults: FC<SimulationResultsProps> = ({ 
  agents, 
  results, 
  activeRound,
  onRoundChange
}) => {
  if (results.length === 0) {
    return <div className="text-center py-12">No simulation results yet</div>;
  }

  // Prepare data for the score chart
  const prepareScoreChartData = () => {
    return results.map(result => {
      const data: any = {
        round: result.round
      };
      
      agents.forEach(agent => {
        if (result.agents[agent.id]) {
          data[agent.name] = result.agents[agent.id].totalScore;
        }
      });
      
      return data;
    });
  };

  // Prepare data for the cooperation chart (percentage of cooperation per round)
  const prepareCooperationChartData = () => {
    const data = [];
    
    // Group results by rounds of 5
    const groupSize = 5;
    const groupCount = Math.ceil(results.length / groupSize);
    
    for (let i = 0; i < groupCount; i++) {
      const startRound = i * groupSize + 1;
      const endRound = Math.min((i + 1) * groupSize, results.length);
      const groupResults = results.slice(startRound - 1, endRound);
      
      const groupData: any = {
        rounds: `${startRound}-${endRound}`
      };
      
      agents.forEach(agent => {
        let cooperationCount = 0;
        
        groupResults.forEach(result => {
          if (result.agents[agent.id] && result.agents[agent.id].move) {
            cooperationCount++;
          }
        });
        
        const cooperationRate = (cooperationCount / groupResults.length) * 100;
        groupData[agent.name] = cooperationRate;
      });
      
      data.push(groupData);
    }
    
    return data;
  };

  // Prepare final score data
  const prepareFinalScores = () => {
    const data = agents.map(agent => {
      const finalResult = results[results.length - 1]
      return {
        name: agent.name,
        score: finalResult.agents[agent.id]?.totalScore || 0,
        color: agent.color
      };
    }).sort((a, b) => b.score - a.score);
    
    return data;
  };

  // Display details of the selected round
  const roundDetails = results[activeRound - 1];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Round {activeRound} of {results.length}</h3>
        <Slider
          value={[activeRound]}
          min={1}
          max={results.length}
          step={1}
          onValueChange={(value) => onRoundChange(value[0])}
          className="w-full"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Round Details</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-center">Move</TableHead>
                <TableHead className="text-right">Round Score</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map(agent => {
                const agentResult = roundDetails.agents[agent.id];
                return (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: agent.color }}
                        ></div>
                        <span>{agent.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {agentResult?.move ? '✓ Cooperate' : '✗ Defect'}
                    </TableCell>
                    <TableCell className="text-right">
                      {agentResult?.roundScore}
                    </TableCell>
                    <TableCell className="text-right">
                      {agentResult?.totalScore}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Score Evolution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prepareScoreChartData()}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="round" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {agents.map(agent => (
                    <Line
                      key={agent.id}
                      type="monotone"
                      dataKey={agent.name}
                      stroke={agent.color}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Cooperation Rate (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareCooperationChartData()}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rounds" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {agents.map(agent => (
                    <Bar
                      key={agent.id}
                      dataKey={agent.name}
                      fill={agent.color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Final Scores</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareFinalScores()}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="score" 
                  name="Total Score" 
                  fill="#8884d8"
                >
                  {
                    prepareFinalScores().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main component
export const GameTheorySimulator: FC = () => {
  // Strategy descriptions for tooltips
  const strategyDescriptions: { [key in StrategyType]: string } = {
    alwaysCooperate: "Always chooses to cooperate regardless of what the opponent does.",
    alwaysDefect: "Always chooses to defect regardless of what the opponent does.",
    titForTat: "Cooperates on the first move, then copies the opponent's previous move.",
    grudger: "Cooperates until the opponent defects, then always defects thereafter.",
    random: "Randomly chooses to cooperate or defect with equal probability.",
    pavlov: "Cooperates initially. If gets rewarded (CC or DC), repeats last move. If punished (CD or DD), changes move.",
    custom: "Custom strategy defined through rules or code."
  };

  // State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [payoffMatrix, setPayoffMatrix] = useState<PayoffMatrix>({
    cooperateCooperate: [3, 3],
    cooperateDefect: [0, 5],
    defectCooperate: [5, 0],
    defectDefect: [1, 1]
  });
  const [iterations, setIterations] = useState<number>(10);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [activeRound, setActiveRound] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("setup");
  const [scenarioType, setScenarioType] = useState<GameScenario>("prisonersDilemma");
  const [simulationName, setSimulationName] = useState<string>("");

  // Load saved simulations from localStorage
  useEffect(() => {
    const savedSims = localStorage.getItem('savedGameSimulations');
    if (savedSims) {
      try {
        setSavedSimulations(JSON.parse(savedSims));
      } catch (e) {
        console.error('Error loading saved simulations:', e);
      }
    }
  }, []);

  // Save simulations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('savedGameSimulations', JSON.stringify(savedSimulations));
  }, [savedSimulations]);

  // Add a new agent
  const addAgent = () => {
    const colorOptions = [
      "rgb(239, 68, 68)", // Red
      "rgb(59, 130, 246)", // Blue
      "rgb(34, 197, 94)", // Green
      "rgb(168, 85, 247)", // Purple
      "rgb(249, 115, 22)", // Orange
      "rgb(236, 72, 153)", // Pink
      "rgb(20, 184, 166)", // Teal
      "rgb(234, 179, 8)"   // Yellow
    ];
    
    const agentId = `agent-${Date.now()}`;
    const newAgent: Agent = {
      id: agentId,
      name: `Agent ${agents.length + 1}`,
      strategy: 'titForTat',
      totalScore: 0,
      moveHistory: [] as Array<boolean>,
      color: colorOptions[agents.length % colorOptions.length]
    };
    
    setAgents([...agents, newAgent]);
    setActiveAgent(agentId);
  };

  // Update agent properties
  const updateAgent = (updatedAgent: Agent) => {
    setAgents(agents.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ));
  };

  // Remove an agent
  const removeAgent = (agentId: string) => {
    setAgents(agents.filter(agent => agent.id !== agentId));
    if (activeAgent === agentId) {
      setActiveAgent(agents.length > 1 ? agents[0].id : null);
    }
  };

  // Get next move based on strategy
  const getNextMove = (
    agent: Agent, 
    opponentHistory: boolean[], 
    ownHistory: boolean[],
    currentRound: number
  ): boolean => {
    switch (agent.strategy) {
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
  };

  // Calculate score for a round
  const calculateScore = (
    agent1Move: boolean, 
    agent2Move: boolean, 
    payoffs: PayoffMatrix
  ): [number, number] => {
    if (agent1Move && agent2Move) {
      return payoffs.cooperateCooperate;
    } else if (agent1Move && !agent2Move) {
      return payoffs.cooperateDefect;
    } else if (!agent1Move && agent2Move) {
      return payoffs.defectCooperate;
    } else {
      return payoffs.defectDefect;
    }
  };

  // Run the simulation
  const runSimulation = () => {
    if (agents.length < 2) {
      alert("You need at least 2 agents to run a simulation");
      return;
    }

    // Reset scores and history
    const resetAgents = agents.map(agent => ({
      ...agent,
      totalScore: 0,
      moveHistory: [] as Array<boolean>
    }));
    setAgents(resetAgents);
    
    const results: SimulationResult[] = [];
    
    // For each iteration (round)
    for (let round = 0; round < iterations; round++) {
      const roundResult: SimulationResult = {
        round: round + 1,
        agents: {}
      };
      
      // For each pair of agents
      for (let i = 0; i < resetAgents.length; i++) {
        for (let j = i + 1; j < resetAgents.length; j++) {
          const agent1 = resetAgents[i];
          const agent2 = resetAgents[j];
          
          // Get move history for both agents
          const agent1History = agent1.moveHistory.slice();
          const agent2History = agent2.moveHistory.slice();
          
          // Determine next moves
          const agent1Move = getNextMove(agent1, agent2History, agent1History, round);
          const agent2Move = getNextMove(agent2, agent1History, agent2History, round);
          
          // Calculate scores
          const [score1, score2] = calculateScore(agent1Move, agent2Move, payoffMatrix);
          
          // Update agent histories
          agent1.moveHistory.push(agent1Move);
          agent2.moveHistory.push(agent2Move);
          
          // Update agent total scores
          agent1.totalScore += score1;
          agent2.totalScore += score2;
          
          // Record round results
          if (!roundResult.agents[agent1.id]) {
            roundResult.agents[agent1.id] = {
              move: agent1Move,
              roundScore: score1,
              totalScore: agent1.totalScore
            };
          } else {
            roundResult.agents[agent1.id].roundScore += score1;
            roundResult.agents[agent1.id].totalScore = agent1.totalScore;
          }
          
          if (!roundResult.agents[agent2.id]) {
            roundResult.agents[agent2.id] = {
              move: agent2Move,
              roundScore: score2,
              totalScore: agent2.totalScore
            };
          } else {
            roundResult.agents[agent2.id].roundScore += score2;
            roundResult.agents[agent2.id].totalScore = agent2.totalScore;
          }
        }
      }

      results.push(roundResult);
    }

    setSimulationResults(results);
    setActiveRound(1);
    setActiveTab("results");
  };

  // Save current simulation
  const saveSimulation = () => {
    if (simulationResults.length === 0) {
      alert("Run a simulation first before saving");
      return;
    }

    if (!simulationName.trim()) {
      alert("Please enter a name for the simulation");
      return;
    }

    const newSavedSim: SavedSimulation = {
      id: `sim-${Date.now()}`,
      name: simulationName.trim(),
      agents: [...agents],
      payoffMatrix: { ...payoffMatrix },
      iterations,
      results: [...simulationResults]
    };

    setSavedSimulations([...savedSimulations, newSavedSim]);
    setSimulationName("");
  };

  // Load a saved simulation
  const loadSimulation = (simulation: SavedSimulation) => {
    setAgents(simulation.agents);
    setPayoffMatrix(simulation.payoffMatrix);
    setIterations(simulation.iterations);
    setSimulationResults(simulation.results);

    // Determine the scenario type based on payoff matrix
    const scenarioMatrices = {
      prisonersDilemma: {
        cooperateCooperate: [3, 3],
        cooperateDefect: [0, 5],
        defectCooperate: [5, 0],
        defectDefect: [1, 1]
      },
      chickenGame: {
        cooperateCooperate: [3, 3],
        cooperateDefect: [2, 4],
        defectCooperate: [4, 2],
        defectDefect: [0, 0]
      },
      staghunt: {
        cooperateCooperate: [5, 5],
        cooperateDefect: [0, 3],
        defectCooperate: [3, 0],
        defectDefect: [1, 1]
      },
      battleOfSexes: {
        cooperateCooperate: [2, 1],
        cooperateDefect: [0, 0],
        defectCooperate: [0, 0],
        defectDefect: [1, 2]
      }
    };

    let foundScenario: GameScenario = 'custom';
    for (const [scenario, matrix] of Object.entries(scenarioMatrices)) {
      if (
        matrix.cooperateCooperate[0] === simulation.payoffMatrix.cooperateCooperate[0] &&
        matrix.cooperateCooperate[1] === simulation.payoffMatrix.cooperateCooperate[1] &&
        matrix.cooperateDefect[0] === simulation.payoffMatrix.cooperateDefect[0] &&
        matrix.cooperateDefect[1] === simulation.payoffMatrix.cooperateDefect[1] &&
        matrix.defectCooperate[0] === simulation.payoffMatrix.defectCooperate[0] &&
        matrix.defectCooperate[1] === simulation.payoffMatrix.defectCooperate[1] &&
        matrix.defectDefect[0] === simulation.payoffMatrix.defectDefect[0] &&
        matrix.defectDefect[1] === simulation.payoffMatrix.defectDefect[1]
      ) {
        foundScenario = scenario as GameScenario;
        break;
      }
    }

    setScenarioType(foundScenario);
    setActiveRound(1);
    setActiveTab("results");
  };

  // Delete a saved simulation
  const deleteSimulation = (simulationId: string) => {
    setSavedSimulations(savedSimulations.filter(sim => sim.id !== simulationId));
  };

  // Clear the current simulation
  const clearSimulation = () => {
    setSimulationResults([]);
    setActiveTab("setup");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 pb-4">
          <h2 className="text-2xl font-bold mb-4">Game Theory Simulator</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger 
                value="results"
                disabled={simulationResults.length === 0}
              >
                Results
              </TabsTrigger>
              <TabsTrigger value="saved">Saved Simulations</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Agents</h3>
                  <Button onClick={addAgent}>Add Agent</Button>
                </div>
                
                {agents.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      <p>No agents added yet. Click "Add Agent" to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agents.map(agent => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onUpdateAgent={updateAgent}
                        onRemoveAgent={() => removeAgent(agent.id)}
                        strategyDescriptions={strategyDescriptions}
                        isActive={agent.id === activeAgent}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Game Parameters</h3>
                
                <PayoffMatrixEditor 
                  payoffMatrix={payoffMatrix}
                  onUpdatePayoff={setPayoffMatrix}
                  scenarioType={scenarioType}
                  onUpdateScenario={setScenarioType}
                />
                
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label htmlFor="iterations">Number of Rounds</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          id="iterations"
                          value={[iterations]}
                          min={1}
                          max={100}
                          step={1}
                          onValueChange={(value) => setIterations(value[0])}
                          className="flex-1"
                        />
                        <span className="font-medium">{iterations}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="simulation-name">Simulation Name (for saving)</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          id="simulation-name"
                          value={simulationName}
                          onChange={(e) => setSimulationName(e.target.value)}
                          placeholder="Enter a name to save this simulation"
                        />
                        <Button onClick={saveSimulation}>Save</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-center pt-4">
                  <Button 
                    size="lg" 
                    onClick={runSimulation}
                    disabled={agents.length < 2}
                  >
                    Run Simulation
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results">
              {simulationResults.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Simulation Results</h3>
                    <div className="space-x-2">
                      <Button variant="outline" onClick={clearSimulation}>
                        Clear
                      </Button>
                      <Button onClick={() => setActiveTab("setup")}>
                        Back to Setup
                      </Button>
                    </div>
                  </div>
                  
                  <SimulationResults
                    agents={agents}
                    results={simulationResults}
                    activeRound={activeRound}
                    onRoundChange={setActiveRound}
                  />
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <p>No simulation results yet. Go to Setup tab to run a simulation.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="saved">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Saved Simulations</h3>
                
                {savedSimulations.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      <p>No saved simulations yet.</p>
                      <p className="text-sm mt-2">Run a simulation and save it to see it here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {savedSimulations.map(sim => (
                      <Card key={sim.id} className="transition-all hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{sim.name}</h4>
                              <p className="text-sm text-gray-500">
                                {sim.agents.length} agents, {sim.iterations} rounds
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => deleteSimulation(sim.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => loadSimulation(sim)}
                              >
                                Load
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="text-sm font-medium mt-2">Agents:</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {sim.agents.map(agent => (
                                <div 
                                  key={agent.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                                  style={{ 
                                    backgroundColor: `${agent.color}22`,
                                    color: agent.color
                                  }}
                                >
                                  {agent.name} ({agent.strategy})
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameTheorySimulator;