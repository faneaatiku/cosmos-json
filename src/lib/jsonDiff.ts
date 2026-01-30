import { create } from "jsondiffpatch";
import type { Delta } from "jsondiffpatch";
import { format } from "jsondiffpatch/formatters/html";

const diffpatcher = create({
  objectHash: (obj: object, index?: number) => {
    const o = obj as Record<string, unknown>;
    if (typeof o._id === "string") return o._id;
    if (typeof o.id === "string") return o.id;
    return String(index);
  },
  arrays: {
    detectMove: true,
    includeValueOnMove: false,
  },
});

export function computeDiff(left: unknown, right: unknown) {
  return diffpatcher.diff(left, right);
}

export function formatDiffHtml(left: unknown, delta: Delta): string {
  return format(delta, left) ?? "";
}
