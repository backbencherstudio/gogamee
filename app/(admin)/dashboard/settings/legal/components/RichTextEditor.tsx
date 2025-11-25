'use client'
import React, { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, AlignLeft } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const toolbarButtonClasses =
  'h-9 w-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors'

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const focusEditor = () => {
    editorRef.current?.focus()
  }

  const handleCommand = (command: string, value?: string) => {
    focusEditor()
    document.execCommand(command, false, value)
    onChange(editorRef.current?.innerHTML || '')
  }

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || '')
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 border border-gray-200 rounded-t-lg bg-gray-50 p-2">
        <button type="button" className={toolbarButtonClasses} title="Paragraph" onClick={() => handleCommand('formatBlock', 'P')}>
          <AlignLeft className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarButtonClasses} title="Heading 1" onClick={() => handleCommand('formatBlock', 'H2')}>
          <Heading1 className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarButtonClasses} title="Heading 2" onClick={() => handleCommand('formatBlock', 'H3')}>
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-gray-200" />
        <button type="button" className={toolbarButtonClasses} title="Bold" onClick={() => handleCommand('bold')}>
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarButtonClasses} title="Italic" onClick={() => handleCommand('italic')}>
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarButtonClasses} title="Underline" onClick={() => handleCommand('underline')}>
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-8 bg-gray-200" />
        <button type="button" className={toolbarButtonClasses} title="Bullet List" onClick={() => handleCommand('insertUnorderedList')}>
          <List className="w-4 h-4" />
        </button>
        <button type="button" className={toolbarButtonClasses} title="Numbered List" onClick={() => handleCommand('insertOrderedList')}>
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        className="min-h-[300px] w-full border border-t-0 border-gray-200 rounded-b-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#76C043] bg-white text-gray-800 leading-relaxed"
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

