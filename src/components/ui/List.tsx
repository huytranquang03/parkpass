import type { Key, ReactNode } from "react";

interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  renderEmpty: () => ReactNode;
  getKey: (item: T) => Key;
}

export default function List<T>({
  items,
  renderItem,
  renderEmpty,
  getKey,
}: ListProps<T>) {
  if (items.length === 0) {
    return renderEmpty();
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={getKey(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
