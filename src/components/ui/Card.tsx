import type { ComponentProps, ReactNode } from "react";
import styles from "./Card.module.css";

interface ChildrenProps {
  children: ReactNode;
}

function CardRoot({ children }: ChildrenProps) {
  return <article className={styles.card}>{children}</article>;
}

function CardImage({ className = "", alt, ...props }: ComponentProps<"img">) {
  return (
    <img {...props} alt={alt} className={`${styles.image} ${className}`} />
  );
}

function CardBody({ children }: ChildrenProps) {
  return <div className={styles.body}>{children}</div>;
}

function CardFooter({ children }: ChildrenProps) {
  return <footer className={styles.footer}>{children}</footer>;
}

const Card = Object.assign(CardRoot, {
  Image: CardImage,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;
