'use server'

import { prisma } from '@/lib/prisma-client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { unstable_cache } from 'next/cache'

export const getSiteSettings = unstable_cache(
  async () => {
    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {},
      })
    }

    return settings
  },
  ['site-settings'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['site-settings']
  }
)

export async function getSiteSettingsNoCache() {
  let settings = await prisma.siteSettings.findFirst()

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {},
    })
  }

  return settings
}

export const getLiveStreamSettings = unstable_cache(
  async () => {
    const settings = await prisma.siteSettings.findFirst({
      select: {
        liveStreamUrl: true,
        liveStreamActive: true
      }
    })

    return {
      liveStreamUrl: settings?.liveStreamUrl || null,
      liveStreamActive: settings?.liveStreamActive || false
    }
  },
  ['live-stream-settings'],
  {
    revalidate: 30, // Cache for 30 seconds for live stream
    tags: ['site-settings', 'live-stream']
  }
)

export async function updateSiteSettings(data: any) {
  const { id, ...updateData } = data
  const settings = await prisma.siteSettings.update({
    where: { id },
    data: updateData,
  })

  // Revalidate all pages that use site settings
  revalidateTag('site-settings')
  revalidatePath('/', 'layout') // Revalidate all pages
  revalidatePath('/admin/settings')

  return settings
}
