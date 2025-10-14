import { type FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Tool } from '@/types/tools';

interface ToolFeaturesProps {
  tool: Tool;
}

export const ToolFeatures: FC<ToolFeaturesProps> = ({ tool }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tool.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};