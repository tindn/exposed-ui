export function parseArguments(input: string): string[] {
  const args: string[] = [];
  let value = '',
    quote = '',
    escaped = false,
    started = false;
  for (const character of input) {
    if (escaped) {
      value += character;
      escaped = false;
      started = true;
    } else if (character === '\\' && quote !== "'") {
      escaped = true;
      started = true;
    } else if (quote) {
      if (character === quote) quote = '';
      else value += character;
    } else if (character === '"' || character === "'") {
      quote = character;
      started = true;
    } else if (/\s/.test(character)) {
      if (started) {
        args.push(value);
        value = '';
        started = false;
      }
    } else {
      value += character;
      started = true;
    }
  }
  if (quote || escaped)
    throw new Error(
      'Close the quote or complete the trailing escape in additional arguments.',
    );
  if (started) args.push(value);
  return args;
}
