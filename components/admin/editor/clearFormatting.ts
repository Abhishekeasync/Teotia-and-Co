import type { Editor } from '@tiptap/react';

export function canClearEditorFormatting(editor: Editor): boolean {
  return (
    !editor.state.selection.empty ||
    editor.isActive('bold') ||
    editor.isActive('italic') ||
    editor.isActive('underline') ||
    editor.isActive('strike') ||
    editor.isActive('code') ||
    editor.isActive('link') ||
    editor.isActive('heading') ||
    editor.isActive('blockquote') ||
    editor.isActive('bulletList') ||
    editor.isActive('orderedList') ||
    editor.isActive('codeBlock') ||
    editor.isActive({ textAlign: 'center' }) ||
    editor.isActive({ textAlign: 'right' }) ||
    editor.isActive({ textAlign: 'justify' })
  );
}

/** Remove inline and block formatting from the current selection or cursor position. */
export function clearEditorFormatting(editor: Editor): void {
  if (editor.isActive('link')) {
    editor.chain().focus().extendMarkRange('link').run();
  }

  let safety = 0;
  while (editor.isActive('listItem') && safety < 12) {
    const lifted = editor.chain().focus().liftListItem('listItem').run();
    if (!lifted) break;
    safety += 1;
  }

  if (editor.isActive('blockquote')) {
    editor.chain().focus().lift('blockquote').run();
  }

  if (editor.isActive('codeBlock')) {
    editor.chain().focus().toggleCodeBlock().run();
  }

  editor
    .chain()
    .focus()
    .unsetLink()
    .unsetAllMarks()
    .unsetTextAlign()
    .clearNodes()
    .setParagraph()
    .run();
}
