import React from 'react';
import { Lead } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

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

type Props = {
  leads: Lead[];
};

export const AnalyticsView: React.FC<Props> = ({ leads }) => {
  // Calculate data for charts
  const statusData = React.useMemo(() => {
    const statuses = Array.from(new Set(leads.map(lead => lead.status)));
    const counts = statuses.map(status => 
      leads.filter(lead => lead.status === status).length
    );
    
    return {
      labels: statuses,
      datasets: [{
        data: counts,
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',  // green
          'rgba(234, 179, 8, 0.6)',   // yellow
          'rgba(59, 130, 246, 0.6)',  // blue
          'rgba(168, 85, 247, 0.6)',  // purple
          'rgba(239, 68, 68, 0.6)',   // red
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      }],
    };
  }, [leads]);

  const valueByIndustry = React.useMemo(() => {
    const industries = Array.from(new Set(leads.map(lead => lead.industry)));
    const values = industries.map(industry =>
      leads.filter(lead => lead.industry === industry)
        .reduce((sum, lead) => sum + lead.value, 0)
    );

    return {
      labels: industries,
      datasets: [{
        label: 'Total Value by Industry',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      }],
    };
  }, [leads]);

  const leadsBySource = React.useMemo(() => {
    const sources = Array.from(new Set(leads.map(lead => lead.source)));
    const counts = sources.map(source =>
      leads.filter(lead => lead.source === source).length
    );

    return {
      labels: sources,
      datasets: [{
        label: 'Leads by Source',
        data: counts,
        backgroundColor: [
          'rgba(99, 102, 241, 0.6)',
          'rgba(244, 63, 94, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(168, 85, 247, 0.6)',
        ],
      }],
    };
  }, [leads]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Pie 
              data={statusData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Pie
              data={leadsBySource}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Value by Industry</h3>
        <Bar
          data={valueByIndustry}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => '$' + Number(value).toLocaleString(),
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};