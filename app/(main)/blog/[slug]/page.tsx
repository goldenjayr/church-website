"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Tag, ArrowLeft, Share2, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import type { BlogPost } from "@/lib/prisma"

// Extended mock blog posts with full content
const extendedBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Walking in Faith Daily",
    slug: "walking-in-faith-daily",
    content: `
      <h2>Introduction</h2>
      <p>Faith is not just a Sunday experience, but a daily walk with God. In our busy lives, it's easy to compartmentalize our faith, relegating it to church services and special occasions. However, God calls us to live out our faith every single day, in every aspect of our lives.</p>
      
      <h2>What Does Daily Faith Look Like?</h2>
      <p>Walking in faith daily means integrating our relationship with Christ into every moment of our day. It's about:</p>
      <ul>
        <li><strong>Morning Prayer:</strong> Starting each day by surrendering our plans to God and asking for His guidance.</li>
        <li><strong>Scripture Meditation:</strong> Taking time to read and reflect on God's Word, allowing it to shape our thoughts and actions.</li>
        <li><strong>Constant Communication:</strong> Maintaining an ongoing conversation with God throughout the day through prayer.</li>
        <li><strong>Living with Purpose:</strong> Making decisions based on biblical principles rather than worldly wisdom.</li>
      </ul>
      
      <h2>Overcoming Daily Challenges</h2>
      <p>Life presents us with countless challenges that can shake our faith. Whether it's workplace stress, family conflicts, financial pressures, or health concerns, we need to remember that God is with us in every situation.</p>
      
      <blockquote>"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." - Proverbs 3:5-6</blockquote>
      
      <p>This verse reminds us that we don't have to navigate life's challenges alone. When we trust in God's wisdom rather than our own limited understanding, He promises to guide our steps.</p>
      
      <h2>Practical Steps for Daily Faith</h2>
      <ol>
        <li><strong>Create a Morning Routine:</strong> Dedicate the first few minutes of your day to prayer and Bible reading.</li>
        <li><strong>Set Reminders:</strong> Use phone alerts or sticky notes to remind yourself to pray throughout the day.</li>
        <li><strong>Find Faith-Based Community:</strong> Surround yourself with believers who can encourage and support your spiritual journey.</li>
        <li><strong>Practice Gratitude:</strong> End each day by thanking God for His blessings, both big and small.</li>
        <li><strong>Serve Others:</strong> Look for opportunities to show Christ's love through acts of service and kindness.</li>
      </ol>
      
      <h2>The Fruit of Daily Faith</h2>
      <p>When we consistently walk in faith, we begin to see transformation in our lives. We experience greater peace in difficult circumstances, wisdom in decision-making, and joy that transcends our circumstances. Our relationships improve as we learn to love others as Christ loves us.</p>
      
      <p>Remember, walking in faith daily is not about perfection—it's about progress. There will be days when we stumble, but God's grace is sufficient for us. Each new day is an opportunity to draw closer to Him and grow in our faith.</p>
      
      <h2>Conclusion</h2>
      <p>As we commit to walking in faith daily, we discover that God is not distant or disconnected from our everyday lives. He is intimately involved in every detail, ready to guide, comfort, and strengthen us. Let us embrace this daily journey of faith, knowing that each step brings us closer to becoming the people God created us to be.</p>
    `,
    excerpt:
      "Discover how to make faith a daily practice in your life and maintain a strong relationship with Christ throughout the week.",
    published: true,
    featured: true,
    tags: ["faith", "daily-walk", "spiritual-growth", "prayer", "scripture"],
    category: "DEVOTIONAL" as const,
    author: "Pastor John Smith",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10",
  },
  {
    id: "2",
    title: "The Power of Prayer",
    slug: "the-power-of-prayer",
    content: `
      <h2>Understanding Prayer</h2>
      <p>Prayer is our direct line of communication with God. It is through prayer that we find strength, guidance, and peace in our daily lives. Yet many believers struggle with prayer, unsure of how to pray effectively or wondering if God truly hears their prayers.</p>
      
      <h2>Jesus' Teaching on Prayer</h2>
      <p>Jesus taught His disciples how to pray through the Lord's Prayer, giving us a perfect model for our own prayer life:</p>
      
      <blockquote>"Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven. Give us today our daily bread. And forgive us our debts, as we also have forgiven our debtors. And lead us not into temptation, but deliver us from the evil one." - Matthew 6:9-13</blockquote>
      
      <p>This prayer encompasses worship, submission to God's will, provision, forgiveness, and protection—all essential elements of a healthy prayer life.</p>
      
      <h2>Types of Prayer</h2>
      <ul>
        <li><strong>Adoration:</strong> Praising God for who He is</li>
        <li><strong>Confession:</strong> Acknowledging our sins and seeking forgiveness</li>
        <li><strong>Thanksgiving:</strong> Expressing gratitude for God's blessings</li>
        <li><strong>Supplication:</strong> Making requests for ourselves and others</li>
      </ul>
      
      <h2>The Transformative Power</h2>
      <p>Prayer doesn't just change our circumstances—it changes us. Through prayer, we align our hearts with God's heart, find peace in His presence, and receive the strength to face life's challenges.</p>
      
      <p>When we pray consistently, we develop a deeper relationship with God and begin to see His hand at work in our lives in ways we never noticed before.</p>
    `,
    excerpt:
      "Learn about the transformative power of prayer in your spiritual journey and how it can change your life.",
    published: true,
    featured: false,
    tags: ["prayer", "spiritual-discipline", "communication", "jesus", "transformation"],
    category: "DEVOTIONAL" as const,
    author: "Elder Mary Johnson",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08",
  },
  {
    id: "3",
    title: "Serving Others with Love",
    slug: "serving-others-with-love",
    content: `
      <h2>The Heart of Service</h2>
      <p>Jesus taught us that the greatest among us are those who serve. Service is not just an activity we do; it's a reflection of Christ's love living within us. When we serve others, we demonstrate the love of God in tangible ways.</p>
      
      <h2>Jesus as Our Example</h2>
      <p>Jesus, though He was God, came to serve rather than to be served. He washed His disciples' feet, fed the hungry, healed the sick, and ultimately gave His life for us. This is the model of service we are called to follow.</p>
      
      <blockquote>"For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many." - Mark 10:45</blockquote>
      
      <h2>Practical Ways to Serve</h2>
      <p>Service doesn't always require grand gestures. Here are practical ways to serve in our community:</p>
      <ul>
        <li>Volunteer at local food banks or shelters</li>
        <li>Visit elderly members of our congregation</li>
        <li>Help with church maintenance and cleaning</li>
        <li>Mentor young people in our community</li>
        <li>Provide meals for families in need</li>
        <li>Participate in community cleanup projects</li>
      </ul>
      
      <h2>The Joy of Service</h2>
      <p>When we serve others with genuine love, we experience the joy that comes from being used by God to bless others. Service connects us to our community and helps us see the world through God's eyes of compassion.</p>
      
      <p>Remember, every act of service, no matter how small, has the potential to make a significant impact in someone's life and bring glory to God.</p>
    `,
    excerpt:
      "Practical ways to serve your community and demonstrate Christ's love through acts of service and kindness.",
    published: true,
    featured: false,
    tags: ["service", "community", "love", "outreach", "jesus"],
    category: "ARTICLE" as const,
    author: "Sarah Wilson",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
]

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find the post by slug
    const foundPost = extendedBlogPosts.find((p) => p.slug === params.slug)
    setPost(foundPost || null)

    // Get related posts (same category, different post)
    if (foundPost) {
      const related = extendedBlogPosts
        .filter((p) => p.category === foundPost.category && p.id !== foundPost.id)
        .slice(0, 3)
      setRelatedPosts(related)
    }

    setLoading(false)
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Post Not Found</h1>
          <p className="text-slate-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50"
    >
      {/* Header */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Link>
            </Button>

            <div className="flex items-center space-x-3 mb-4">
              <Badge variant="outline">{post.category}</Badge>
              {post.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>5 min read</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Like
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-8">
                <div
                  className="prose prose-lg max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-800 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-ul:text-slate-700 prose-ol:text-slate-700"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-50">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-3">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2">{relatedPost.title}</h3>
                        <p className="text-slate-600 mb-4 line-clamp-3">{relatedPost.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                          <span>{relatedPost.author}</span>
                          <span>{new Date(relatedPost.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/blog/${relatedPost.slug}`}>Read More</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </motion.div>
  )
}
