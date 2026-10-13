import { useCallback, useState } from "react";

export function usePullToRefresh(refresh) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await refresh();
    } catch (_error) {
      // Keep the currently displayed data on a refresh failure.
    } finally {
      setRefreshing(false);
    }
  }, [refresh, refreshing]);

  return { refreshing, onRefresh };
}
