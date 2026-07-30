import type { Editor } from '@tiptap/react';

export type ListKind = 'bulletList' | 'orderedList';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Collect one text line per selected block (paragraph, heading, or list item). */
function getSelectedLineTexts(editor: Editor): string[] {
  const { state } = editor;
  const { from, to, empty } = state.selection;

  if (empty) return [];

  const lines: string[] = [];
  const seenPositions = new Set<number>();

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'listItem') {
      if (seenPositions.has(pos)) return;
      seenPositions.add(pos);
      const text = node.textContent.trim();
      if (text) lines.push(text);
      return;
    }

    if (node.isTextblock && node.type.name !== 'listItem') {
      if (seenPositions.has(pos)) return;
      seenPositions.add(pos);
      const text = node.textContent.trim();
      if (text) lines.push(text);
    }
  });

  if (lines.length > 0) return lines;

  const raw = state.doc.textBetween(from, to, '\n', '\n');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Expand selection to cover whole blocks so list replacement is clean. */
function getBlockReplaceRange(editor: Editor): { from: number; to: number } {
  const { state } = editor;
  const { from, to } = state.selection;
  const $from = state.doc.resolve(from);
  const $to = state.doc.resolve(to);

  if ($from.sameParent($to) && $from.parent.isTextblock) {
    return { from: $from.start(), to: $to.end() };
  }

  return {
    from: $from.before(Math.max($from.depth, 1)),
    to: $to.after(Math.max($to.depth, 1)),
  };
}

function buildListHtml(kind: ListKind, items: string[]): string {
  const tag = kind === 'bulletList' ? 'ul' : 'ol';
  const listItems = items
    .map((item) => `<li><p>${escapeHtml(item)}</p></li>`)
    .join('');
  return `<${tag}>${listItems}</${tag}>`;
}

/**
 * Apply bullet or numbered list formatting.
 * - Select multiple lines → converts each line into a list item
 * - Switch between • and 1. by clicking the other list button
 * - Click the active list button again (no selection) to remove list formatting
 */
export function applyListFormat(editor: Editor, kind: ListKind): void {
  const lines = getSelectedLineTexts(editor);
  const hasBlockSelection = lines.length >= 1 && !editor.state.selection.empty;

  if (hasBlockSelection) {
    const range = getBlockReplaceRange(editor);
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertContent(buildListHtml(kind, lines))
      .run();
    return;
  }

  const otherKind: ListKind =
    kind === 'bulletList' ? 'orderedList' : 'bulletList';

  if (editor.isActive(otherKind)) {
    editor.chain().focus().toggleList(kind, 'listItem').run();
    return;
  }

  editor.chain().focus().toggleList(kind, 'listItem').run();
}
