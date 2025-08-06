'use client'
import { motion } from "motion/react"

interface IProps {
  children: React.ReactNode;
}

export function PageWrapper(props: IProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50"
    >
      {props.children}
    </motion.div>
  )
}
