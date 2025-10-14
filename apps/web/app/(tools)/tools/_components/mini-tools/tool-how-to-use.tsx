import { type FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Tool } from '@/types/tools';

interface HowToUseProps {
  tool: Tool;
}

export const ToolHowToUse: FC<HowToUseProps> = ({ tool }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>How to Use</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal pl-4 space-y-2">
          {tool.howToUse.map((step: string, index: number) => (
            <li key={index} className="pl-2">
              {step}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};