import styles from "./QuantityStepper.module.css";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export default function QuantityStepper({
  value,
  min = 0,
  max = 10,
  onChange,
}: QuantityStepperProps) {
  function handleDecrease() {
    onChange(Math.max(min, value - 1));
  }
  function handleIncrease() {
    onChange(Math.min(max, value + 1));
  }

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.button}
        disabled={value <= min}
        onClick={handleDecrease}
      >
        −
      </button>

      <span className={styles.value}>{value}</span>

      <button
        type="button"
        className={styles.button}
        disabled={value >= max}
        onClick={handleIncrease}
      >
        +
      </button>
    </div>
  );
}
