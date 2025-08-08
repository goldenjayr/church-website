'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { motion } from 'motion/react'
import { User } from '@prisma/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  Loader2, 
  Trash2, 
  Home, 
  Briefcase, 
  CalendarIcon, 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  MapPin,
  Church,
  Bell,
  Shield,
  Heart,
  ArrowLeft,
  Upload,
  Check,
  X,
  Sparkles,
  ChevronLeft
} from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { getOptimizedImageUrl } from '@/lib/cloudinary-client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { logout } from '@/lib/auth-actions'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')).nullable(),
  phone: z.string().optional().or(z.literal('')).nullable(),
  address: z.string().optional().or(z.literal('')).nullable(),
  city: z.string().optional().or(z.literal('')).nullable(),
  state: z.string().optional().or(z.literal('')).nullable(),
  country: z.string().optional().or(z.literal('')).nullable(),
  zipCode: z.string().optional().or(z.literal('')).nullable(),
  dateOfBirth: z.date().optional().nullable(),
  occupation: z.string().optional().or(z.literal('')).nullable(),
  church: z.string().optional().or(z.literal('')).nullable(),
  memberSince: z.date().optional().nullable(),
  facebookUrl: z.union([
    z.string().url(),
    z.literal(''),
    z.string().length(0)
  ]).optional().nullable(),
  twitterUrl: z.union([
    z.string().url(),
    z.literal(''),
    z.string().length(0)
  ]).optional().nullable(),
  instagramUrl: z.union([
    z.string().url(),
    z.literal(''),
    z.string().length(0)
  ]).optional().nullable(),
  linkedinUrl: z.union([
    z.string().url(),
    z.literal(''),
    z.string().length(0)
  ]).optional().nullable(),
  website: z.union([
    z.string().url(),
    z.literal(''),
    z.string().length(0)
  ]).optional().nullable(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  profileImage: z.string().optional().nullable(), // base64 string
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [user, setUser] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Date helper states - must be before any conditional returns
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { 
    handleSubmit, 
    control, 
    reset, 
    setValue,
    formState: { isDirty, dirtyFields }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      occupation: '',
      church: '',
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      linkedinUrl: '',
      website: '',
      emailNotifications: true,
      smsNotifications: false,
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          reset({
            ...userData,
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
            memberSince: userData.memberSince ? new Date(userData.memberSince) : undefined
          });
          if (userData.profileImage) {
            setImagePreview(getOptimizedImageUrl(userData.profileImage, { width: 128, height: 128 }));
          }
        }
      } catch (error) {
        toast.error('Failed to load profile.');
        console.error('Fetch profile error:', error);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [reset]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue('profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success('Profile updated successfully!');
        setUser(result.user);
        if (result.user.profileImage) {
            setImagePreview(getOptimizedImageUrl(result.user.profileImage, { width: 128, height: 128 }));
        }
        // Reset the form with the new values to clear dirty state
        reset({
          ...result.user,
          dateOfBirth: result.user.dateOfBirth ? new Date(result.user.dateOfBirth) : undefined,
          memberSince: result.user.memberSince ? new Date(result.user.memberSince) : undefined,
          profileImage: undefined
        });
      } else {
        toast.error(result.error || 'Failed to update profile.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
      console.error(error);
    }
    setIsSubmitting(false);
  };
  
  const handleDeleteImage = async () => {
    try {
      const response = await fetch('/api/profile', { method: 'DELETE' });
      if (response.ok) {
        toast.success('Profile image removed.');
        setImagePreview(null);
        setUser({ ...user, profileImage: null });
      } else {
        toast.error('Failed to remove image.');
      }
    } catch (error) {
        toast.error('An error occurred while deleting the image.');
    }
  };

  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Date constants for dropdowns
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"/>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2 text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0">
                <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <Separator orientation="vertical" className="h-5 sm:h-6 hidden sm:block" />
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                </div>
                <span className="font-bold text-sm sm:text-lg text-slate-800 truncate">Divine Jesus</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <Bell className="w-4 sm:w-5 h-4 sm:h-5 text-slate-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-4 sm:mb-8 border-none shadow-xl bg-gradient-to-r from-blue-600 to-green-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black opacity-10 pointer-events-none"></div>
            <CardContent className="relative p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div {...getRootProps()} className="relative group cursor-pointer">
                  <input {...getInputProps()} />
                  <Avatar className="w-20 sm:w-24 h-20 sm:h-24 border-4 border-white shadow-xl">
                    <AvatarImage src={imagePreview || undefined} />
                    <AvatarFallback className="bg-white text-blue-600 text-xl sm:text-2xl font-bold">
                      {user.name?.[0] || user.email?.[0]?.toUpperCase() || <UserIcon className="w-8 sm:w-10 h-8 sm:h-10" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Camera className="text-white h-6 sm:h-8 w-6 sm:w-8" />
                  </div>
                  {isDragActive && (
                    <div className="absolute inset-0 rounded-full bg-blue-500 bg-opacity-50 flex items-center justify-center">
                      <Upload className="text-white h-8 w-8 animate-bounce" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold">{user.name || 'Welcome!'}</h1>
                  <p className="text-blue-100 mt-1 text-sm sm:text-base">{user.email}</p>
                  <div className="flex justify-center sm:justify-start gap-2 mt-2 sm:mt-3 flex-wrap">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <UserIcon className="w-3 h-3 mr-1" />
                      Member
                    </Badge>
                    {user.memberSince && (
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Since {format(new Date(user.memberSince), 'yyyy')}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="hidden md:flex gap-2">
                  {imagePreview && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Profile Picture?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove your profile picture. You can upload a new one anytime.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteImage} className="bg-red-500 hover:bg-red-600">
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Tabs for organized sections */}
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-[500px]">
              <TabsTrigger value="personal" className="text-xs sm:text-sm">
                <UserIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Personal</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="text-xs sm:text-sm">
                <MapPin className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="social" className="text-xs sm:text-sm">
                <Globe className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                Social
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs sm:text-sm">
                <Bell className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Preferences</span>
                <span className="sm:hidden">Prefs</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Tell us about yourself</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          Full Name
                        </Label>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field, fieldState }) => (
                            <>
                              <Input 
                                id="name" 
                                {...field} 
                                placeholder="John Doe"
                                className={fieldState.error ? 'border-red-500' : ''}
                              />
                              {fieldState.error && (
                                <p className="text-xs text-red-500">{fieldState.error.message}</p>
                              )}
                            </>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occupation" className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-500" />
                          Occupation <span className="text-xs text-slate-400">(optional)</span>
                        </Label>
                        <Controller
                          name="occupation"
                          control={control}
                          render={({ field }) => (
                            <Input 
                              id="occupation" 
                              {...field} 
                              placeholder="Software Engineer (optional)"
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                          Date of Birth
                        </Label>
                        <Controller
                          name="dateOfBirth"
                          control={control}
                          render={({ field }) => (
                            <div className="grid grid-cols-3 gap-2">
                              <Select
                                value={field.value ? format(field.value, 'M') : ''}
                                onValueChange={(month) => {
                                  const currentDate = field.value || new Date();
                                  const newDate = new Date(currentDate);
                                  newDate.setMonth(parseInt(month) - 1);
                                  field.onChange(newDate);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((month, index) => (
                                    <SelectItem key={month} value={String(index + 1)}>
                                      {month}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={field.value ? format(field.value, 'd') : ''}
                                onValueChange={(day) => {
                                  const currentDate = field.value || new Date();
                                  const newDate = new Date(currentDate);
                                  newDate.setDate(parseInt(day));
                                  field.onChange(newDate);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Day" />
                                </SelectTrigger>
                                <SelectContent>
                                  {days.map((day) => (
                                    <SelectItem key={day} value={String(day)}>
                                      {day}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={field.value ? format(field.value, 'yyyy') : ''}
                                onValueChange={(year) => {
                                  const currentDate = field.value || new Date();
                                  const newDate = new Date(currentDate);
                                  newDate.setFullYear(parseInt(year));
                                  field.onChange(newDate);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {years.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="church" className="flex items-center gap-2">
                          <Church className="w-4 h-4 text-slate-500" />
                          Home Church
                        </Label>
                        <Controller
                          name="church"
                          control={control}
                          render={({ field }) => (
                            <Input 
                              id="church" 
                              {...field} 
                              placeholder="Divine Jesus Church"
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-slate-500" />
                        Bio
                      </Label>
                      <Controller
                        name="bio"
                        control={control}
                        render={({ field, fieldState }) => (
                          <>
                            <Textarea 
                              id="bio" 
                              {...field} 
                              placeholder="Share a little about yourself, your faith journey, or what brings you joy..."
                              rows={4}
                              className="resize-none"
                            />
                            <div className="flex justify-between">
                              <p className="text-xs text-slate-500">
                                {field.value?.length || 0}/500 characters
                              </p>
                              {fieldState.error && (
                                <p className="text-xs text-red-500">{fieldState.error.message}</p>
                              )}
                            </div>
                          </>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>How can we reach you?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          Phone Number
                        </Label>
                        <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => (
                            <Input 
                              id="phone" 
                              {...field} 
                              placeholder="+1 (555) 555-5555"
                              type="tel"
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          Email Address
                        </Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={user.email || ''} 
                          disabled 
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium text-sm text-slate-700">Address</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Controller
                          name="address"
                          control={control}
                          render={({ field }) => (
                            <Input 
                              id="address" 
                              {...field} 
                              placeholder="123 Main Street"
                            />
                          )}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                              <Input 
                                id="city" 
                                {...field} 
                                placeholder="New York"
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State / Province</Label>
                          <Controller
                            name="state"
                            control={control}
                            render={({ field }) => (
                              <Input 
                                id="state" 
                                {...field} 
                                placeholder="NY"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                          <Controller
                            name="zipCode"
                            control={control}
                            render={({ field }) => (
                              <Input 
                                id="zipCode" 
                                {...field} 
                                placeholder="10001"
                              />
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Controller
                            name="country"
                            control={control}
                            render={({ field }) => (
                              <Input 
                                id="country" 
                                {...field} 
                                placeholder="United States"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Social Profiles Tab */}
            <TabsContent value="social" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-500" />
                      Social Profiles
                    </CardTitle>
                    <CardDescription>Connect your social media accounts (optional)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-600" />
                        Facebook
                      </Label>
                      <Controller
                        name="facebookUrl"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="facebook"
                            {...field} 
                            placeholder="https://facebook.com/yourprofile (optional)"
                            type="url"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-sky-500" />
                        Twitter / X
                      </Label>
                      <Controller
                        name="twitterUrl"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="twitter"
                            {...field} 
                            placeholder="https://twitter.com/yourhandle (optional)"
                            type="url"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        Instagram
                      </Label>
                      <Controller
                        name="instagramUrl"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="instagram"
                            {...field} 
                            placeholder="https://instagram.com/yourprofile (optional)"
                            type="url"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-blue-700" />
                        LinkedIn
                      </Label>
                      <Controller
                        name="linkedinUrl"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="linkedin"
                            {...field} 
                            placeholder="https://linkedin.com/in/yourprofile (optional)"
                            type="url"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-600" />
                        Personal Website
                      </Label>
                      <Controller
                        name="website"
                        control={control}
                        render={({ field }) => (
                          <Input 
                            id="website"
                            {...field} 
                            placeholder="https://yourwebsite.com (optional)"
                            type="url"
                          />
                        )}
                      />
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <Shield className="w-4 h-4 inline mr-2" />
                        Your social profiles are optional and will only be visible to church administrators.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-500" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose how you want to receive updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Controller
                      name="emailNotifications"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-500" />
                              <Label className="text-base">Email Notifications</Label>
                            </div>
                            <p className="text-sm text-slate-500">
                              Receive church updates, event reminders, and newsletters via email
                            </p>
                          </div>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                      )}
                    />

                    <Controller
                      name="smsNotifications"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-500" />
                              <Label className="text-base">SMS Notifications</Label>
                            </div>
                            <p className="text-sm text-slate-500">
                              Get urgent updates and reminders via text message
                            </p>
                          </div>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                      )}
                    />

                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        <Check className="w-4 h-4 inline mr-2" />
                        You can change these preferences at any time. We respect your privacy and won't spam you.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-center sm:justify-end pt-6 sm:pt-8 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="w-full sm:w-auto"
            >
              <Button 
                type="submit" 
                disabled={!isDirty || isSubmitting} 
                size="lg"
                className={`
                  relative overflow-hidden transition-all duration-300 transform w-full sm:w-auto
                  ${isDirty 
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl sm:hover:scale-105' 
                    : 'bg-gray-300 cursor-not-allowed opacity-60'
                  }
                  text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base
                `}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isDirty ? (
                    <>
                      <Save className="h-4 sm:h-5 w-4 sm:w-5"/>
                      <span>Save Changes</span>
                      <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs hidden sm:inline">
                        {Object.keys(dirtyFields).length}
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 sm:h-5 w-4 sm:w-5"/>
                      <span>No Changes</span>
                    </>
                  )}
                </span>
                {isDirty && !isSubmitting && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "linear",
                      repeatDelay: 1
                    }}
                  />
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </main>
    </div>
  );
}

