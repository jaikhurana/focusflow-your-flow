import { useTasks } from '@/hooks/useTasks';
import { useSessions } from '@/hooks/useSessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Target, Flame, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isToday, isFuture, startOfWeek, endOfWeek, isWithinInterval, subDays, parseISO } from 'date-fns';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const priorityColor: Record<string, string> = {
  high: 'bg-destructive/15 text-destructive border-destructive/20',
  medium: 'bg-warning/15 text-warning border-warning/20',
  low: 'bg-success/15 text-success border-success/20',
};

export default function Dashboard() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { sessions, isLoading: sessionsLoading } = useSessions();

  const todayTasks = tasks.filter((t) => t.due_date && isToday(parseISO(t.due_date)));
  const upcomingTasks = tasks.filter((t) => t.due_date && isFuture(parseISO(t.due_date)) && !isToday(parseISO(t.due_date)) && !t.completed).slice(0, 5);
  const completedToday = tasks.filter((t) => t.completed_at && isToday(parseISO(t.completed_at))).length;

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekSessions = sessions.filter((s) =>
    isWithinInterval(parseISO(s.completed_at), { start: weekStart, end: weekEnd })
  );
  const todaySessions = sessions.filter((s) => isToday(parseISO(s.completed_at)));
  const todayStudyMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const weekStudyMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);

  // Streak: count consecutive days with at least 1 session
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = subDays(now, i);
    const hasSessions = sessions.some((s) => {
      const d = parseISO(s.completed_at);
      return d.toDateString() === day.toDateString();
    });
    if (hasSessions) streak++;
    else if (i > 0) break;
  }

  const isLoading = tasksLoading || sessionsLoading;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your productivity overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Completed Today', value: completedToday, icon: CheckCircle2, color: 'text-success' },
          { label: 'Study Time Today', value: `${todayStudyMinutes}m`, icon: Clock, color: 'text-primary' },
          { label: 'Weekly Study', value: `${Math.floor(weekStudyMinutes / 60)}h ${weekStudyMinutes % 60}m`, icon: Target, color: 'text-warning' },
          { label: 'Day Streak', value: streak, icon: Flame, color: 'text-destructive' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="border-border/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-lg bg-secondary p-2.5 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{isLoading ? '—' : stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's tasks */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-primary" />
                Today's Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : todayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks due today. Enjoy your free time!</p>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 rounded-md border border-border/30 bg-secondary/30 px-3 py-2">
                      <div className={`h-2 w-2 rounded-full ${task.completed ? 'bg-success' : 'bg-muted-foreground'}`} />
                      <span className={`flex-1 text-sm ${task.completed ? 'text-muted-foreground line-through' : ''}`}>{task.title}</span>
                      <Badge variant="outline" className={`text-xs ${priorityColor[task.priority]}`}>{task.priority}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming deadlines */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-warning" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : upcomingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming deadlines. You're all caught up!</p>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 rounded-md border border-border/30 bg-secondary/30 px-3 py-2">
                      <span className="flex-1 text-sm">{task.title}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {task.due_date ? format(parseISO(task.due_date), 'MMM d') : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
