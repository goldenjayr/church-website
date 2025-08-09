"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, CalendarCheck, Mail, Phone, User, MessageSquare } from "lucide-react"

interface EventRSVPModalProps {
  eventId: string
  eventTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  maxAttendees?: number | null
  currentAttendees?: number
}

export function EventRSVPModal({
  eventId,
  eventTitle,
  open,
  onOpenChange,
  maxAttendees,
  currentAttendees = 0
}: EventRSVPModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })

  const spotsRemaining = maxAttendees ? maxAttendees - currentAttendees : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (spotsRemaining !== null && spotsRemaining <= 0) {
      toast.error("Sorry, this event is fully booked.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/events/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          ...formData
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit RSVP")
      }

      toast.success("Your RSVP has been confirmed! Check your email for details.")
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      })
      
      // Close modal
      onOpenChange(false)
    } catch (error) {
      console.error("RSVP error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit RSVP. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto sm:w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            RSVP for Event
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base mt-2">
            Register your attendance for <span className="font-semibold block sm:inline">{eventTitle}</span>
            {spotsRemaining !== null && (
              <span className="block mt-2 text-xs sm:text-sm">
                {spotsRemaining > 0 ? (
                  <span className="text-green-600 font-medium">
                    {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} remaining
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    This event is fully booked
                  </span>
                )}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm sm:text-base">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              Full Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              disabled={isSubmitting}
              className="text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm sm:text-base">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              disabled={isSubmitting}
              className="text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm sm:text-base">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
              className="text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2 text-sm sm:text-base">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              Additional Message
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any special requirements or questions..."
              rows={3}
              disabled={isSubmitting}
              className="text-sm sm:text-base min-h-[80px] resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (spotsRemaining !== null && spotsRemaining <= 0)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 sm:h-11 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Confirm RSVP"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
