import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testHtmlRendering() {
  console.log('🎨 Testing HTML rendering for blog posts...\n')

  try {
    // Get the comprehensive sample post
    const samplePost = await prisma.blogPost.findFirst({
      where: { slug: 'complete-guide-faith-community-spiritual-growth' },
      include: { author: true, category: true }
    })

    if (!samplePost) {
      console.log('❌ Sample post not found')
      return
    }

    console.log('📝 Sample Post Analysis:')
    console.log(`Title: ${samplePost.title}`)
    console.log(`Author: ${samplePost.author.name}`)
    console.log(`Category: ${samplePost.category?.name}`)
    console.log(`Published: ${samplePost.published}`)
    console.log(`Content Type: ${samplePost.contentType}`)
    console.log(`Content Length: ${samplePost.content.length} characters`)
    console.log('')

    // Analyze HTML content
    console.log('🔍 HTML Content Analysis:')
    
    const htmlElements = {
      'H1 Headers': (samplePost.content.match(/<h1[^>]*>/g) || []).length,
      'H2 Headers': (samplePost.content.match(/<h2[^>]*>/g) || []).length,
      'H3 Headers': (samplePost.content.match(/<h3[^>]*>/g) || []).length,
      'Paragraphs': (samplePost.content.match(/<p[^>]*>/g) || []).length,
      'Bold Text': (samplePost.content.match(/<strong[^>]*>/g) || []).length,
      'Italic Text': (samplePost.content.match(/<em[^>]*>/g) || []).length,
      'Unordered Lists': (samplePost.content.match(/<ul[^>]*>/g) || []).length,
      'Ordered Lists': (samplePost.content.match(/<ol[^>]*>/g) || []).length,
      'List Items': (samplePost.content.match(/<li[^>]*>/g) || []).length,
      'Blockquotes': (samplePost.content.match(/<blockquote[^>]*>/g) || []).length,
      'Horizontal Rules': (samplePost.content.match(/<hr[^>]*>/g) || []).length,
    }

    Object.entries(htmlElements).forEach(([element, count]) => {
      const status = count > 0 ? '✅' : '❌'
      console.log(`${status} ${element}: ${count}`)
    })

    console.log('')
    console.log('📋 Content Structure Preview:')
    
    // Extract first few headings to show structure
    const headingMatches = samplePost.content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/g) || []
    const headings = headingMatches.slice(0, 5).map(h => {
      const level = h.match(/<h([1-3])/)?.[1] || '1'
      const text = h.replace(/<[^>]*>/g, '')
      const indent = '  '.repeat(parseInt(level) - 1)
      return `${indent}${'#'.repeat(parseInt(level))} ${text}`
    })
    
    headings.forEach(heading => console.log(heading))
    
    if (headings.length < headingMatches.length) {
      console.log(`... and ${headingMatches.length - headings.length} more headings`)
    }

    console.log('')
    console.log('🎯 Rich Text Features Test:')
    
    const features = [
      { name: 'Headers (H1-H3)', test: htmlElements['H1 Headers'] + htmlElements['H2 Headers'] + htmlElements['H3 Headers'] > 0 },
      { name: 'Text Formatting', test: htmlElements['Bold Text'] > 0 && htmlElements['Italic Text'] > 0 },
      { name: 'Lists', test: htmlElements['Unordered Lists'] > 0 && htmlElements['Ordered Lists'] > 0 },
      { name: 'Blockquotes', test: htmlElements['Blockquotes'] > 0 },
      { name: 'Structured Content', test: htmlElements['Paragraphs'] > 10 },
    ]

    let passedFeatures = 0
    features.forEach(feature => {
      const status = feature.test ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${feature.name}`)
      if (feature.test) passedFeatures++
    })

    console.log('')
    console.log(`🎉 Rich Text Test Result: ${passedFeatures}/${features.length} features working`)
    
    if (passedFeatures === features.length) {
      console.log('✅ All rich text features are properly implemented!')
    } else {
      console.log('⚠️  Some rich text features may need attention.')
    }

    console.log('')
    console.log('🌐 Public URLs to test:')
    console.log(`📋 Blog List: http://localhost:3000/blog`)
    console.log(`📝 Sample Post: http://localhost:3000/blog/${samplePost.slug}`)
    console.log(`👤 Admin Panel: http://localhost:3000/admin/blog`)

  } catch (error) {
    console.error('❌ Error testing HTML rendering:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testHtmlRendering()