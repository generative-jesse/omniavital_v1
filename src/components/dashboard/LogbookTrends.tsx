import { useMemo } from "react";
import { Activity, Brain, Zap } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface MoodPoint {
  logged_date: string;
  score: number | null;
  energy: number | null;
}

interface LogbookTrendsProps {
  moodLogs: MoodPoint[];
  activityByDay: Record<string, number>;
  ritualActivityByDay: Record<string, number>;
}

const toKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const dateSequence = (days: number) => {
  const result: Date[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let index = 0; index < days; index += 1) {
    result.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
};

const chartConfig = {
  mood: { label: "Mood", color: "hsl(var(--primary))" },
  energy: { label: "Energy", color: "hsl(var(--accent-foreground))" },
} satisfies ChartConfig;

const LogbookTrends = ({ moodLogs, activityByDay, ritualActivityByDay }: LogbookTrendsProps) => {
  const moodData = useMemo(() => dateSequence(14).map((date) => {
    const key = toKey(date);
    const entries = moodLogs.filter((entry) => entry.logged_date === key);
    const scores = entries.flatMap((entry) => entry.score == null ? [] : [entry.score]);
    const energy = entries.flatMap((entry) => entry.energy == null ? [] : [entry.energy]);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      shortDate: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      mood: scores.length ? Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1)) : null,
      energy: energy.length ? Number((energy.reduce((sum, value) => sum + value, 0) / energy.length).toFixed(1)) : null,
    };
  }), [moodLogs]);

  const heatmapDays = useMemo(() => dateSequence(28).map((date) => {
    const key = toKey(date);
    return { key, date, count: (activityByDay[key] ?? 0) + (ritualActivityByDay[key] ?? 0) };
  }), [activityByDay, ritualActivityByDay]);

  const scoredEntries = moodData.filter((entry) => entry.mood != null || entry.energy != null);
  const latestMood = [...moodLogs].reverse().find((entry) => entry.score != null)?.score;
  const activeDays = heatmapDays.filter((day) => day.count > 0).length;

  return (
    <section aria-labelledby="trends-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 id="trends-heading" className="text-base font-semibold text-foreground">Your trends</h3>
          <p className="mt-1 text-xs text-muted-foreground">A live view of your last four weeks.</p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{activeDays} active days</span>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="min-w-0 rounded-md border border-border bg-card p-4 sm:p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <div><p className="text-sm font-semibold text-foreground">Mood & energy</p><p className="text-xs text-muted-foreground">14-day scored check-ins</p></div>
            </div>
            {latestMood != null && <div className="text-end"><p className="text-lg font-semibold tabular-nums text-foreground">{latestMood}/10</p><p className="text-[10px] uppercase text-muted-foreground">Latest mood</p></div>}
          </div>

          {scoredEntries.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[180px] w-full min-w-0 aspect-auto">
              <LineChart data={moodData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="shortDate" tickLine={false} axisLine={false} interval={1} />
                <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent labelKey="date" />} />
                <Line dataKey="mood" type="monotone" stroke="var(--color-mood)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line dataKey="energy" type="monotone" stroke="var(--color-energy)" strokeWidth={2} strokeDasharray="4 4" dot={false} connectNulls />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[180px] flex-col items-center justify-center text-center">
              <Zap className="mb-3 h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No scored check-ins yet</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">Mood scores logged by your assistant will appear here.</p>
            </div>
          )}
        </div>

        <div className="rounded-md border border-border bg-card p-4 sm:p-5">
          <div className="mb-5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <div><p className="text-sm font-semibold text-foreground">Daily activity</p><p className="text-xs text-muted-foreground">Supplements, meals, mood, and notes</p></div>
          </div>
          <div className="grid grid-cols-7 gap-2" aria-label={`${activeDays} active days in the last 28 days`}>
            {heatmapDays.map(({ key, date, count }) => (
              <div key={key} className="space-y-1 text-center">
                <div title={`${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${count} ${count === 1 ? "entry" : "entries"}`} className={cn("aspect-square w-full rounded-sm border border-border", count === 0 && "bg-secondary/40", count === 1 && "bg-primary/25", count === 2 && "bg-primary/50", count >= 3 && "bg-primary")} />
                {date.getDay() === 1 && <span className="block text-[9px] text-muted-foreground">M</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>4 weeks ago</span>
            <span className="flex items-center gap-1.5">Less <i className="h-2.5 w-2.5 rounded-sm bg-secondary" /><i className="h-2.5 w-2.5 rounded-sm bg-primary/50" /><i className="h-2.5 w-2.5 rounded-sm bg-primary" /> More</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogbookTrends;