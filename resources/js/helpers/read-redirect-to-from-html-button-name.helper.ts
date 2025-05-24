export const readRedirectToFromHTMLButtonName = (
  submitter: HTMLButtonElement
) => {
  const name = submitter.name;
  const redirectMatch = name.match(/^redirect_to:(\/[\w-\/\{\}]+)$/);
  const redirectTo = redirectMatch && redirectMatch[1];
  return redirectTo;
};
