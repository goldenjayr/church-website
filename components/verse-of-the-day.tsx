"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { IVerse } from "@/lib/types"

interface IProps {
  verse: IVerse
}

export function VerseOfTheDay(props: IProps) {
  const { verse } = props

  if (!verse) {
    return (
      <section className="py-16 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-6 mx-auto w-48"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-6">Verse of the Day</h2>

              <blockquote className="text-lg md:text-xl text-slate-700 italic mb-4 leading-relaxed">
                "{verse.text}"
              </blockquote>

              <cite className="text-blue-600 font-semibold text-lg">— {verse.reference}</cite>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
