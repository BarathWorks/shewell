export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import { db } from '@/src/server/db';
import DashboardContent from '@/src/_components/dashboard/dashboard-content';

const Dashboard = async () => {
  let serializedSessions: any[] = [];
  let serializedPayouts: any[] = [];

  try {
    // Query actual upcoming and ongoing sessions from the database
    const sessions = await db.session.findMany({
      take: 3,
      orderBy: { startAt: 'asc' },
      where: { endAt: { gte: new Date() } },
      include: {
        thumbnailMedia: true,
        banners: {
          include: {
            media: true
          }
        }
      }
    });

    // Query actual payout requests from the database
    const payouts = await db.payout.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Convert dates and decimals to serializable formats for client component
    serializedSessions = sessions.map(session => ({
      id: session.id,
      title: session.title,
      slug: session.slug,
      startAt: session.startAt.toISOString(),
      endAt: session.endAt.toISOString(),
      price: Number(session.price),
      meetingLink: session.meetingLink || '',
      maxBookings: session.maxBookings,
      overview: session.overview || '',
      thumbnailMedia: session.thumbnailMedia ? {
        id: session.thumbnailMedia.id,
        fileUrl: session.thumbnailMedia.fileUrl
      } : null,
      banners: session.banners.map(b => ({
        id: b.media.id,
        fileUrl: b.media.fileUrl
      }))
    }));

    serializedPayouts = payouts.map(payout => ({
      id: payout.id,
      createdAt: payout.createdAt.toISOString(),
      amountInCents: payout.amountInCents,
      status: payout.status,
      doctor: {
        firstName: payout.doctor?.firstName || '',
        lastName: payout.doctor?.lastName || '',
        email: payout.doctor?.email || ''
      }
    }));
  } catch (error) {
    console.error("Error loading dashboard data during render:", error);
  }

  return (
    <DashboardContent 
      initialSessions={serializedSessions} 
      initialPayouts={serializedPayouts} 
    />
  );
};

export default Dashboard;
