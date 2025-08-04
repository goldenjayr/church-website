
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, ArrowLeft, Save, Image as ImageIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { getCurrentUser } from "@/lib/auth-actions"
import type { User } from "@prisma/client"
import { createEvent, updateEvent, getEventById } from "@/lib/event-actions"
import { AdminPageLayout } from "@/components/admin/admin-layout"
import { toast } from "sonner"

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  date: z.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  location: z.string().min(3, "Location is required"),
  image: z.string().url().optional().or(z.literal('')),
  maxAttendees: z.coerce.number().int().positive().optional(),
  published: z.boolean(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const isNew = id === "new"

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors, isValid } } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      time: "10:00",
      location: "",
      image: "",
      maxAttendees: undefined,
      published: true,
    },
  })

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser && currentUser.role === "ADMIN") {
        if (!isNew) {
          const event = await getEventById(id)
          if (event) {
            reset({
              ...event,
              date: new Date(event.date),
            })
          }
        }
      } else {
        router.push("/admin")
      }
      setLoading(false)
    }

    loadData()
  }, [id, isNew, reset, router])

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true)
    const authorId = user?.id
    if (!authorId) {
      toast.error("You must be logged in to perform this action.")
      setIsSubmitting(false)
      return
    }

    const payload = { ...data, authorId }

    try {
      let result
      if (isNew) {
        result = await createEvent(payload)
        if (result.success) {
          toast.success("Event created successfully!")
          router.push("/admin/events")
        } else {
          toast.error(result.error || "Failed to create event")
        }
      } else {
        result = await updateEvent(id, payload)
        if (result.success) {
          toast.success("Event updated successfully!")
          router.push("/admin/events")
        } else {
          toast.error(result.error || "Failed to update event")
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminPageLayout user={user!} onLogout={() => setUser(null)}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 ml-2">
              {isNew ? "Create New Event" : "Edit Event"}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
                  <Input id="title" {...register("title")} placeholder="e.g., Annual Church Picnic" />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea id="description" {...register("description")} placeholder="Provide details about the event..." rows={5} />
                  {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Date <span className="text-red-500">*</span></Label>
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input id="time" {...register("time")} placeholder="HH:MM" className="pl-10" />
                    </div>
                    {errors.time && <p className="text-sm text-red-500">{errors.time.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                  <Input id="location" {...register("location")} placeholder="e.g., Central Park" />
                  {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input id="image" {...register("image")} placeholder="https://example.com/image.jpg" className="pl-10" />
                  </div>
                  {errors.image && <p className="text-sm text-red-500">{errors.image.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                  <Input id="maxAttendees" type="number" {...register("maxAttendees")} placeholder="e.g., 100" />
                  {errors.maxAttendees && <p className="text-sm text-red-500">{errors.maxAttendees.message}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="published"
                    control={control}
                    render={({ field }) => (
                      <Checkbox id="published" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="published" className="font-normal">Published</Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting} className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isNew ? "Create Event" : "Save Changes"}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </AdminPageLayout>
  )
}
