import { useEffect, useState } from 'react';
import { Activity, Cat, CreditCard, RefreshCw, Ticket, Users } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getApiData } from '../../services/apiResponse';
import {
  AdminErrorState,
  AdminLoadingState,
} from '../../components/admin/AdminPageState';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EMPTY_STATS = {
  totalRevenue: 0,
  pendingBookings: 0,
  todayVisitors: 0,
  totalUsers: 0,
  totalAnimals: 0,
  totalBookings: 0,
};

const CHART_COLORS = {
  line: 'rgba(15, 122, 67, 0.8)',
  doughnut: ['#0f7a43', '#d6a32f', '#2f7a90', '#9a3412', '#64748b'],
};

const Dashboard = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [revenueData, setRevenueData] = useState(null);
  const [visitorData, setVisitorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const resultToChartData = (dataArray, labelKey, dataKey, label, color) => {
    if (!dataArray || dataArray.length === 0) return null;

    return {
      labels: dataArray.map((item) => item[labelKey]),
      datasets: [
        {
          label,
          data: dataArray.map((item) => item[dataKey]),
          borderColor: color.replace(/[\d.]+\)$/g, '1)'),
          backgroundColor: color,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setHasError(false);

        const [statsRes, revenueRes, visitorRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/reports/revenue'),
          api.get('/admin/reports/visitors'),
        ]);

        if (!isMounted) {
          return;
        }

        const statsData = getApiData(statsRes, EMPTY_STATS);
        const revenueReport = getApiData(revenueRes, { report: [] });
        const visitorReport = getApiData(visitorRes, { byTicketType: [] });

        setStats({ ...EMPTY_STATS, ...statsData });

        setRevenueData(
          resultToChartData(
            revenueReport.report,
            '_id',
            'revenue',
            'Revenue (Rs)',
            CHART_COLORS.line
          )
        );

        setVisitorData({
          labels: visitorReport.byTicketType.map((item) => item._id || 'Unknown'),
          datasets: [
            {
              data: visitorReport.byTicketType.map((item) => item.count),
              backgroundColor: CHART_COLORS.doughnut,
              hoverOffset: 4,
            },
          ],
        });
      } catch {
        if (isMounted) {
          setHasError(true);
          toast.error('Failed to load dashboard data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <AdminLoadingState label="Loading dashboard analytics..." />;
  }

  if (hasError) {
    return (
      <AdminErrorState
        title="Dashboard data could not be loaded"
        description="The admin charts or counters did not respond correctly. Refresh once the API is available."
        action={
          <button type="button" className="btn btn-primary rounded-full" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Reload
          </button>
        }
      />
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `Rs ${stats.totalRevenue.toLocaleString()}`,
      icon: <CreditCard className="w-8 h-8 text-emerald-500" />,
      trend: `${stats.totalBookings} total bookings`,
      color: 'bg-emerald-50',
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: <Ticket className="w-8 h-8 text-amber-600" />,
      trend: 'Awaiting admin attention',
      color: 'bg-amber-50',
    },
    {
      title: 'Today\'s Visitors',
      value: stats.todayVisitors,
      icon: <Activity className="w-8 h-8 text-teal-700" />,
      trend: 'Confirmed or completed today',
      color: 'bg-teal-50',
    },
    {
      title: 'Active Animals',
      value: stats.totalAnimals,
      icon: <Cat className="w-8 h-8 text-emerald-700" />,
      trend: `${stats.totalUsers} registered visitors`,
      color: 'bg-lime-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-slate-500">Real-time statistics and analytics for Lahore Zoo.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.title} className="card border border-emerald-100/60 bg-white shadow-sm">
            <div className="card-body p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{card.title}</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span>{card.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card border border-emerald-100/60 bg-white shadow-sm lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title mb-4 text-xl text-slate-900">Revenue Trend</h2>
            <p className="text-sm text-slate-500">Recent paid bookings grouped by date.</p>
            <div className="h-80 w-full relative mt-4">
              {revenueData ? (
                <Line
                  data={revenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No revenue data available yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card border border-emerald-100/60 bg-white shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4 text-xl text-slate-900">Ticket Sales by Type</h2>
            <p className="text-sm text-slate-500">Visitor volume based on booked ticket categories.</p>
            <div className="h-80 w-full relative flex items-center justify-center mt-4">
              {visitorData && visitorData.labels.length > 0 ? (
                <Doughnut
                  data={visitorData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                  }}
                />
              ) : (
                <span className="text-slate-400">No ticket sales data available</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
