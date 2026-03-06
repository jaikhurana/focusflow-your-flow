import { useState, useEffect, useRef, useCallback } from 'react';
import { useSessions } from '@/hooks/useSessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer as TimerIcon, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { isToday, parseISO } from 'date-fns';

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds

export default function TimerPage() {
  const { sessions, createSession } = useSessions();
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todaySessions = sessions.filter((s) => isToday(parseISO(s.completed_at)));
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      clearTimer();
      createSession.mutateAsync(25).then(() => {
        toast.success('Focus session completed! Great work! 🎉');
      });
    }
    return clearTimer;
  }, [isRunning, timeLeft, clearTimer, createSession]);

  const toggle = () => setIsRunning(!isRunning);
  const reset = () => {
    setIsRunning(false);
    clearTimer();
    setTimeLeft(FOCUS_DURATION);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((FOCUS_DURATION - timeLeft) / FOCUS_DURATION) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <TimerIcon className="h-6 w-6 text-primary" />
          Focus Timer
        </h1>
        <p className="text-sm text-muted-foreground">Stay focused with 25-minute Pomodoro sessions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Timer */}
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center py-12">
            <div className="relative mb-8">
              <svg className="h-56 w-56 -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
                <circle
                  cx="100" cy="100" r="90"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 90}
                  strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold font-mono tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {isRunning ? 'Focusing...' : timeLeft === FOCUS_DURATION ? 'Ready' : 'Paused'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={toggle} size="lg" className="min-w-32">
                {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={reset} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-secondary/50 p-4 text-center">
                  <p className="text-3xl font-bold tabular-nums">{todaySessions.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Sessions</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-4 text-center">
                  <p className="text-3xl font-bold tabular-nums">{todayMinutes}m</p>
                  <p className="text-xs text-muted-foreground mt-1">Focus Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {todaySessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions today. Start your first one!</p>
              ) : (
                <div className="space-y-2">
                  {todaySessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span>{s.duration} min session</span>
                      <span className="ml-auto text-xs text-muted-foreground font-mono">
                        {new Date(s.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
