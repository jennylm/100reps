import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function useCurrentDay(): Date {
  const [currentDay, setCurrentDay] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refreshIfDayChanged = () => {
      const now = new Date();
      setCurrentDay((previous) =>
        localDayKey(previous) === localDayKey(now) ? previous : now,
      );
    };

    const scheduleMidnightRefresh = () => {
      if (timer) clearTimeout(timer);
      const now = new Date();
      const nextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
      );
      timer = setTimeout(() => {
        refreshIfDayChanged();
        scheduleMidnightRefresh();
      }, nextDay.getTime() - now.getTime());
    };

    scheduleMidnightRefresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshIfDayChanged();
        scheduleMidnightRefresh();
      }
    });

    return () => {
      if (timer) clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return currentDay;
}
