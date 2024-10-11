export const cleanTitle = (title: string): string => {
  let clean = title;

  clean = title
    .toLowerCase()
    .replace("(official music video)", "")
    .replace("(official video)", "")
    .replace("(official)", "")
    .trim();

  return clean;
};
