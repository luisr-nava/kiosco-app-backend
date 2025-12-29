export const resolveThemeColor = (value: string) => {
  if (typeof window === "undefined") {
    return value;
  }

  return value.replace(/var\((--[\w-]+)\)/g, (_, varName) => {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return resolved || `var(${varName})`;
  });
};
