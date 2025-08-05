
'use client'
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, BookOpen, Globe, Target, Eye } from "lucide-react";
import { Member } from '@prisma/client'

const values = [
  {
    icon: Heart,
    title: "Love",
    description: "We believe love is the foundation of our faith and the driving force behind everything we do.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We are committed to building authentic relationships and supporting one another in our faith journey.",
  },
  {
    icon: BookOpen,
    title: "Truth",
    description: "We hold fast to the truth of God's Word as our guide for life and faith.",
  },
  {
    icon: Globe,
    title: "Mission",
    description: "We are called to share the gospel and serve our community and the world.",
  },
];

interface IProps {
  leadership: Member[]
}

export function AboutPage(props: IProps) {
  const { leadership } = props
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
              <Heart className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Us</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Learn about our mission, vision, and the people who make Grace Community Church a place of faith, hope,
              and love
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-lg">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Mission</h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
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
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Vision</h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
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
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Values</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              These core values guide everything we do as a church community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{value.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Leadership</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Meet the dedicated leaders who guide our church with wisdom, compassion, and faithfulness
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
                      <img
                        src={leader.imageUrl || "/placeholder-user.jpg"}
                        alt={`${leader.firstName} ${leader.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{`${leader.firstName} ${leader.lastName}`}</h3>
                    {/* @ts-ignore */}
                    <p className="font-semibold mb-3" style={{ color: leader.position?.color }}>{leader.position?.name}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{leader.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-8">Our Story</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Divine Jesus Church was founded in 1995 by a small group of families who felt called to create a church
                that would be a beacon of hope and love in our community. What started as a home Bible study has grown
                into a thriving congregation of over 500 members.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Throughout our history, we have remained committed to our core mission of making disciples and serving
                our community. We have weathered challenges together, celebrated victories, and grown stronger in our
                faith and fellowship.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Today, Divine Jesus Church continues to be a place where people from all walks of life can come together
                to worship, learn, grow, and serve. We are excited about what God has in store for our future and invite
                you to be part of our ongoing story.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
