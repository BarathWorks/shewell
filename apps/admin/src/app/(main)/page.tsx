import React from 'react';
import { db } from '@/src/server/db';
import DashboardContent from '@/src/_components/dashboard/dashboard-content';

const Dashboard = async () => {
  // Query actual upcoming sessions from the database
  const sessions = await db.session.findMany({
    take: 3,
    orderBy: { startAt: 'asc' },
    where: { startAt: { gte: new Date() } }
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
  const serializedSessions = sessions.map(session => ({
    id: session.id,
    title: session.title,
    startAt: session.startAt.toISOString(),
    price: Number(session.price),
    meetingLink: session.meetingLink || ''
  }));

  const serializedPayouts = payouts.map(payout => ({
    id: payout.id,
    createdAt: payout.createdAt.toISOString(),
    amountInCents: payout.amountInCents,
    status: payout.status,
    doctor: {
      firstName: payout.doctor.firstName,
      lastName: payout.doctor.lastName || '',
      email: payout.doctor.email
    }
  }));

  return (
    <DashboardContent 
      initialSessions={serializedSessions} 
      initialPayouts={serializedPayouts} 
    />
  );
};

export default Dashboard;
