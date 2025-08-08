
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Users, BookOpen, Globe, Target, Eye, MapPin, Clock, Phone, Mail,
  Calendar, Award, Coffee, HandHeart, Sparkles, Church, Music, Baby,
  GraduationCap, Heart as HeartHandshake, Lightbulb, ArrowRight, ChevronRight,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Play, Pause, Volume2,
  CheckCircle, Star, MessageCircle, Share2, ExternalLink, ChevronDown,
  Home, Info, Menu, X, Send
} from "lucide-react";
import { Member } from '@prisma/client'
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const values = [
  {
    icon: Heart,
    title: "Love",
    description: "We believe love is the foundation of our faith and the driving force behind everything we do.",
    color: "from-red-500 to-pink-500"
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We are committed to building authentic relationships and supporting one another in our faith journey.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: BookOpen,
    title: "Truth",
    description: "We hold fast to the truth of God's Word as our guide for life and faith.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Globe,
    title: "Mission",
    description: "We are called to share the gospel and serve our community and the world.",
    color: "from-purple-500 to-indigo-500"
  },
];

const stats = [
  { number: 8, suffix: "+", label: "Years of Ministry", icon: Award },
  { number: 100, suffix: "+", label: "Active Members", icon: Users },
  { number: 15, suffix: "+", label: "Ministry Programs", icon: HandHeart },
  { number: 500, suffix: "+", label: "Lives Touched", icon: Heart },
];

const ministries = [
  { name: "Children's Ministry", icon: Baby, description: "Nurturing faith from the earliest age" },
  { name: "Youth Ministry", icon: GraduationCap, description: "Empowering the next generation" },
  { name: "Worship & Arts", icon: Music, description: "Expressing faith through creativity" },
  { name: "Community Outreach", icon: HandHeart, description: "Serving our neighbors with love" },
];

const timeline = [
  { year: "2016", title: "Church Founded", description: "Started as a home Bible study group" },
  { year: "2017", title: "First Service", description: "Held our first public worship service" },
  { year: "2018", title: "Community Outreach", description: "Launched our first community programs" },
  { year: "2020", title: "Online Ministry", description: "Expanded to digital platforms" },
  { year: "2022", title: "New Building", description: "Moved to our current location" },
  { year: "2024", title: "Growing Strong", description: "Over 100 members and expanding" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Member since 2018",
    content: "Finding this church family has been life-changing. The genuine love and support I've received here has strengthened my faith in ways I never imagined.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Youth Leader",
    content: "The youth ministry here doesn't just teach about faith - they live it out. My kids have found mentors who truly care about their spiritual journey.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "New Member",
    content: "From my first visit, I felt welcomed and accepted. This church truly embodies what it means to be a loving Christian community.",
    rating: 5
  },
];

const faqs = [
  {
    question: "What should I expect on my first visit?",
    answer: "You'll be warmly welcomed by our greeting team! Our services are casual and friendly. Come as you are - there's no dress code. We have parking available and children's programs during service."
  },
  {
    question: "What programs do you offer for children?",
    answer: "We have age-appropriate programs for children from nursery through high school, including Sunday School, youth groups, and special events throughout the year."
  },
  {
    question: "How can I get involved?",
    answer: "We'd love to have you join us! You can start by attending our newcomers' lunch, joining a small group, or volunteering in one of our ministries. Just let us know your interests!"
  },
  {
    question: "Do you have online services?",
    answer: "Yes! We stream our services live every Sunday. You can also find past sermons on our YouTube channel and podcast."
  },
];

interface IProps {
  leadership: Member[]
}

// Animated Counter Component
function Counter({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const timer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / (duration * 1000), 1);
            const currentCount = Math.floor(progress * end);
            setCount(currentCount);
            if (progress === 1) clearInterval(timer);
          }, 50);
        }
      },
      { threshold: 0.1 }
    );

    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={nodeRef}>{count}{suffix}</span>;
}

