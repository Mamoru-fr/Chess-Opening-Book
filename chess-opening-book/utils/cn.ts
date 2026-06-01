export function cn(...values: unknown[]) {
  const classNames: string[] = [];

  const append = (value: unknown): void => {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }

    classNames.push(String(value));
  };

  values.forEach(append);

  return classNames.join(" ");
}