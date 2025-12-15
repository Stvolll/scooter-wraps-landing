// app/admin/analytics/page.tsx
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')?.value

  if (!authCookie || authCookie !== 'authenticated') {
    redirect('/admin/login')
  }

  // Fetch analytics data
  let stats = {
    totalDesigns: 0,
    publishedDesigns: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    paidOrders: 0,
    deliveredOrders: 0,
    totalDeals: 0,
    activeDeals: 0,
  }

  try {
    const [designs, orders, deals] = await Promise.all([
      prisma.design.findMany({
        select: { id: true, published: true, price: true },
      }),
      prisma.order.findMany({
        select: { id: true, status: true, totalPrice: true },
      }),
      prisma.deal.findMany({
        select: { id: true, status: true },
      }),
    ])

    stats = {
      totalDesigns: designs.length,
      publishedDesigns: designs.filter(d => d.published).length,
      totalOrders: orders.length,
      totalRevenue: orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.totalPrice, 0),
      pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'payment_pending').length,
      paidOrders: orders.filter(o => o.status === 'paid').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      totalDeals: deals.length,
      activeDeals: deals.filter(d => d.status === 'open' || d.status === 'paid').length,
    }
  } catch (error: any) {
    console.error('Analytics error:', error)
    // Continue with default stats if database error
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 pt-24 px-4 md:px-8 lg:px-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/60">Overview of your business metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-4 md:mx-8 lg:mx-16 mb-8">
          {/* Total Designs */}
          <div
            className="p-6 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div className="text-white/60 text-sm mb-2">Total Designs</div>
            <div className="text-3xl font-bold text-white">{stats.totalDesigns}</div>
            <div className="text-xs text-white/40 mt-2">
              {stats.publishedDesigns} published
            </div>
          </div>

          {/* Total Orders */}
          <div
            className="p-6 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div className="text-white/60 text-sm mb-2">Total Orders</div>
            <div className="text-3xl font-bold text-white">{stats.totalOrders}</div>
            <div className="text-xs text-white/40 mt-2">
              {stats.pendingOrders} pending
            </div>
          </div>

          {/* Total Revenue */}
          <div
            className="p-6 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div className="text-white/60 text-sm mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-[#00FFA9]">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-xs text-white/40 mt-2">
              {stats.paidOrders} paid orders
            </div>
          </div>

          {/* Active Deals */}
          <div
            className="p-6 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div className="text-white/60 text-sm mb-2">Active Deals</div>
            <div className="text-3xl font-bold text-white">{stats.activeDeals}</div>
            <div className="text-xs text-white/40 mt-2">
              {stats.totalDeals} total
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div
          className="p-6 mx-4 md:mx-8 lg:mx-16 rounded-3xl mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Order Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5">
              <div className="text-white/60 text-sm mb-1">Pending</div>
              <div className="text-2xl font-bold text-white">{stats.pendingOrders}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5">
              <div className="text-white/60 text-sm mb-1">Paid</div>
              <div className="text-2xl font-bold text-[#00FFA9]">{stats.paidOrders}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5">
              <div className="text-white/60 text-sm mb-1">Delivered</div>
              <div className="text-2xl font-bold text-[#00D4FF]">{stats.deliveredOrders}</div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mx-4 md:mx-8 lg:mx-16">
          <a
            href="/admin"
            className="inline-block text-[#00FFA9] hover:text-[#00D4FF] transition-colors text-sm font-medium"
          >
            ← Back to Admin
          </a>
        </div>
      </div>
    </div>
  )
}





