import styles from "./QuantityStepper.module.css";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  onChange: (value: number) => void;
}

export default function QuantityStepper({
  value,
  min = 0,
  max = 10,
  label,
  onChange,
}: QuantityStepperProps) {
  const quantityLabel = label ? `số vé ${label.toLowerCase()}` : "số lượng";

  function handleDecrease() {
    onChange(Math.max(min, value - 1));
  }
  function handleIncrease() {
    onChange(Math.min(max, value + 1));
  }

  return (
    <div
      className={styles.stepper}
      role="group"
      aria-label={`Chọn ${quantityLabel}`}
    >
      <button
        type="button"
        className={styles.button}
        disabled={value <= min}
        onClick={handleDecrease}
        aria-label={`Giảm ${quantityLabel}`}
      >
        <span aria-hidden="true">−</span>
      </button>

      <span className={styles.value} aria-live="polite">
        {value}
      </span>

      <button
        type="button"
        className={styles.button}
        disabled={value >= max}
        onClick={handleIncrease}
        aria-label={`Tăng ${quantityLabel}`}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
