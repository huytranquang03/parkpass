import { Component } from "react";

interface ParkClosingCountdownProps {
  closingHour: number;
}

interface ParkClosingCountdownState {
  secondsRemaining: number;
}

function getSecondsUntilClosing(closingHour: number) {
  const now = new Date();
  const closingTime = new Date(now);

  closingTime.setHours(closingHour, 0, 0, 0);

  return Math.max(0, Math.ceil((closingTime.getTime() - now.getTime()) / 1000));
}

export default class ParkClosingCountdownClass extends Component<
  ParkClosingCountdownProps,
  ParkClosingCountdownState
> {
  private timerId: number | null = null;

  constructor(props: ParkClosingCountdownProps) {
    super(props);

    this.state = {
      secondsRemaining: getSecondsUntilClosing(props.closingHour),
    };
  }

  componentDidMount() {
    this.startTimer();
  }

  componentDidUpdate(previousProps: ParkClosingCountdownProps) {
    if (previousProps.closingHour !== this.props.closingHour) {
      this.stopTimer();
      this.startTimer();
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  private updateRemaining = () => {
    const secondsRemaining = getSecondsUntilClosing(this.props.closingHour);

    this.setState({
      secondsRemaining,
    });

    if (secondsRemaining === 0) {
      this.stopTimer();
    }
  };

  private startTimer() {
    this.timerId = window.setInterval(this.updateRemaining, 1000);
    this.updateRemaining();
  }

  private stopTimer() {
    if (this.timerId === null) return;

    window.clearInterval(this.timerId);
    this.timerId = null;
  }

  render() {
    const { secondsRemaining } = this.state;

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
}
