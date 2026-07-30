'use client';

import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import { applyListFormat } from './listCommands';

type ToolbarButtonProps = {
  editor: Editor;
  onLinkClick: () => void;
  onImageClick: () => void;
  onReplaceImageClick: () => void;
};

function ToolbarButton({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? 'is-active' : ''}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  editor,
  onLinkClick,
  onImageClick,
  onReplaceImageClick,
}: ToolbarButtonProps) {
  const canUndo = editor.can().chain().focus().undo().run();
  const canRedo = editor.can().chain().focus().redo().run();
  const imageSelected = editor.isActive('image');
  const textSelected = !imageSelected && !editor.state.selection.empty;

  const openLinkDialog = () => {
    if (imageSelected) return;
    onLinkClick();
  };

  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <ToolbarButton
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
          disabled={!canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↷
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          title="Inline code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          {'</>'}
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          title="Paragraph"
          active={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          ¶
        </ToolbarButton>
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <ToolbarButton
            key={level}
            title={`Heading ${level}`}
            active={editor.isActive('heading', { level })}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          >
            H{level}
          </ToolbarButton>
        ))}
      </div>

      <div className="toolbar-group toolbar-group--lists">
        <ToolbarButton
          title="Bullet list — select lines first, or type - at line start"
          active={editor.isActive('bulletList')}
          onClick={() => applyListFormat(editor, 'bulletList')}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list — select lines first, or type 1. at line start"
          active={editor.isActive('orderedList')}
          onClick={() => applyListFormat(editor, 'orderedList')}
        >
          1. List
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          title="Align left"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          ←
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          ↔
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          →
        </ToolbarButton>
        <ToolbarButton
          title="Justify"
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          ≡
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          title="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo; Quote
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          {'{ }'} Block
        </ToolbarButton>
        <ToolbarButton
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          ─ HR
        </ToolbarButton>
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          title="Insert or edit link"
          active={editor.isActive('link')}
          disabled={imageSelected}
          onClick={openLinkDialog}
        >
          🔗 Link
        </ToolbarButton>
        <ToolbarButton title="Insert image" onClick={onImageClick}>
          🖼 Image
        </ToolbarButton>
        {imageSelected && (
          <>
            <ToolbarButton title="Replace image" onClick={onReplaceImageClick}>
              ↻ Replace
            </ToolbarButton>
            <ToolbarButton
              title="Delete image"
              onClick={() => editor.chain().focus().deleteSelection().run()}
            >
              ✕ Delete
            </ToolbarButton>
          </>
        )}
      </div>

      <div className="toolbar-group">
        <ToolbarButton
          title="Clear formatting"
          disabled={!textSelected && !editor.isActive('link')}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          ✕ Clear
        </ToolbarButton>
      </div>
    </div>
  );
}
