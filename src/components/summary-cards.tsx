import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type Summary = {
  total: number;
  up: number;
  down: number;
  degraded: number;
};

export function SummaryCards({
  summary,
  lastUpdated,
}: {
  summary: Summary;
  lastUpdated: string;
}) {
  const cards = [
    {
      title: "Total Gates",
      value: summary.total,
      icon: Activity,
      color: "text-blue-400",
    },
    {
      title: "Online",
      value: summary.up,
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      title: "Down",
      value: summary.down,
      icon: XCircle,
      color: "text-red-400",
    },
    {
      title: "Degraded",
      value: summary.degraded,
      icon: AlertTriangle,
      color: "text-amber-400",
    },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Last updated: {new Date(lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
