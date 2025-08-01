"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, BookOpen, ExternalLink, FileText } from "lucide-react"
import Link from "next/link"

// Enhanced doctrines with detailed content and blog references
const doctrineCategories = [
  {
    name: "Core Beliefs",
    doctrines: [
      {
        id: 1,
        title: "The Trinity",
        content: `
          <p>We believe in one God, eternally existent in three persons: Father, Son, and Holy Spirit. Each person of the Trinity is fully God, yet there is only one God. This fundamental truth shapes our understanding of God's nature and His relationship with humanity.</p>
          
          <h4>Biblical Foundation:</h4>
          <ul>
            <li><strong>Matthew 28:19</strong> - "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit."</li>
            <li><strong>2 Corinthians 13:14</strong> - "May the grace of the Lord Jesus Christ, and the love of God, and the fellowship of the Holy Spirit be with you all."</li>
            <li><strong>John 1:1</strong> - "In the beginning was the Word, and the Word was with God, and the Word was God."</li>
          </ul>
          
          <h4>Understanding the Trinity:</h4>
          <p>The Trinity is not three gods, but one God in three persons. Each person is distinct yet shares the same divine essence. The Father is not the Son, the Son is not the Spirit, and the Spirit is not the Father, yet all three are equally and fully God.</p>
          
          <h4>Practical Implications:</h4>
          <p>Understanding the Trinity helps us in our prayer life, worship, and relationship with God. We pray to the Father, through the Son, in the power of the Holy Spirit. This doctrine assures us that God is both transcendent and immanent, both one and relational.</p>
        `,
        references: ["Genesis 1:26", "Isaiah 48:16", "Matthew 3:16-17", "John 14:16-17", "Acts 5:3-4", "1 Peter 1:2"],
        relatedBlogs: [
          {
            title: "Understanding God's Nature Through Prayer",
            slug: "the-power-of-prayer",
            excerpt: "Explore how the Trinity shapes our prayer life and relationship with God.",
          },
        ],
      },
      {
        id: 2,
        title: "Salvation by Grace",
        content: `
          <p>We believe that salvation is by grace alone, through faith alone, in Christ alone. It is not by works, but by the free gift of God through Jesus Christ. This salvation is available to all who believe and accept Christ as their Lord and Savior.</p>
          
          <h4>Biblical Foundation:</h4>
          <ul>
            <li><strong>Ephesians 2:8-9</strong> - "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast."</li>
            <li><strong>Romans 3:23-24</strong> - "For all have sinned and fall short of the glory of God, and all are justified freely by his grace through the redemption that came by Christ Jesus."</li>
            <li><strong>John 3:16</strong> - "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."</li>
          </ul>
          
          <h4>What Grace Means:</h4>
          <p>Grace is God's unmerited favor toward us. We cannot earn salvation through good deeds, religious rituals, or moral behavior. Salvation is entirely God's work, accomplished through Christ's death and resurrection.</p>
          
          <h4>The Role of Faith:</h4>
          <p>Faith is our response to God's grace. It involves trusting in Christ's finished work on the cross and surrendering our lives to Him as Lord. Faith is not a work we do to earn salvation, but the means by which we receive God's gift.</p>
          
          <h4>Living in Grace:</h4>
          <p>Once saved by grace, we are called to live lives that reflect God's grace to others. Good works are not the cause of our salvation, but the result of it.</p>
        `,
        references: ["Romans 5:1-2", "Romans 6:23", "Titus 3:4-7", "1 John 5:13", "Acts 16:31", "Galatians 2:16"],
        relatedBlogs: [
          {
            title: "Walking in Faith Daily",
            slug: "walking-in-faith-daily",
            excerpt: "Discover how God's grace empowers us to live faithfully each day.",
          },
        ],
      },
      {
        id: 3,
        title: "The Authority of Scripture",
        content: `
          <p>We believe the Bible is the inspired, infallible, and authoritative Word of God. It is our final authority for faith and practice, containing all that is necessary for salvation and Christian living.</p>
          
          <h4>Biblical Foundation:</h4>
          <ul>
            <li><strong>2 Timothy 3:16-17</strong> - "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work."</li>
            <li><strong>2 Peter 1:20-21</strong> - "Above all, you must understand that no prophecy of Scripture came about by the prophet's own interpretation. For prophecy never had its origin in human will, but prophets, though human, spoke from God as they were carried along by the Holy Spirit."</li>
            <li><strong>Hebrews 4:12</strong> - "For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart."</li>
          </ul>
          
          <h4>Divine Inspiration:</h4>
          <p>The Bible was written by human authors under the inspiration of the Holy Spirit. While maintaining their individual writing styles and personalities, these authors were guided by God to record His truth without error.</p>
          
          <h4>Practical Application:</h4>
          <p>As our final authority, Scripture guides our beliefs, moral decisions, and church practices. When faced with life's challenges, we turn to God's Word for wisdom, comfort, and direction.</p>
          
          <h4>Living by Scripture:</h4>
          <p>We are called to not just read the Bible, but to meditate on it, study it, and apply its teachings to our daily lives. The Word of God transforms us as we allow it to shape our thoughts and actions.</p>
        `,
        references: [
          "Psalm 119:105",
          "Isaiah 55:11",
          "Matthew 24:35",
          "John 17:17",
          "1 Peter 1:25",
          "Revelation 22:18-19",
        ],
        relatedBlogs: [
          {
            title: "Walking in Faith Daily",
            slug: "walking-in-faith-daily",
            excerpt: "Learn how daily Scripture reading strengthens our faith walk.",
          },
        ],
      },
    ],
  },
  {
    name: "Prophecy",
    doctrines: [
      {
        id: 4,
        title: "The Second Coming",
        content: `
          <p>We believe in the personal, visible, and glorious return of Jesus Christ to establish His kingdom on earth. This blessed hope motivates us to live holy lives and share the gospel with others.</p>
          
          <h4>Biblical Foundation:</h4>
          <ul>
            <li><strong>Acts 1:11</strong> - "This same Jesus, who has been taken from you into heaven, will come back in the same way you have seen him go into heaven."</li>
            <li><strong>1 Thessalonians 4:16-17</strong> - "For the Lord himself will come down from heaven, with a loud command, with the voice of the archangel and with the trumpet call of God, and the dead in Christ will rise first. After that, we who are still alive and are left will be caught up together with them in the clouds to meet the Lord in the air."</li>
            <li><strong>Revelation 19:11-16</strong> - Description of Christ's return as King of Kings and Lord of Lords.</li>
          </ul>
          
          <h4>Signs of His Coming:</h4>
          <p>Jesus gave us signs to watch for that would indicate His return is near. These include increased natural disasters, wars, persecution of believers, and the spread of the gospel to all nations.</p>
          
          <h4>Our Response:</h4>
          <p>The promise of Christ's return should motivate us to live with urgency in sharing the gospel, purity in our personal lives, and hope in difficult circumstances.</p>
        `,
        references: [
          "Matthew 24:30-31",
          "Mark 13:26-27",
          "Titus 2:13",
          "2 Peter 3:10",
          "Revelation 1:7",
          "Revelation 22:20",
        ],
        relatedBlogs: [],
      },
      {
        id: 5,
        title: "The Sabbath",
        content: `
          <p>We believe the seventh-day Sabbath is a gift from God, a day of rest and worship that reminds us of our Creator and His love for us. It is a time for spiritual renewal and fellowship.</p>
          
          <h4>Biblical Foundation:</h4>
          <ul>
            <li><strong>Genesis 2:2-3</strong> - "By the seventh day God had finished the work he had been doing; so on the seventh day he rested from all his work. Then God blessed the seventh day and made it holy, because on it he rested from all the work of creating that he had done."</li>
            <li><strong>Exodus 20:8-11</strong> - The fourth commandment to remember the Sabbath day and keep it holy.</li>
            <li><strong>Mark 2:27</strong> - "The Sabbath was made for man, not man for the Sabbath."</li>
          </ul>
          
          <h4>Purpose of the Sabbath:</h4>
          <p>The Sabbath serves multiple purposes: it's a memorial of creation, a sign of our relationship with God, a time for physical and spiritual rest, and an opportunity for worship and fellowship.</p>
          
          <h4>Sabbath Observance:</h4>
          <p>We observe the Sabbath from Friday evening to Saturday evening, following the biblical pattern. This includes worship, rest from regular work, spending time in nature, and fellowship with other believers.</p>
        `,
        references: ["Leviticus 23:3", "Isaiah 58:13-14", "Ezekiel 20:12", "Luke 4:16", "Hebrews 4:9-10"],
        relatedBlogs: [],
      },
    ],
  },
  {
    name: "Ordinances",
    doctrines: [
      {
        id: 6,
        title: "Baptism by Immersion",
        content: `
          <p>We believe in baptism by full immersion as a public declaration of faith and identification with Christ in His death and resurrection. It symbolizes the believer's death to sin and new life in Christ.</p>
          
          <h4>Biblical Foundation:</h4>
          <ul>
            <li><strong>Romans 6:3-4</strong> - "Or don't you know that all of us who were baptized into Christ Jesus were baptized into his death? We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead through the glory of the Father, we too may live a new life."</li>
            <li><strong>Matthew 28:19</strong> - The Great Commission includes baptism as part of making disciples.</li>
            <li><strong>Acts 8:36-39</strong> - Philip baptizes the Ethiopian eunuch by immersion.</li>
          </ul>
          
          <h4>Symbolism of Baptism:</h4>
          <p>Baptism by immersion beautifully symbolizes our spiritual experience: going under the water represents dying to our old sinful life, and coming up out of the water represents our resurrection to new life in Christ.</p>
          
          <h4>Prerequisites for Baptism:</h4>
          <p>Baptism should follow personal faith in Jesus Christ, repentance from sin, and a decision to follow Christ as Lord. It is an outward sign of an inward change.</p>
        `,
        references: ["Mark 1:9-11", "Acts 2:38", "Acts 16:33", "Colossians 2:12", "1 Peter 3:21"],
        relatedBlogs: [],
      },
      {
        id: 7,
        title: "Communion",
        content: `
          <p>We believe in the Lord's Supper as a memorial of Christ's sacrifice and a symbol of our unity in Him. It reminds us of His broken body and shed blood for our salvation.</p>
          
          <h4>Biblical Foundation:</h4>
          <ul>
            <li><strong>1 Corinthians 11:23-26</strong> - Paul's account of the Last Supper and instructions for communion.</li>
            <li><strong>Matthew 26:26-28</strong> - Jesus institutes communion with His disciples.</li>
            <li><strong>Luke 22:19-20</strong> - "Do this in remembrance of me."</li>
          </ul>
          
          <h4>Meaning of Communion:</h4>
          <p>The bread represents Christ's body broken for us, and the wine (or grape juice) represents His blood shed for the forgiveness of our sins. It's a time of remembrance, reflection, and recommitment.</p>
          
          <h4>Preparation for Communion:</h4>
          <p>Before partaking, we should examine our hearts, confess any known sin, and ensure we are in right relationship with God and others. Communion is a sacred ordinance that should be approached with reverence.</p>
        `,
        references: ["1 Corinthians 10:16-17", "1 Corinthians 11:27-29", "Acts 2:42", "Acts 20:7"],
        relatedBlogs: [],
      },
    ],
  },
]

