export * from './metamask';
export * from './snap';
export * from './theme';
export * from './localStorage';
export * from './button';

export function shortenAddress (
  address: string,
  chars = 4
): string {
  return `${address.slice(0, chars)}...${address.slice(
    -chars
  )}`
}
