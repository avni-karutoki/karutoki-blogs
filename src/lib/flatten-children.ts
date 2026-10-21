/**
 * Flattens JSX children into a flat list of renderable nodes.
 *
 * Why this exists: in JSX, writing
 *
 *   {cond && <Empty />}
 *   {items.map(i => <Card />)}
 *
 * produces a NESTED children array — `[false, [card, card]]` — because
 * `items.map()` returns its own array. `Array.isArray(children)` is then
 * `true`, so naive code treats the inner array as a single child and
 * every mapped item ends up rendered inside ONE wrapper (e.g. one grid
 * cell) instead of becoming its own item.
 *
 * This helper walks the tree, drops null/undefined/booleans and returns
 * a flat list so every leaf becomes its own grid/flex item.
 */
export function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = [];

  const walk = (node: React.ReactNode) => {
    if (node === null || node === undefined || typeof node === "boolean") return;
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    out.push(node);
  };

  walk(children);
  return out;
}
