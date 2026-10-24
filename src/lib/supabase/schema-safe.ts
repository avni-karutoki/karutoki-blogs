/**
 * The production Supabase database may be missing optional columns
 * (e.g. `tags`, `featured`, `gallery_images`) until the migration in
 * `supabase/migrate-add-columns.sql` is run. PostgREST rejects any
 * query mentioning such a column, which previously killed whole pages
 * and every "New writing" save.
 *
 * These helpers degrade gracefully: they retry the query without the
 * missing column(s) and report what was skipped.
 */

const MISSING_COLUMN_MESSAGE = /Could not find the '([^']+)' column of '([^']+)' in the schema cache/i;
const PG_MISSING_COLUMN = /column "?(?:[\w.]+\.)?"?([^".\s,()]+)"? (?:of [^\s]+ )?(?:does not exist|in the schema cache)/i;

function extractMissingColumn(message: string): string | null {
  const a = message.match(MISSING_COLUMN_MESSAGE);
  if (a) return a[1];
  const b = message.match(PG_MISSING_COLUMN);
  if (b) return b[1];
  return null;
}

interface SupabaseLikeError {
  message: string;
}

/**
 * INSERT/UPDATE with automatic retry when an unknown column is in the payload.
 * Returns `missing` — the columns skipped during the save — plus the final
 * error (null on success).
 */
export async function mutateSchemaSafe(
  run: (payload: Record<string, unknown>) => PromiseLike<{ error: SupabaseLikeError | null }>,
  payload: Record<string, unknown>,
): Promise<{ error: SupabaseLikeError | null; missing: string[] }> {
  let working: Record<string, unknown> = { ...payload };
  const missing: string[] = [];

  for (let attempt = 0; attempt < 10; attempt++) {
    const { error } = await run(working);
    if (!error) return { error: null, missing };

    const column = extractMissingColumn(error.message);
    if (!column || !(column in working)) {
      // Not a "missing column in our payload" problem — surface it.
      return { error, missing };
    }
    delete working[column];
    missing.push(column);
  }
  return { error: { message: "Gave up removing unknown columns." }, missing };
}

/**
 * SELECT (list) with automatic retry when an unknown column is requested.
 * Pass `filter` to add `.eq(...)`/`.order(...)`/`.limit(...)` conditions.
 */
export async function selectSchemaSafe<T = Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: { from: (table: string) => any },
  table: string,
  columns: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opts: { filter?: (query: any) => any } = {},
): Promise<{ data: T[]; missing: string[]; error: SupabaseLikeError | null }> {
  const wanted = [...columns];
  const missing: string[] = [];

  for (let attempt = 0; attempt < 10; attempt++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = client.from(table).select(wanted.join(", "));
    if (opts.filter) query = opts.filter(query);

    const { data, error } = await query;
    if (!error) return { data: (data as T[]) ?? [], missing, error: null };

    const column = extractMissingColumn(error.message);
    if (!column) return { data: [], missing, error };
    const idx = wanted.indexOf(column);
    if (idx >= 0) wanted.splice(idx, 1);
    missing.push(column);
  }
  return { data: [], missing, error: { message: "Gave up removing unknown columns." } };
}

/** Same as selectSchemaSafe, but for a single row. */
export async function selectSchemaSafeOne<T = Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: { from: (table: string) => any },
  table: string,
  columns: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opts: { filter?: (query: any) => any } = {},
): Promise<{ data: T | null; missing: string[]; error: SupabaseLikeError | null }> {
  const result = await selectSchemaSafe<T>(client, table, columns, opts);
  return { ...result, data: (result.data as T[])[0] ?? null };
}
