'use server'

import { prisma } from '@/lib/prisma-client'
import { MessageStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { sendReplyEmail, sendNewMessageNotification } from '@/lib/email-service'

// Get all messages with optional filters
export async function getMessages(filters?: {
  status?: MessageStatus
  starred?: boolean
  archived?: boolean
  search?: string
}) {
  try {
    const where: any = {}

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.starred !== undefined) {
      where.starred = filters.starred
    }

    if (filters?.archived !== undefined) {
      where.archived = filters.archived
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { message: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return messages
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw error
  }
}

// Get a single message by ID
export async function getMessage(id: string) {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    })

    return message
  } catch (error) {
    console.error('Error fetching message:', error)
    throw error
  }
}

// Create a new message (from contact form)
export async function createMessage(data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  try {
    const message = await prisma.contactMessage.create({
      data,
    })
    
    // Send notification email to admin (non-blocking)
    sendNewMessageNotification({
      ...data,
      createdAt: message.createdAt,
    }).catch(error => {
      console.error('Failed to send notification email:', error)
    })
    
    revalidatePath('/admin/messages')
    return { success: true, message }
  } catch (error) {
    console.error('Error creating message:', error)
    return { success: false, error: 'Failed to send message' }
  }
}

// Update message status
export async function updateMessageStatus(id: string, status: MessageStatus) {
  try {
    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        status,
        ...(status === 'REPLIED' && { repliedAt: new Date() })
      },
    })

    revalidatePath('/admin/messages')
    return { success: true, message }
  } catch (error) {
    console.error('Error updating message status:', error)
    return { success: false, error: 'Failed to update message status' }
  }
}

// Toggle starred status
export async function toggleMessageStar(id: string) {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
      select: { starred: true },
    })

    if (!message) {
      throw new Error('Message not found')
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { starred: !message.starred },
    })

    revalidatePath('/admin/messages')
    return { success: true, message: updated }
  } catch (error) {
    console.error('Error toggling star:', error)
    return { success: false, error: 'Failed to toggle star' }
  }
}

// Archive/Unarchive message
export async function toggleMessageArchive(id: string) {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id },
      select: { archived: true },
    })

    if (!message) {
      throw new Error('Message not found')
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { archived: !message.archived },
    })

    revalidatePath('/admin/messages')
    return { success: true, message: updated }
  } catch (error) {
    console.error('Error toggling archive:', error)
    return { success: false, error: 'Failed to toggle archive' }
  }
}

// Delete message
export async function deleteMessage(id: string) {
  try {
    await prisma.contactMessage.delete({
      where: { id },
    })

    revalidatePath('/admin/messages')
    return { success: true }
  } catch (error) {
    console.error('Error deleting message:', error)
    return { success: false, error: 'Failed to delete message' }
  }
}

// Bulk delete messages
export async function deleteMessages(ids: string[]) {
  try {
    await prisma.contactMessage.deleteMany({
      where: { id: { in: ids } },
    })

    revalidatePath('/admin/messages')
    return { success: true }
  } catch (error) {
    console.error('Error deleting messages:', error)
    return { success: false, error: 'Failed to delete messages' }
  }
}

// Update admin notes
export async function updateMessageNotes(id: string, notes: string) {
  try {
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { notes },
    })

    revalidatePath('/admin/messages')
    return { success: true, message }
  } catch (error) {
    console.error('Error updating notes:', error)
    return { success: false, error: 'Failed to update notes' }
  }
}

// Get message statistics
export async function getMessageStats() {
  try {
    const [total, unread, starred, archived] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.contactMessage.count({ where: { starred: true } }),
      prisma.contactMessage.count({ where: { archived: true } }),
    ])
    
    return {
      total,
      unread,
      starred,
      archived,
    }
  } catch (error) {
    console.error('Error fetching message stats:', error)
    throw error
  }
}

// Send reply email to a message
export async function sendMessageReply(messageId: string, replyText: string, senderName?: string) {
  try {
    const [message, siteSettings] = await Promise.all([
      prisma.contactMessage.findUnique({
        where: { id: messageId },
      }),
      prisma.siteSettings.findFirst(),
    ])
    
    if (!message) {
      throw new Error('Message not found')
    }
    
    // Send the email
    const emailResult = await sendReplyEmail({
      to: message.email,
      subject: `Re: ${message.subject}`,
      message: replyText,
      originalMessage: {
        firstName: message.firstName,
        lastName: message.lastName,
        subject: message.subject,
        message: message.message,
        createdAt: message.createdAt,
      },
      senderName,
      siteSettings: siteSettings ? {
        siteName: siteSettings.siteName || undefined,
        logoUrl: siteSettings.logoUrl || undefined,
        contactEmail: siteSettings.contactEmail || undefined,
        contactPhone: siteSettings.contactPhone || undefined,
        contactAddress: siteSettings.contactAddress || undefined,
      } : undefined,
    })
    
    if (emailResult.success) {
      // Update message status to REPLIED
      await prisma.contactMessage.update({
        where: { id: messageId },
        data: {
          status: 'REPLIED',
          repliedAt: new Date(),
        },
      })
      
      revalidatePath('/admin/messages')
      return { success: true, message: 'Reply sent successfully' }
    } else {
      return { success: false, error: 'Failed to send email' }
    }
  } catch (error) {
    console.error('Error sending reply:', error)
    return { success: false, error: 'Failed to send reply' }
  }
}
