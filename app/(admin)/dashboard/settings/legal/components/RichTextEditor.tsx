"use client";
import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  AlignLeft,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const toolbarButtonClasses =
  "h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors";
const activeToolbarButtonClasses =
  "h-9 w-9 flex items-center justify-center rounded-md border border-[#76C043] bg-lime-50 text-[#76C043] transition-colors shadow-sm";

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Write something...",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] w-full border border-t-0 border-gray-200 rounded-b-lg p-4 focus:outline-none focus:ring-1 focus:ring-[#76C043] bg-white text-gray-800 leading-relaxed ProseMirror-style",
      },
    },
  });

  // Synchronize external value changes (e.g. language toggle or load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 border border-gray-200 rounded-t-lg bg-gray-50 p-2 sticky top-0 z-10">
        <button
          type="button"
          className={
            editor.isActive("paragraph")
              ? activeToolbarButtonClasses
              : toolbarButtonClasses
          }
          title="Paragraph"
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={
            editor.isActive("heading", { level: 2 })
              ? activeToolbarButtonClasses
              : toolbarButtonClasses
          }
          title="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={
            editor.isActive("heading", { level: 3 })
              ? activeToolbarButtonClasses
              : toolbarButtonClasses
          }
          title="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-200" />

        <button
          type="button"
          className={
            editor.isActive("bold")
              ? activeToolbarButtonClasses
              : toolbarButtonClasses
          }
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={
            editor.isActive("italic")
              ? activeToolbarButtonClasses
              : toolbarButtonClasses
          }
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={
            editor.isActive("underline")
              ? activeToolbarButtonClasses
              : toolbarButtonClasses
          }
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-8 bg-gray-200" />

        <button
          type="button"
          className={
            editor.isActive("link")
              ? activeToolbarButtonClasses
              : toolbarButtonClasses
          }
          title="Add Link"
          onClick={setLink}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            className={toolbarButtonClasses}
            title="Remove Link"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Unlink className="w-4 h-4" />
          </button>
        )}

        <div className="w-px h-8 bg-gray-200" />

        <button
          type="button"
          className={
            editor.isActive("bulletList")
              ? activeToolbarButtonClasses
              : toolbarButtonClasses
          }
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={
            editor.isActive("orderedList")
              ? activeToolbarButtonClasses
              : toolbarButtonClasses
          }
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          outline: none;
        }
        .ProseMirror-style ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin-bottom: 1rem;
        }
        .ProseMirror-style ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin-bottom: 1rem;
        }
        .ProseMirror-style p {
          margin-bottom: 0.75rem;
        }
        .ProseMirror-style h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }
        .ProseMirror-style h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: #111827;
        }
      `}</style>
    </div>
  );
}
