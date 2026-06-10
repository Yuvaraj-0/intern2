import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchJobResults = async (jobId) => {
    try {
      const response = await axios.get(`${API_URL}/jobs/${jobId}/results`);
      setSelectedJob(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const pollJobStatus = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/jobs/${jobId}/status`);
        const job = response.data;
        setJobs(prev => prev.map(j => j.id === jobId ? job : j));
        
        if (job.status === 'completed') {
          clearInterval(interval);
          fetchJobResults(jobId);
          setUploading(false);
        }
        if (job.status === 'failed') {
          clearInterval(interval);
          setUploading(false);
        }
      } catch (error) {
        console.error('Error polling job:', error);
        clearInterval(interval);
        setUploading(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API_URL}/jobs/upload`, formData);
      const { job_id } = response.data;
      fetchJobs();
      pollJobStatus(job_id);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      alert('Upload failed');
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10B981';
      case 'processing': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>💰 Transaction Processing Pipeline</h1>
        <p>AI-powered financial transaction analysis</p>
      </header>
      
      <div className="container">
        {/* Upload Section */}
        <div className="card upload-card">
          <h2>Upload CSV File</h2>
          <label className="upload-label">
            {uploading ? 'Processing...' : 'Choose CSV file'}
            <input 
              type="file" 
              accept=".csv"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {uploading && <div className="spinner"></div>}
        </div>
        
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Jobs</h3>
            <p className="stat-number">{jobs.length}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-number text-green">{jobs.filter(j => j.status === 'completed').length}</p>
          </div>
          <div className="stat-card">
            <h3>Processing</h3>
            <p className="stat-number text-blue">{jobs.filter(j => j.status === 'processing').length}</p>
          </div>
          <div className="stat-card">
            <h3>Failed</h3>
            <p className="stat-number text-red">{jobs.filter(j => j.status === 'failed').length}</p>
          </div>
        </div>
        
        <div className="two-columns">
          {/* Jobs List */}
          <div className="card">
            <h2>Recent Jobs</h2>
            <div className="jobs-list">
              {jobs.length === 0 ? (
                <p className="text-center text-gray">No jobs yet. Upload a CSV to get started.</p>
              ) : (
                jobs.map(job => (
                  <div 
                    key={job.id} 
                    className={`job-item ${selectedJob?.job_id === job.id ? 'active' : ''}`}
                    onClick={() => fetchJobResults(job.id)}
                  >
                    <div className="job-header">
                      <span className="job-id">#{job.id}</span>
                      <span className="status-badge" style={{backgroundColor: getStatusColor(job.status)}}>
                        {job.status}
                      </span>
                    </div>
                    <p className="job-filename">{job.filename}</p>
                    <div className="job-stats">
                      <span>Raw: {job.row_count_raw}</span>
                      <span>Clean: {job.row_count_clean}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Results */}
          <div className="card">
            <h2>Results</h2>
            {!selectedJob ? (
              <p className="text-center text-gray">Select a job to view results</p>
            ) : selectedJob.status !== 'completed' ? (
              <p className="text-center">Processing job #{selectedJob.job_id}...</p>
            ) : (
              <div className="results">
                <div className="summary">
                  <h3>Summary</h3>
                  <p><strong>Total Transactions:</strong> {selectedJob.total_transactions}</p>
                  <p><strong>Anomalies Found:</strong> {selectedJob.anomaly_count}</p>
                  <p><strong>Risk Level:</strong> 
                    <span className={`risk-${selectedJob.llm_narrative?.risk_level}`}>
                      {selectedJob.llm_narrative?.risk_level?.toUpperCase()}
                    </span>
                  </p>
                  <p><strong>AI Narrative:</strong> {selectedJob.llm_narrative?.narrative}</p>
                </div>
                
                {selectedJob.flagged_anomalies?.length > 0 && (
                  <div className="anomalies">
                    <h3>⚠️ Flagged Anomalies ({selectedJob.anomaly_count})</h3>
                    {selectedJob.flagged_anomalies.map((a, i) => (
                      <div key={i} className="anomaly-item">
                        <strong>{a.merchant}</strong> - ${a.amount}
                        <p className="reason">{a.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="categories">
                  <h3>Category Breakdown</h3>
                  {Object.entries(selectedJob.category_breakdown || {}).map(([cat, count]) => (
                    <div key={cat} className="category-item">
                      <span>{cat}</span>
                      <span className="count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
