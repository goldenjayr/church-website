import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SAMPLE_BLOG_POST = {
  title: 'The Complete Guide to Faith, Community, and Spiritual Growth',
  slug: 'complete-guide-faith-community-spiritual-growth',
  excerpt: 'A comprehensive exploration of Christian faith, featuring various formatting styles, lists, headings, and rich content that demonstrates our blog\'s full capabilities.',
  content: `<h1>Welcome to Our Comprehensive Faith Guide</h1>

<p>This sample blog post demonstrates all the rich text formatting capabilities available in our church blog system. From <strong>bold text</strong> to <em>italic emphasis</em>, this post showcases every feature we've built.</p>

<h2>The Foundation of Our Faith</h2>

<p>Our Christian journey begins with understanding the core principles that guide our daily lives. As the apostle Paul wrote in <strong>Ephesians 2:8-9</strong>:</p>

<blockquote>
<p>"For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast."</p>
</blockquote>

<p>This foundational truth shapes everything we do as a church community.</p>

<h3>Core Biblical Principles</h3>

<p>Here are the essential principles that guide our faith:</p>

<ol>
<li><strong>Grace:</strong> God's unmerited favor toward humanity</li>
<li><strong>Faith:</strong> Trust and belief in God's promises</li>
<li><strong>Love:</strong> The greatest commandment to love God and others</li>
<li><strong>Hope:</strong> Confident expectation in God's faithfulness</li>
<li><strong>Community:</strong> Fellowship with believers in unity</li>
</ol>

<h2>Building Strong Community Connections</h2>

<p>Community is at the heart of church life. We believe that <em>authentic relationships</em> are essential for spiritual growth and mutual encouragement.</p>

<h3>Ways to Connect</h3>

<ul>
<li>Sunday worship services</li>
<li>Small group Bible studies</li>
<li>Community outreach programs</li>
<li>Youth and family ministries</li>
<li>Prayer and worship gatherings</li>
<li>Fellowship meals and events</li>
</ul>

<p>Each of these opportunities provides a unique way to grow in faith while building meaningful relationships with fellow believers.</p>

<h2>Spiritual Disciplines for Growth</h2>

<p>Spiritual growth requires <strong>intentional practices</strong> that draw us closer to God. These disciplines help us mature in our faith and become more like Christ.</p>

<h3>Daily Practices</h3>

<p>Consider incorporating these practices into your daily routine:</p>

<ol>
<li>
<p><strong>Morning Prayer:</strong> Start each day by connecting with God through prayer and thanksgiving.</p>
</li>
<li>
<p><strong>Scripture Reading:</strong> Engage with God's Word through systematic Bible reading.</p>
</li>
<li>
<p><strong>Meditation:</strong> Reflect deeply on biblical truths and allow them to transform your thinking.</p>
</li>
<li>
<p><strong>Journaling:</strong> Record your spiritual insights, prayers, and growth experiences.</p>
</li>
</ol>

<h3>Weekly Commitments</h3>

<p>Beyond daily practices, weekly commitments help maintain spiritual momentum:</p>

<ul>
<li><em>Worship attendance</em> - Gathering with the body of Christ</li>
<li><em>Small group participation</em> - Deepening relationships and biblical understanding</li>
<li><em>Service opportunities</em> - Using gifts to serve others</li>
<li><em>Sabbath rest</em> - Setting aside time for spiritual renewal</li>
</ul>

<h2>The Power of Prayer and Worship</h2>

<p>Prayer is our direct line of communication with the Creator of the universe. Through prayer, we can:</p>

<blockquote>
<p>"Cast all your anxiety on him because he cares for you." - <strong>1 Peter 5:7</strong></p>
</blockquote>

<h3>Types of Prayer</h3>

<ol>
<li><strong>Adoration:</strong> Praising God for who He is</li>
<li><strong>Confession:</strong> Acknowledging our sins and need for forgiveness</li>
<li><strong>Thanksgiving:</strong> Expressing gratitude for God's blessings</li>
<li><strong>Supplication:</strong> Making requests for ourselves and others</li>
</ol>

<p>Worship extends beyond Sunday services to encompass our entire lives. When we live with <em>grateful hearts</em> and <em>servant attitudes</em>, we worship God through our actions.</p>

<h2>Mission and Outreach</h2>

<p>Jesus commissioned us to <strong>"Go and make disciples of all nations"</strong> (Matthew 28:19). This Great Commission drives our mission activities:</p>

<ul>
<li>Local community service projects</li>
<li>International mission trips</li>
<li>Evangelism and discipleship training</li>
<li>Support for missionaries worldwide</li>
<li>Social justice initiatives</li>
</ul>

<h3>Current Mission Projects</h3>

<p>We're currently supporting several exciting mission initiatives:</p>

<ol>
<li>
<p><strong>Local Food Bank Partnership:</strong> Monthly volunteer opportunities to serve families in need within our community.</p>
</li>
<li>
<p><strong>International Water Wells:</strong> Funding clean water access in rural communities across Africa.</p>
</li>
<li>
<p><strong>Youth Mentorship Program:</strong> Connecting adult volunteers with at-risk youth in our city.</p>
</li>
</ol>

<h2>Family and Youth Ministry</h2>

<p>Strong families are the backbone of our church community. We're committed to supporting parents and nurturing the next generation of believers.</p>

<h3>Children's Programs</h3>

<ul>
<li><em>Sunday School classes</em> for all age groups</li>
<li><em>Vacation Bible School</em> during summer months</li>
<li><em>Children's choir</em> and musical programs</li>
<li><em>Family game nights</em> and special events</li>
</ul>

<h3>Youth Ministry Focus Areas</h3>

<p>Our youth program emphasizes:</p>

<ol>
<li><strong>Biblical Foundation:</strong> Teaching sound doctrine and theology</li>
<li><strong>Leadership Development:</strong> Preparing teens for future ministry</li>
<li><strong>Community Service:</strong> Hands-on mission experiences</li>
<li><strong>Peer Relationships:</strong> Building godly friendships</li>
</ol>

<h2>Looking Forward: Vision and Goals</h2>

<p>As we continue growing as a church family, our vision remains clear:</p>

<blockquote>
<p>"To be a church that <strong>loves God deeply</strong>, <strong>loves people genuinely</strong>, and <strong>serves the world sacrificially</strong>."</p>
</blockquote>

<h3>2024 Goals</h3>

<p>This year, we're focusing on:</p>

<ul>
<li>Expanding our small group ministry</li>
<li>Launching new community outreach programs</li>
<li>Strengthening our youth and family ministries</li>
<li>Growing in biblical literacy and discipleship</li>
<li>Increasing our missions support and involvement</li>
</ul>

<h2>Getting Involved</h2>

<p>Whether you're a long-time believer or just beginning to explore faith, there's a place for you in our church family. Here's how you can get started:</p>

<ol>
<li><strong>Visit a Service:</strong> Join us for Sunday worship at 9:00 AM or 11:00 AM</li>
<li><strong>Connect with Others:</strong> Attend a small group or fellowship event</li>
<li><strong>Serve the Community:</strong> Volunteer with one of our outreach programs</li>
<li><strong>Grow in Faith:</strong> Participate in Bible study or discipleship classes</li>
</ol>

<p>We believe that God has brought you here for a purpose. Let's discover together what He has in store for your spiritual journey!</p>

<h3>Contact Information</h3>

<p>Ready to take the next step? Here's how to connect with us:</p>

<ul>
<li><strong>Church Office:</strong> (555) 123-4567</li>
<li><strong>Email:</strong> info@ourchurch.org</li>
<li><strong>Address:</strong> 123 Faith Street, Hope City, HC 12345</li>
<li><strong>Website:</strong> www.ourchurch.org</li>
</ul>

<p><em>We look forward to welcoming you into our church family and walking alongside you in your faith journey!</em></p>

<hr>

<p><strong>Prayer Request:</strong> If you have any prayer needs or would like someone to pray with you, please don't hesitate to reach out. Our pastoral care team is available to support you through any challenges you may be facing.</p>

<p>May God bless you richly as you seek to know Him more deeply and serve Him more faithfully.</p>

<p><strong>Pastor John Smith</strong><br>
<em>Lead Pastor, Grace Community Church</em></p>`,
  metaDescription: 'A comprehensive guide exploring Christian faith, community, spiritual growth, and church life. Discover practical ways to deepen your relationship with God and connect with fellow believers.',
  imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
  published: true,
  featured: true,
  tags: [
    'faith',
    'community',
    'spiritual growth',
    'prayer',
    'worship',
    'bible study',
    'discipleship',
    'missions',
    'family ministry',
    'youth',
    'fellowship',
    'outreach',
    'christian living',
    'church community',
    'biblical principles'
  ]
}

