import { useEffect } from "react";

type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

export function useKeyboardShortcut(
  key: string,
  handler: KeyboardShortcutHandler,
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === key) {
        handler(event);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, handler]);
}
