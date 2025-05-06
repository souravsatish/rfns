import React, { useEffect, useState } from 'react';
import { getFitbitData } from '../services/fitbitService';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [steps, setSteps] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { profile, steps } = await getFitbitData();
        setProfile(profile);
        setSteps(steps);
      } catch (err) {
        setError('Failed to load Fitbit data');
      }
    }

    loadData();
  }, []);

  if (error) return <p>{error}</p>;
  if (!profile || steps === null) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {profile.displayName}</h2>
      <p>Today's Steps: {steps}</p>
    </div>
  );
}

export default Dashboard;