async function seedSampleBlogPost() {
  console.log('📝 Creating sample blog post...')

  try {
    // First, get a category to assign to the post
    const spiritualGrowthCategory = await prisma.blogCategory.findFirst({
      where: { slug: 'spiritual-growth' }
    })

    if (!spiritualGrowthCategory) {
      console.log('❌ Spiritual Growth category not found. Please run seed-categories.ts first.')
      return
    }

    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('❌ Admin user not found. Please create an admin user first.')
      return
    }

    // Check if post already exists
    const existingPost = await prisma.blogPost.findFirst({
      where: { slug: SAMPLE_BLOG_POST.slug }
    })

    if (existingPost) {
      console.log('📋 Sample blog post already exists, skipping creation.')
      return
    }

    // Create the blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        ...SAMPLE_BLOG_POST,
        authorId: adminUser.id,
        categoryId: spiritualGrowthCategory.id,
        contentType: 'HTML'
      },
      include: {
        author: true,
        category: true
      }
    })

    console.log(`✅ Created sample blog post: ${blogPost.title}`)
    console.log(`📁 Category: ${blogPost.category?.name}`)
    console.log(`👤 Author: ${blogPost.author.name}`)
    console.log(`🏷️ Tags: ${blogPost.tags.join(', ')}`)
    console.log(`🔗 Slug: ${blogPost.slug}`)

    console.log('🎉 Sample blog post created successfully!')
  } catch (error) {
    console.error('❌ Error creating sample blog post:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedSampleBlogPost()
    .then(() => {
      console.log('✨ Blog post seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Blog post seeding failed:', error)
      process.exit(1)
    })
}

export default seedSampleBlogPost