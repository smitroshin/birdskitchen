export const isTextValid = (text) =>
  text && text.length > 0 && text.replace(/ /g, '').length > 0;
