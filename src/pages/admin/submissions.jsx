import { useState, useEffect } from 'react';
import axios from 'axios';
export default function AdminPanel() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // You'll need to create this API endpoint to fetch submissions from your database
        const response = await axios.get('/api/get-submissions');
        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Form Submissions</h1>
      <div className="grid gap-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="border rounded-lg p-4 shadow-sm"
          >
            <p><strong>Name:</strong> {submission.name}</p>
            <p><strong>Email:</strong> {submission.email}</p>
            <p><strong>Message:</strong> {submission.message}</p>
            <p><strong>Date:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 