export default function DoctrinesPage() {
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50"
    >
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Doctrines</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Discover the biblical foundations that guide our faith and shape our community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Doctrines Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {doctrineCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">{category.name}</h2>

              <div className="space-y-4">
                {category.doctrines.map((doctrine, index) => (
                  <Card key={doctrine.id} className="border-none shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                      <Button
                        variant="ghost"
                        className="w-full p-6 h-auto justify-between text-left hover:bg-slate-50"
                        onClick={() => toggleExpanded(doctrine.id)}
                      >
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800 mb-2">{doctrine.title}</h3>
                        </div>
                        {expandedItems.includes(doctrine.id) ? (
                          <ChevronUp className="w-5 h-5 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-600" />
                        )}
                      </Button>

                      <AnimatePresence>
                        {expandedItems.includes(doctrine.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-0">
                              <div className="h-px bg-slate-200 mb-6" />

                              {/* Main Content */}
                              <div
                                className="prose prose-lg max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-800 prose-ul:text-slate-700 prose-ol:text-slate-700 mb-6"
                                dangerouslySetInnerHTML={{ __html: doctrine.content }}
                              />

                              {/* Scripture References */}
                              <div className="mb-6">
                                <h4 className="text-lg font-semibold text-slate-800 mb-3">Scripture References:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {doctrine.references.map((ref) => (
                                    <Badge key={ref} variant="outline" className="justify-center">
                                      {ref}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Related Blog Posts */}
                              {doctrine.relatedBlogs.length > 0 && (
                                <div>
                                  <h4 className="text-lg font-semibold text-slate-800 mb-3">Related Articles:</h4>
                                  <div className="space-y-3">
                                    {doctrine.relatedBlogs.map((blog) => (
                                      <div key={blog.slug} className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-slate-800 mb-1">{blog.title}</h5>
                                            <p className="text-sm text-slate-600 mb-2">{blog.excerpt}</p>
                                          </div>
                                          <Button asChild size="sm" variant="ghost" className="ml-4">
                                            <Link href={`/blog/${blog.slug}`}>
                                              <FileText className="w-4 h-4 mr-1" />
                                              Read
                                              <ExternalLink className="w-3 h-3 ml-1" />
                                            </Link>
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Have Questions About Our Beliefs?</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              We'd love to discuss these doctrines with you and answer any questions you might have about our faith.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Link href="/contact">Contact Our Pastors</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                <Link href="/blog">Read More Articles</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
