"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Blockquote from "@tiptap/extension-blockquote"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter as HighlightIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react"
import { useCallback } from "react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'heading-element',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "bullet-list",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "ordered-list",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "list-item",
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-2 rounded-r-lg my-4",
        },
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[200px] p-4",
        spellcheck: "false",
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
          event.stopPropagation()
        }
        return false
      },
    },
  })

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL")
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href
    const url = window.prompt("Enter URL", previousUrl)

    if (url === null) {
      return
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title 
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title?: string
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-9 w-9 p-0 transition-all duration-200 ${
        isActive 
          ? "bg-blue-100 text-blue-700 shadow-sm scale-95" 
          : "hover:bg-white hover:shadow-sm hover:scale-105"
      }`}
    >
      {children}
    </Button>
  )

  return (
    <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 p-3 flex flex-wrap items-center gap-1 bg-gradient-to-r from-slate-50 to-slate-100">
        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Text alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Special formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
          title="Highlight"
        >
          <HighlightIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addLink}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addImage}
          title="Add Image"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
          e.stopPropagation()
        }
      }}>
        <div 
          className="editor-content min-h-[200px] max-h-[400px] overflow-y-auto"
          style={{
            '--h1-size': '1.875rem',
            '--h2-size': '1.5rem', 
            '--h3-size': '1.25rem'
          } as React.CSSProperties}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              .editor-content .ProseMirror h1 {
                font-size: 1.875rem !important;
                font-weight: 700 !important;
                margin-top: 1.5rem !important;
                margin-bottom: 1rem !important;
                color: rgb(15 23 42) !important;
                line-height: 1.2 !important;
              }
              .editor-content .ProseMirror h2 {
                font-size: 1.5rem !important;
                font-weight: 700 !important;
                margin-top: 1.25rem !important;
                margin-bottom: 0.75rem !important;
                color: rgb(15 23 42) !important;
                line-height: 1.3 !important;
              }
              .editor-content .ProseMirror h3 {
                font-size: 1.25rem !important;
                font-weight: 700 !important;
                margin-top: 1rem !important;
                margin-bottom: 0.5rem !important;
                color: rgb(15 23 42) !important;
                line-height: 1.4 !important;
              }
              .editor-content .ProseMirror ul {
                list-style-type: disc !important;
                padding-left: 2rem !important;
                margin-left: 0 !important;
                margin-top: 0.5rem !important;
                margin-bottom: 0.5rem !important;
                list-style-position: outside !important;
                padding-inline-start: 2rem !important;
              }
              .editor-content .ProseMirror ol {
                list-style-type: decimal !important;
                padding-left: 2rem !important;
                margin-left: 0 !important;
                margin-top: 0.5rem !important;
                margin-bottom: 0.5rem !important;
                list-style-position: outside !important;
                padding-inline-start: 2rem !important;
              }
              .editor-content .ProseMirror li {
                margin-bottom: 0.25rem !important;
                padding-left: 0.25rem !important;
                line-height: 1.6 !important;
                display: list-item !important;
              }
              .editor-content .ProseMirror li p {
                margin-bottom: 0.25rem !important;
                margin-top: 0 !important;
              }
              .editor-content .ProseMirror ul ul {
                margin-top: 0.25rem !important;
                margin-bottom: 0.25rem !important;
                list-style-type: circle !important;
              }
              .editor-content .ProseMirror ol ol {
                margin-top: 0.25rem !important;
                margin-bottom: 0.25rem !important;
                list-style-type: lower-alpha !important;
              }
              .editor-content .ProseMirror p {
                margin-bottom: 0.75rem !important;
                line-height: 1.6 !important;
              }
              .editor-content .ProseMirror strong {
                font-weight: 600 !important;
              }
              .editor-content .ProseMirror em {
                font-style: italic !important;
              }
              .editor-content .ProseMirror blockquote {
                border-left: 4px solid rgb(59 130 246) !important;
                padding-left: 1rem !important;
                font-style: italic !important;
                background-color: rgb(239 246 255) !important;
                padding-top: 0.5rem !important;
                padding-bottom: 0.5rem !important;
                border-radius: 0 0.5rem 0.5rem 0 !important;
                margin: 1rem 0 !important;
              }
            `
          }} />
          <EditorContent
            editor={editor}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  )
}