'use server'

import { prisma } from '@/lib/prisma-client'

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findFirst()

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {},
    })
  }

  return settings
}

export async function updateSiteSettings(data: any) {
  const { id, ...updateData } = data
  const settings = await prisma.siteSettings.update({
    where: { id },
    data: updateData,
  })

  return settings
}
