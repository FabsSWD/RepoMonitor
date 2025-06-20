import { useState, useCallback, useEffect } from 'react';
import { fetchRepoEvents } from '../utils/github-api';
import { REFRESH_INTERVAL } from '../utils/constants';

export const useGitHubEvents = (repoConfig, isAuthenticated) => {
  const [events, setEvents] = useState([]);

  const fetchEvents = useCallback(async () => {
    if (!repoConfig || !isAuthenticated) return;
    
    try {
      const fetchedEvents = await fetchRepoEvents(repoConfig);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [repoConfig, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchEvents();
    const interval = setInterval(fetchEvents, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchEvents]);

  return {
    events,
    fetchRepoEvents: fetchEvents
  };
};