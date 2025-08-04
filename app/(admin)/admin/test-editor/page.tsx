"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { SimpleColorPicker } from "@/components/admin/simple-color-picker"

export default function TestEditorPage() {
  const [content, setContent] = useState(`
    <h1>Test Rich Text Editor</h1>
    <p>This is a <strong>test</strong> of the <em>rich text editor</em> with <span style="color: #DC2626">color features</span> and <mark style="background-color: #FEF3C7">highlighting</mark>.</p>
    <p>You can now:</p>
    <ul>
      <li>Change text colors using the color picker</li>
      <li>Highlight text with different colors</li>
      <li>Use all the formatting options</li>
    </ul>
    <blockquote>This is a beautiful quote with enhanced styling!</blockquote>
  `)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Rich Text Editor Test</h1>
          <p className="text-slate-600 text-lg">Test the new color and highlighting features with modern UI</p>
        </div>

        {/* Simple Color Picker Test */}
        <Card className="border-none shadow-xl bg-white rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Simple Color Picker Test</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <SimpleColorPicker />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
            <CardTitle className="text-slate-800 flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <span>Editor with Enhanced Color Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing with colors and highlighting..."
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-xl bg-white rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-slate-200">
              <CardTitle className="text-slate-800">Generated HTML</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-slate-100 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap break-all">
                  {content}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-slate-200">
              <CardTitle className="text-slate-800">Rendered Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl bg-white rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Features Tested</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Text Color Picker</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">Highlight Color Picker</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-purple-800">Modern UI Design</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-800">Enhanced Typography</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span className="text-sm font-medium text-pink-800">Improved Color Palettes</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm font-medium text-indigo-800">Better Visual Feedback</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}