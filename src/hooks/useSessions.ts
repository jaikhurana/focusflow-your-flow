import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PomodoroSession {
  id: string;
  user_id: string;
  duration: number;
  completed_at: string;
  created_at: string;
}

export function useSessions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('completed_at', { ascending: false });
      if (error) throw error;
      return data as PomodoroSession[];
    },
    enabled: !!user,
  });

  const createSession = useMutation({
    mutationFn: async (duration: number) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ user_id: user!.id, duration })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });

  return { sessions: sessionsQuery.data ?? [], isLoading: sessionsQuery.isLoading, createSession };
}
