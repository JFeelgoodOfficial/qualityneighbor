import { useState, useEffect } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
}

export function useCountdown(targetDate: Date): CountdownResult {
  const calculateTimeLeft = (): CountdownResult => {
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(calculateTimeLeft());

  useEffect(() => {
    // Displaying d/h/m only — update every minute rather than every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    // Sync immediately when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeLeft(calculateTimeLeft());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [targetDate]);

  return timeLeft;
}
