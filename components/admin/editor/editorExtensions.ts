import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { isValidEditorLinkUrl } from '@/lib/utils/url';

/** Block-level image node — selectable and draggable, never treated as a link target. */
export const EditorImage = Image.extend({
  name: 'image',
  inline: false,
  group: 'block',
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) =>
          attributes.alt ? { alt: attributes.alt } : {},
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) =>
          attributes.title ? { title: attributes.title } : {},
      },
    };
  },
}).configure({
  HTMLAttributes: {
    class: 'blog-content-image',
    loading: 'lazy',
  },
});

export function createEditorExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
      listItem: {},
      code: {},
      codeBlock: {},
      blockquote: {},
      horizontalRule: {},
    }),
    EditorImage,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      defaultProtocol: 'https',
      protocols: ['http', 'https', 'mailto', 'tel'],
      validate: (href) => isValidEditorLinkUrl(href),
      HTMLAttributes: {
        class: 'blog-content-link',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    Placeholder.configure({ placeholder }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
    }),
  ];
}

/** Strip empty paragraphs and redundant wrappers from editor HTML output. */
export function cleanEditorHtml(html: string): string {
  return html
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p><br><\/p>/g, '')
    .trim();
}
