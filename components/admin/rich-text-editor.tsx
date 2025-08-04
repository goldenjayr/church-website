"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import { TextStyle } from "@tiptap/extension-text-style"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  Type,
  Palette,
  Sparkles,
} from "lucide-react"
import { useCallback, useState } from "react"
import "@/styles/blog-content.css"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

// Enhanced color palettes with better organization
const TEXT_COLORS = [
  { name: "Default", value: "#000000", category: "basic" },
  { name: "Gray", value: "#6B7280", category: "basic" },
  { name: "Red", value: "#DC2626", category: "warm" },
  { name: "Orange", value: "#EA580C", category: "warm" },
  { name: "Yellow", value: "#D97706", category: "warm" },
  { name: "Green", value: "#059669", category: "cool" },
  { name: "Blue", value: "#2563EB", category: "cool" },
  { name: "Purple", value: "#7C3AED", category: "cool" },
  { name: "Pink", value: "#DB2777", category: "warm" },
]

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FEF3C7", category: "light" },
  { name: "Green", value: "#D1FAE5", category: "light" },
  { name: "Blue", value: "#DBEAFE", category: "light" },
  { name: "Purple", value: "#E9D5FF", category: "light" },
  { name: "Pink", value: "#FCE7F3", category: "light" },
  { name: "Orange", value: "#FED7AA", category: "light" },
  { name: "Red", value: "#FEE2E2", category: "light" },
  { name: "Gray", value: "#F3F4F6", category: "light" },
]

export function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const [textColorOpen, setTextColorOpen] = useState(false)
  const [highlightColorOpen, setHighlightColorOpen] = useState(false)

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
        class: "focus:outline-none min-h-[200px] p-4 prose prose-slate max-w-none",
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

  const setTextColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run()
    }
  }, [editor])

  const setHighlightColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setHighlight({ color }).run()
    }
  }, [editor])

  const getCurrentTextColor = () => {
    if (!editor) return "#000000"
    const color = editor.getAttributes("textStyle").color
    return color || "#000000"
  }

  const getCurrentHighlightColor = () => {
    if (!editor) return "#00000000"
    const color = editor.getAttributes("highlight").color
    return color || "#00000000"
  }

  if (!editor) {
    return null
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
    variant = "default",
    ...props
  }: {
    onClick?: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title?: string
    variant?: "default" | "color" | "highlight"
    [key: string]: any
  }) => {
    const baseClasses = "h-10 w-10 p-0 transition-all duration-200 rounded-lg"
    const activeClasses = isActive
      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-95"
      : "hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:shadow-md hover:scale-105"

    const colorClasses = variant === "color"
      ? "border-2 border-slate-200 hover:border-slate-300"
      : ""

    const highlightClasses = variant === "highlight"
      ? "border-2 border-slate-200 hover:border-slate-300"
      : ""

    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`${baseClasses} ${activeClasses} ${colorClasses} ${highlightClasses}`}
        {...props}
      >
        {children}
      </Button>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden bg-white">
      {/* Modern Toolbar */}
      <div className="border-b border-slate-200 p-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="flex flex-wrap items-center gap-2">
          {/* History Controls */}
          <div className="flex items-center space-x-1">
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
          </div>

          <Separator orientation="vertical" className="h-8 mx-2" />

          {/* Text Formatting */}
          <div className="flex items-center space-x-1">
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
          </div>

          <Separator orientation="vertical" className="h-8 mx-2" />

          {/* Color Controls */}
          <div className="flex items-center space-x-1">
            {/* Text Color Picker */}
            <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
              <PopoverTrigger asChild>
                <ToolbarButton
                  variant="color"
                  title="Text Color"
                >
                  <div className="relative">
                    <Type className="h-4 w-4" />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: getCurrentTextColor() }}
                    />
                  </div>
                </ToolbarButton>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">Text Color</h3>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: getCurrentTextColor() }}
                      />
                      <span className="text-xs text-slate-500">{getCurrentTextColor()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          setTextColor(color.value)
                          setTextColorOpen(false)
                        }}
                        className={`
                          w-10 h-10 rounded-lg border-2 transition-all duration-200
                          ${getCurrentTextColor() === color.value
                            ? 'border-slate-800 scale-110 shadow-lg ring-2 ring-blue-200'
                            : 'border-slate-200 hover:border-slate-400 hover:scale-105 hover:shadow-md'
                          }
                        `}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>

                  <div className="flex items-center space-x-3 pt-2 border-t border-slate-200">
                    <input
                      type="color"
                      value={getCurrentTextColor()}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer hover:scale-110 transition-transform"
                    />
                    <span className="text-xs text-slate-600">Custom color</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Highlight Color Picker */}
            <Popover open={highlightColorOpen} onOpenChange={setHighlightColorOpen}>
              <PopoverTrigger asChild>
                <ToolbarButton
                  variant="highlight"
                  title="Highlight Color"
                >
                  <div className="relative">
                    <HighlightIcon className="h-4 w-4" />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: getCurrentHighlightColor() }}
                    />
                  </div>
                </ToolbarButton>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">Highlight Color</h3>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: getCurrentHighlightColor() }}
                      />
                      <span className="text-xs text-slate-500">{getCurrentHighlightColor()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          setHighlightColor(color.value)
                          setHighlightColorOpen(false)
                        }}
                        className={`
                          w-10 h-10 rounded-lg border-2 transition-all duration-200
                          ${getCurrentHighlightColor() === color.value
                            ? 'border-slate-800 scale-110 shadow-lg ring-2 ring-blue-200'
                            : 'border-slate-200 hover:border-slate-400 hover:scale-105 hover:shadow-md'
                          }
                        `}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>

                  <div className="flex items-center space-x-3 pt-2 border-t border-slate-200">
                    <input
                      type="color"
                      value={getCurrentHighlightColor()}
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer hover:scale-110 transition-transform"
                    />
                    <span className="text-xs text-slate-600">Custom color</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Separator orientation="vertical" className="h-8 mx-2" />

          {/* Headings */}
          <div className="flex items-center space-x-1">
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
          </div>

          <Separator orientation="vertical" className="h-8 mx-2" />

          {/* Lists */}
          <div className="flex items-center space-x-1">
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
          </div>

          <Separator orientation="vertical" className="h-8 mx-2" />

          {/* Text Alignment */}
          <div className="flex items-center space-x-1">
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
          </div>

          <Separator orientation="vertical" className="h-8 mx-2" />

          {/* Special Formatting */}
          <div className="flex items-center space-x-1">
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
        </div>
      </div>

      {/* Editor Content */}
      <div onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
          e.stopPropagation()
        }
      }}>
        <div
          className="editor-content min-h-[200px] max-h-[400px] overflow-y-auto p-6"
        >
          <EditorContent
            editor={editor}
            placeholder={placeholder}
            className="blog-content"
          />
        </div>
      </div>
    </div>
  )
}