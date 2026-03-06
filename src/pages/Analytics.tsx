import { useTasks } from '@/hooks/useTasks';
import { useSessions } from '@/hooks/useSessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, parseISO, startOfDay } from 'date-fns';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Analytics() {
  const { tasks } = useTasks();
  const { sessions } = useSessions();

  const now = new Date();

  // Last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(now, 6 - i);
    const dayStart = startOfDay(day);
    const label = format(day, 'EEE');

    const tasksCompleted = tasks.filter((t) => {
      if (!t.completed_at) return false;
      const d = startOfDay(parseISO(t.completed_at));
      return d.getTime() === dayStart.getTime();
    }).length;

    const studyMinutes = sessions
      .filter((s) => {
        const d = startOfDay(parseISO(s.completed_at));
        return d.getTime() === dayStart.getTime();
      })
      .reduce((sum, s) => sum + s.duration, 0);

    return { day: label, tasks: tasksCompleted, study: studyMinutes };
  });

  const totalTasksCompleted = last7Days.reduce((s, d) => s + d.tasks, 0);
  const totalStudyMinutes = last7Days.reduce((s, d) => s + d.study, 0);
  const avgDailyStudy = Math.round(totalStudyMinutes / 7);

  // Streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = subDays(now, i);
    const hasSessions = sessions.some((s) => parseISO(s.completed_at).toDateString() === day.toDateString());
    if (hasSessions) streak++;
    else if (i > 0) break;
  }

  const chartConfig = {
    tasks: { label: 'Tasks', color: 'hsl(var(--primary))' },
    study: { label: 'Study (min)', color: 'hsl(var(--success))' },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">Your productivity insights for the past week</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Tasks Completed', value: totalTasksCompleted, icon: Target, color: 'text-primary' },
          { label: 'Avg Daily Study', value: `${avgDailyStudy}m`, icon: Clock, color: 'text-success' },
          { label: 'Day Streak', value: streak, icon: TrendingUp, color: 'text-warning' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="border-border/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-lg bg-secondary p-2.5 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tasks Completed This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={last7Days}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="tasks" fill="var(--color-tasks)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Study Time This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={last7Days}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="study" fill="var(--color-study)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
