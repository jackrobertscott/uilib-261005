import type { Args } from './types';

/** Turn playground args into a JSX snippet. */
export function toJsx(component: string, args: Args, childrenArg?: string, defaults: Args = {}) {
  const props: string[] = [];
  for (const [k, v] of Object.entries(args)) {
    if (k === childrenArg || v === undefined || v === '' || v === defaults[k]) continue;
    if (v === true) props.push(k);
    else if (v === false) continue;
    else if (typeof v === 'string') props.push(`${k}="${v}"`);
    else props.push(`${k}={${JSON.stringify(v)}}`);
  }
  const children = childrenArg ? args[childrenArg] : undefined;
  const open = props.length > 2 ? `<${component}\n  ${props.join('\n  ')}\n` : `<${component}${props.length ? ' ' + props.join(' ') : ''}`;
  if (children) return `${open}>${props.length > 2 ? '\n  ' : ''}${children}${props.length > 2 ? '\n' : ''}</${component}>`;
  return `${open}${props.length > 2 ? '' : ' '}/>`;
}
