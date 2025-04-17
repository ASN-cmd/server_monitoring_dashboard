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

  const resourceChartData = {
    labels: ['CPU', 'RAM', 'Disk', 'App'],
    datasets: [
      {
        label: 'Usage %',
        data: metrics ? [metrics.cpu_usage, metrics.ram_usage, metrics.disk_usage, metrics.app_usage] : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const networkChartData = {
    labels: networkData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Incoming Traffic (MB/s)',
        data: networkData.map(d => d.incoming),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Server Monitoring Dashboard</h1>
      </header>
      
      <div className="dashboard-grid">
        <div className="alerts-section">
          <h2>Alerts</h2>
          {alerts && (
            <div className="alerts-container">
              <div className="alert critical">
                <span>Critical</span>
                <span>{alerts.critical}</span>
              </div>
              <div className="alert medium">
                <span>Medium</span>
                <span>{alerts.medium}</span>
              </div>
              <div className="alert low">
                <span>Low</span>
                <span>{alerts.low}</span>
              </div>
            </div>
          )}
        </div>

        <div className="metrics-section">
          <h2>Resource Usage</h2>
          <div className="chart-container">
            <Doughnut data={resourceChartData} />
          </div>
        </div>

        <div className="network-section">
          <h2>Network Traffic</h2>
          <div className="chart-container">
            <Line data={networkChartData} />
          </div>
        </div>

        <div className="servers-section">
          <h2>Servers</h2>
          <div className="servers-list">
            {servers.map(server => (
              <div key={server.id} className="server-card">
                <h3>{server.name}</h3>
                <p>Status: <span className={`status ${server.status.toLowerCase()}`}>{server.status}</span></p>
                <p>IP: {server.ip_address}</p>
                <p>Last Updated: {new Date(server.last_updated).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 