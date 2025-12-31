import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMoodEntry,
  getMoodEntries,
  type MoodEntry,
  saveMoodEntry,
} from "@/app/[locale]/(app)/actions";

const QUERY_KEY = "moodEntries";

/**
 * 複数月のムードエントリをまとめて取得するhook
 * 前月・当月・次月を一度に取得
 */
export function useMultiMonthMoodEntries(year: number, month: number) {
  // 前月・次月の年月を計算
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  // 3ヶ月分のデータを1つのクエリで取得
  const query = useQuery({
    queryKey: [QUERY_KEY, "multi", year, month],
    queryFn: async () => {
      const [currentData, prevData, nextData] = await Promise.all([
        getMoodEntries(year, month),
        getMoodEntries(prevYear, prevMonth),
        getMoodEntries(nextYear, nextMonth),
      ]);

      // 全データをマージ
      const allEntries = [...prevData, ...currentData, ...nextData];
      const uniqueMap = new Map<string, MoodEntry>();
      for (const entry of allEntries) {
        uniqueMap.set(entry.date, entry);
      }
      return Array.from(uniqueMap.values());
    },
    staleTime: 1000 * 60 * 5, // 5分間はfreshのまま
  });

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

/**
 * ムードエントリを保存するmutation
 */
export function useSaveMoodEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, level }: { date: string; level: number }) =>
      saveMoodEntry(date, level),
    onSuccess: (result, { date, level }) => {
      if (!result.success) {
        return;
      }

      // 全てのmultiクエリのキャッシュを更新
      queryClient.setQueriesData<MoodEntry[]>(
        { queryKey: [QUERY_KEY, "multi"] },
        (old) => {
          if (!old) {
            return [{ id: "", date, level }];
          }
          const filtered = old.filter((e) => e.date !== date);
          return [...filtered, { id: "", date, level }];
        },
      );
    },
  });
}

/**
 * ムードエントリを削除するmutation
 */
export function useDeleteMoodEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date: string) => deleteMoodEntry(date),
    onSuccess: (result, date) => {
      if (!result.success) {
        return;
      }

      // 全てのmultiクエリのキャッシュを更新
      queryClient.setQueriesData<MoodEntry[]>(
        { queryKey: [QUERY_KEY, "multi"] },
        (old) => old?.filter((e) => e.date !== date) ?? [],
      );
    },
  });
}
