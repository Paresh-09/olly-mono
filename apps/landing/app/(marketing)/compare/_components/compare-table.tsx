import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Competitor } from "@/data/competitors";
import { Check, X } from "lucide-react";

export function ComparisonTable({ competitor }: { competitor: Competitor }) {
  return (
    <div id="comparison-table" className="space-y-8 scroll-mt-20">
      {competitor.features.map((category) => (
        <div key={category.category}>
          <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Feature</TableHead>
                <TableHead>Olly.social</TableHead>
                <TableHead>{competitor.name}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {category.features.map((feature) => (
                <TableRow key={feature.name}>
                  <TableCell className="font-medium">
                    {feature.name}
                    {feature.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{renderFeatureValue(feature.olly)}</TableCell>
                  <TableCell>{renderFeatureValue(feature.competitor)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

function renderFeatureValue(value: boolean | string | string[]) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="text-green-500" />
    ) : (
      <X className="text-red-500" />
    );
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value;
}