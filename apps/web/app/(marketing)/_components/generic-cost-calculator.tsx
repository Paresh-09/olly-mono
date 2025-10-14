"use client";
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Slider } from "@repo/ui/components/ui/slider";
import { Label } from "@repo/ui/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

interface Model {
  name: string;
  inputPrice: number;
  outputPrice: number;
  contextLength?: string;
  notes?: string;
}

interface GenericCostCalculatorProps {
  provider: string;
  models: Model[];
  defaultModel?: string;
}

const commentLengthOptions = [150, 300, 500, 1000];

const GenericCostCalculator: React.FC<GenericCostCalculatorProps> = ({
  provider,
  models,
  defaultModel
}) => {
  const [selectedModel, setSelectedModel] = useState(
    models.find((model) => model.name === defaultModel) || models[0]
  );
  const [inputLength, setInputLength] = useState(1000);
  const [commentLength, setCommentLength] = useState(150);
  const [commentsPerDay, setCommentsPerDay] = useState(1);

  const calculateCost = (days: number) => {
    if (!selectedModel) return "0.00";

    const inputTokens = inputLength / 4; // Assuming 1 token ≈ 4 characters
    const commentTokens = commentLength / 4;
    const inputCost = (selectedModel.inputPrice * inputTokens * commentsPerDay * days) / 1000000;
    const outputCost = (selectedModel.outputPrice * commentTokens * commentsPerDay * days) / 1000000;
    const totalCost = inputCost + outputCost;
    return totalCost.toFixed(2);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Your Estimated usage?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Note, these are ballpark estimates. Actual costs may vary based on usage and other factors.
        </p>
        <div className="mb-4">
          <Label htmlFor="model">Model</Label>
          <Select value={selectedModel?.name} onValueChange={(value) => setSelectedModel(models.find((model) => model.name === value) || selectedModel)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.name} value={model.name}>
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    {model.notes && <span className="text-xs text-gray-500">{model.notes}</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedModel?.contextLength && (
            <div className="text-sm text-gray-600 mt-1">
              Context Length: {selectedModel.contextLength}
            </div>
          )}
        </div>
        <div className="mb-4">
          <Label htmlFor="input-length">Input Length (characters)</Label>
          <Slider
            id="input-length"
            min={1000}
            max={10000}
            step={100}
            value={[inputLength]}
            onValueChange={(value) => setInputLength(value[0])}
            className="w-full mt-2"
          />
          <div className="text-center mt-2">{inputLength} characters ≈ {inputLength / 4} tokens</div>
        </div>
        <div className="mb-4">
          <Label htmlFor="comment-length">Comment Length</Label>
          <Select value={commentLength.toString()} onValueChange={(value) => setCommentLength(parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select comment length" />
            </SelectTrigger>
            <SelectContent>
              {commentLengthOptions.map((length) => (
                <SelectItem key={length} value={length.toString()}>
                  {length} characters
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <Label htmlFor="comments-per-day">Comments per Day</Label>
          <Slider
            id="comments-per-day"
            min={1}
            max={100}
            step={1}
            value={[commentsPerDay]}
            onValueChange={(value) => setCommentsPerDay(value[0])}
            className="w-full mt-2"
          />
          <div className="text-center mt-2">{commentsPerDay}</div>
        </div>
        <div className="text-xl font-semibold">Estimated Cost:</div>
        <div className="mt-2">Daily: ${calculateCost(1)}</div>
        <div>Monthly (30 days): ${calculateCost(30)}</div>
        {selectedModel && (
          <div className="mt-4 text-sm text-gray-600">
            <div>Input: ${selectedModel.inputPrice}/1M tokens</div>
            <div>Output: ${selectedModel.outputPrice}/1M tokens</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GenericCostCalculator;