export function AboutPage(props: IProps) {
  const { leadership } = props
  const [selectedTestimonial, setSelectedTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50"
    >
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">About Us</h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto px-2">
              Learn about our mission, vision, and the people who make Grace Community Church a place of faith, hope,
              and love
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <Target className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-6">Our Mission</h2>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    To glorify God by making disciples of Jesus Christ who love God, love others, and serve the world.
                    We are committed to creating a welcoming community where people can encounter God's love, grow in
                    their faith, and discover their purpose in Christ.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-6">Our Vision</h2>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                    To be a thriving, multi-generational church that transforms lives and communities through the power
                    of the Gospel. We envision a church where every person feels valued, equipped, and empowered to live
                    out their God-given calling and make a positive impact in the world.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">Our Values</h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-2">
              These core values guide everything we do as a church community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                  <CardContent className="p-5 sm:p-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <value.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{value.title}</h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">Our Leadership</h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto px-2">
              Meet the dedicated leaders who guide our church with wisdom, compassion, and faithfulness
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {leadership.map((leader, index) => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-5 sm:p-6 text-center">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
                      <img
                        src={leader.imageUrl || "/placeholder-user.jpg"}
                        alt={`${leader.firstName} ${leader.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">{`${leader.firstName} ${leader.lastName}`}</h3>
                    {/* @ts-ignore */}
                    <p className="text-sm sm:text-base font-semibold mb-2 sm:mb-3" style={{ color: leader.position?.color }}>{leader.position?.name}</p>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{leader.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">
                  <Counter end={stat.number} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm md:text-base text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">Our Journey</h2>
            <p className="text-lg sm:text-xl text-slate-600 px-2">From humble beginnings to a thriving community</p>
          </motion.div>

          {/* Mobile Timeline */}
          <div className="block md:hidden">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative pl-8 pb-8 last:pb-0"
              >
                {/* Line */}
                {index !== timeline.length - 1 && (
                  <div className="absolute left-3 top-6 w-0.5 h-full bg-gradient-to-b from-blue-600 to-green-600" />
                )}
                {/* Dot */}
                <div className="absolute left-0 w-6 h-6 bg-white border-4 border-blue-600 rounded-full" />
                {/* Content */}
                <div className="bg-white rounded-lg shadow-lg p-4 ml-4">
                  <div className="text-xl font-bold text-blue-600 mb-1">{item.year}</div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Timeline */}
          <div className="hidden md:block relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-600 to-green-600" />
            
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "relative flex items-center mb-12",
                  index % 2 === 0 ? "justify-start" : "justify-end"
                )}
              >
                <div className={cn(
                  "w-5/12 p-6 bg-white rounded-lg shadow-lg",
                  index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                )}>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{item.year}</div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-blue-600 rounded-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">What People Say</h2>
            <p className="text-lg sm:text-xl text-slate-600 px-2">Stories from our church family</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex mb-3 sm:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 italic">"{testimonial.content}"</p>
                    <div className="border-t pt-3 sm:pt-4">
                      <p className="text-sm sm:text-base font-semibold text-slate-800">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ministries Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">Our Ministries</h2>
            <p className="text-lg sm:text-xl text-slate-600 px-2">Get involved and make a difference</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {ministries.map((ministry, index) => (
              <motion.div
                key={ministry.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                  <CardContent className="p-5 sm:p-6 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                      <ministry.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">{ministry.name}</h3>
                    <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">{ministry.description}</p>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Learn More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">Frequently Asked Questions</h2>
            <p className="text-lg sm:text-xl text-slate-600 px-2">Everything you need to know about visiting us</p>
          </motion.div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 pr-2 sm:pr-4">{faq.question}</h3>
                      <ChevronDown 
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform flex-shrink-0",
                          expandedFaq === index && "rotate-180"
                        )} 
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Times & Location */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">Join Us This Sunday</h2>
            <p className="text-lg sm:text-xl text-slate-600 px-2">We'd love to worship with you</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Service Times</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-slate-800">Sunday Services</p>
                        <p className="text-sm sm:text-base text-slate-600">9:00 AM - Traditional Service</p>
                        <p className="text-sm sm:text-base text-slate-600">11:00 AM - Contemporary Service</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-slate-800">Wednesday Bible Study</p>
                        <p className="text-sm sm:text-base text-slate-600">7:00 PM - Adult & Youth Groups</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-slate-800">Saturday Prayer</p>
                        <p className="text-sm sm:text-base text-slate-600">6:00 AM - Morning Prayer</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Location & Contact</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-slate-800">Address</p>
                        <p className="text-sm sm:text-base text-slate-600">123 Faith Avenue</p>
                        <p className="text-sm sm:text-base text-slate-600">Grace City, GC 12345</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-slate-800">Phone</p>
                        <p className="text-sm sm:text-base text-slate-600">(555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-slate-800">Email</p>
                        <p className="text-sm sm:text-base text-slate-600">info@gracechurch.org</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4 sm:mt-6 bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                    Get Directions <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Ready to Join Our Family?</h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Whether you're new to faith or looking for a church home, we'd love to welcome you into our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                Plan Your Visit 
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button 
                className="w-full sm:w-auto bg-white/10 backdrop-blur border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3.5 rounded-lg text-base font-semibold transition-all duration-300 flex items-center justify-center"
              >
                Contact Us 
                <Send className="w-5 h-5 ml-2" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
