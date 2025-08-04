"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Type, Highlighter } from "lucide-react"

export function SimpleColorPicker() {
  const [textColorOpen, setTextColorOpen] = useState(false)
  const [highlightColorOpen, setHighlightColorOpen] = useState(false)

  const colors = [
    "#000000", "#DC2626", "#EA580C", "#D97706",
    "#059669", "#2563EB", "#7C3AED", "#DB2777"
  ]

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Simple Color Picker Test</h2>

      {/* Text Color Picker */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Text Color</h3>
        <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span>Text Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Choose Text Color</h4>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      console.log("Text color selected:", color)
                      setTextColorOpen(false)
                    }}
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Highlight Color Picker */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Highlight Color</h3>
        <Popover open={highlightColorOpen} onOpenChange={setHighlightColorOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Highlighter className="h-4 w-4" />
              <span>Highlight Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Choose Highlight Color</h4>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      console.log("Highlight color selected:", color)
                      setHighlightColorOpen(false)
                    }}
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>Text Color Open: {textColorOpen ? "Yes" : "No"}</p>
        <p>Highlight Color Open: {highlightColorOpen ? "Yes" : "No"}</p>
      </div>
    </div>
  )
}