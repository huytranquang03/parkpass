import { useEffect, useState } from "react";

interface ParkClosingCountdownProps {
  closingHour: number;
}

function getSecondsUntilClosing(closingHour: number) {
  const now = new Date();
  const closingTime = new Date(now);

  closingTime.setHours(closingHour, 0, 0, 0);

  return Math.max(0, Math.ceil((closingTime.getTime() - now.getTime()) / 1000));
}

export default function ParkClosingCountdownHooks({
  closingHour,
}: ParkClosingCountdownProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    getSecondsUntilClosing(closingHour),
  );

  useEffect(() => {
    function updateRemaining() {
      setSecondsRemaining(getSecondsUntilClosing(closingHour));
    }

    updateRemaining();

    const timer = setInterval(updateRemaining, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [closingHour]);

  if (secondsRemaining === 0) {
    return <p>Công viên đã đóng cửa.</p>;
  }

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  return (
    <p role="timer">
      Thời gian còn lại trước khi đóng cửa: {String(hours).padStart(2, "0")}:
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </p>
  );
}
