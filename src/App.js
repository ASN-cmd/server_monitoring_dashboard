import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const alertDistributionOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      display: false
    }
  }
};

const networkTrafficOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f3f5'
      }
    }
  }
};

function App() {
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [servers, setServers] = useState([]);
  const [networkData, setNetworkData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, alertsRes, serversRes, networkRes] = await Promise.all([
          axios.get('http://localhost:5000/api/metrics'),
          axios.get('http://localhost:5000/api/alerts'),
          axios.get('http://localhost:5000/api/servers'),
          axios.get('http://localhost:5000/api/network'),
        ]);

        setMetrics(metricsRes.data);
        setAlerts(alertsRes.data);
        setServers(serversRes.data);
        setNetworkData(networkRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const cpuGaugeData = {
    labels: ['CPU Usage', 'Free'],
    datasets: [{
      data: metrics ? [metrics.cpu_usage, 100 - metrics.cpu_usage] : [0, 100],
      backgroundColor: ['#FF6B6B', '#f0f0f0'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
    }]
  };

  const gaugeOptions = {
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    maintainAspectRatio: false
  };

  const alertChartData = {
    labels: ['Critical', 'Warning', 'Normal'],
    datasets: [
      {
        data: alerts ? [alerts.critical, alerts.medium, alerts.low] : [],
        backgroundColor: [
          '#FF6B6B',
          '#FFA94D',
          '#69DB7C',
        ],
        borderWidth: 0,
      },
    ],
  };

  const alertChartOptions = {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      }
    },
    maintainAspectRatio: false,
    cutout: '60%'
  };

  const networkChartData = {
    labels: networkData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Network Traffic',
        data: networkData.map(d => d.incoming),
        borderColor: '#4DABF7',
        backgroundColor: 'rgba(77, 171, 247, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const networkChartOptions = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h1>Server Monitoring Dashboard</h1>
            <p className="subtitle">Real-time server metrics and alerts</p>
          </div>
          <p className="last-updated">Last updated: {new Date().toLocaleTimeString()}</p>
        </header>
        
        <div className="dashboard-grid">
          <div className="card cpu-gauge">
            <h2>CPU Usage</h2>
            <div className="gauge-container">
              <Doughnut data={cpuGaugeData} options={gaugeOptions} />
              <div className="gauge-value">
                <span className="value">{metrics ? Math.round(metrics.cpu_usage) : 0}%</span>
                <span className="label">Current Usage</span>
              </div>
            </div>
            <p className="status-text">
              {metrics && metrics.cpu_usage < 70 ? 'System running normally' : 'High CPU usage detected'}
            </p>
          </div>

          <div className="card alerts-donut">
            <h2>Alert Distribution</h2>
            <div className="chart-container">
              <Doughnut data={alertChartData} options={alertDistributionOptions} />
            </div>
            <div className="alerts-summary">
              <div className="alert-item">
                <span className="alert-value critical">{alerts?.critical || 0}</span>
                <span className="alert-label">Critical</span>
              </div>
              <div className="alert-item">
                <span className="alert-value warning">{alerts?.medium || 0}</span>
                <span className="alert-label">Warning</span>
              </div>
              <div className="alert-item">
                <span className="alert-value normal">{alerts?.low || 0}</span>
                <span className="alert-label">Normal</span>
              </div>
            </div>
          </div>

          <div className="card network-traffic">
            <h2>Network Traffic</h2>
            <div className="chart-container">
              <Line data={networkChartData} options={networkTrafficOptions} />
            </div>
          </div>

          <div className="card servers-list">
            <div className="card-header">
              <h2>Active Instances</h2>
              <button className="refresh-btn">Refresh List</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Server Name</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {servers.map(server => (
                    <tr key={server.id}>
                      <td>
                        <div className="server-name">
                          <div className="server-icon"></div>
                          {server.name}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${server.status.toLowerCase()}`}>
                          {server.status}
                        </span>
                      </td>
                      <td>{server.ip_address}</td>
                      <td>{new Date(server.last_updated).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 