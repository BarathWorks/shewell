export const dynamic = 'force-dynamic';

import { db } from '@/src/server/db';
import RegistrationTable from './registration-table';
import { Card } from 'primereact/card';

const RegistrationsPage = async () => {
  const registrations = await db.sessionRegistration.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      session: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          startAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Convert Decimal to number for registration table
  const formattedRegistrations = registrations.map(reg => ({
    ...reg,
    amountPaid: reg.amountPaid ? Number(reg.amountPaid) : null,
    session: {
      ...reg.session,
      price: Number(reg.session.price)
    }
  }));

  // Calculate statistics
  const stats = {
    total: registrations.length,
    completed: registrations.filter((r) => r.paymentStatus === 'COMPLETED').length,
    pending: registrations.filter((r) => r.paymentStatus === 'PENDING').length,
    failed: registrations.filter((r) => r.paymentStatus === 'FAILED').length,
    refunded: registrations.filter((r) => r.paymentStatus === 'REFUNDED').length
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h5>Session Registrations Management</h5>
          <p className="text-gray-600">View and manage all session registrations and payment statuses</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="col-12 lg:col-3 md:col-6">
        <Card className="shadow-2">
          <div className="flex justify-content-between align-items-center">
            <div>
              <div className="text-500 font-medium mb-2">Total Registrations</div>
              <div className="text-900 text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
              <i className="pi pi-users text-blue-500 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12 lg:col-3 md:col-6">
        <Card className="shadow-2">
          <div className="flex justify-content-between align-items-center">
            <div>
              <div className="text-500 font-medium mb-2">Completed</div>
              <div className="text-900 text-3xl font-bold">{stats.completed}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
              <i className="pi pi-check-circle text-green-500 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12 lg:col-3 md:col-6">
        <Card className="shadow-2">
          <div className="flex justify-content-between align-items-center">
            <div>
              <div className="text-500 font-medium mb-2">Pending</div>
              <div className="text-900 text-3xl font-bold">{stats.pending}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-yellow-100 border-round" style={{ width: '3rem', height: '3rem' }}>
              <i className="pi pi-clock text-yellow-500 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12 lg:col-3 md:col-6">
        <Card className="shadow-2">
          <div className="flex justify-content-between align-items-center">
            <div>
              <div className="text-500 font-medium mb-2">Failed / Refunded</div>
              <div className="text-900 text-3xl font-bold">{stats.failed + stats.refunded}</div>
            </div>
            <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '3rem', height: '3rem' }}>
              <i className="pi pi-times-circle text-red-500 text-xl" />
            </div>
          </div>
        </Card>
      </div>

      {/* Registrations Table */}
      <div className="col-12">
        <RegistrationTable registrations={formattedRegistrations} />
      </div>
    </div>
  );
};

export default RegistrationsPage;
