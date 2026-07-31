/**
 * TipTap Rich Text Editor — production blog content editor.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { EditorImageDialog } from './editor/EditorImageDialog';
import { EditorLinkDialog } from './editor/EditorLinkDialog';
import { EditorToolbar } from './editor/EditorToolbar';
import { cleanEditorHtml, createEditorExtensions } from './editor/editorExtensions';
import './RichTextEditor.css';

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your blog post...',
  minHeight = '400px',
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [replaceImageMode, setReplaceImageMode] = useState(false);
  const [, setSelectionTick] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: createEditorExtensions(placeholder),
    content,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(cleanEditorHtml(currentEditor.getHTML()));
    },
    onSelectionUpdate: () => {
      setSelectionTick((value) => value + 1);
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-body',
        style: `min-height: ${minHeight}`,
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG') {
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = cleanEditorHtml(editor.getHTML());
    const incoming = cleanEditorHtml(content);
    if (incoming !== current && !editor.isFocused) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [content, editor]);

  const getCurrentLinkUrl = useCallback(() => {
    if (!editor) return '';
    const attrs = editor.getAttributes('link');
    return typeof attrs.href === 'string' ? attrs.href : '';
  }, [editor]);

  const handleLinkSubmit = useCallback(
    (url: string) => {
      if (!editor || editor.isActive('image')) return;
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    },
    [editor]
  );

  const handleLinkRemove = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const insertImages = useCallback(
    (urls: string[]) => {
      if (!editor || urls.length === 0) return;

      if (replaceImageMode && editor.isActive('image')) {
        editor.chain().focus().updateAttributes('image', { src: urls[0] }).run();
        setReplaceImageMode(false);
        return;
      }

      const chain = editor.chain().focus();
      urls.forEach((url, index) => {
        chain.setImage({ src: url, alt: '' });
        if (index < urls.length - 1) {
          chain.insertContent('<p></p>');
        }
      });
      chain.run();
    },
    [editor, replaceImageMode]
  );

  const openImageDialog = useCallback((replace = false) => {
    setReplaceImageMode(replace);
    setImageDialogOpen(true);
  }, []);

  if (!editor) {
    return null;
  }

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;
  const charCount = editor.getText().length;

  return (
    <div className="rich-text-editor">
      <EditorToolbar
        editor={editor}
        onLinkClick={() => setLinkDialogOpen(true)}
        onImageClick={() => openImageDialog(false)}
        onReplaceImageClick={() => openImageDialog(true)}
      />

      <EditorContent editor={editor} className="editor-content" />

      <div className="editor-footer">
        <span className="editor-footer-hint">
          Tip: write one line per point, select them, then click • List or 1. List. You can
          also type <kbd>-</kbd> or <kbd>1.</kbd> at the start of a line.
        </span>
        <span className="character-count">
          {wordCount} words · {charCount} characters
        </span>
      </div>

      <EditorLinkDialog
        open={linkDialogOpen}
        initialUrl={getCurrentLinkUrl()}
        onSubmit={handleLinkSubmit}
        onRemove={editor.isActive('link') ? handleLinkRemove : undefined}
        onClose={() => setLinkDialogOpen(false)}
      />

      <EditorImageDialog
        open={imageDialogOpen}
        replaceMode={replaceImageMode}
        onInsert={insertImages}
        onClose={() => {
          setImageDialogOpen(false);
          setReplaceImageMode(false);
        }}
      />
    </div>
  );
}
