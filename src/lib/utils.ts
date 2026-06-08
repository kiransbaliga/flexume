let _seq = 0

/** Short, collision-resistant id for tree nodes. */
export function uid(prefix = 'n'): string {
  _seq += 1
  return `${prefix}_${Date.now().toString(36)}_${_seq.toString(36)}`
}

/** Join class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** Move the item with `id` up (-1) or down (+1) within an array, in place. */
export function moveById<T extends { id: string }>(
  arr: T[],
  id: string,
  dir: -1 | 1,
): void {
  const i = arr.findIndex((x) => x.id === id)
  if (i < 0) return
  const j = i + dir
  if (j < 0 || j >= arr.length) return
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}
