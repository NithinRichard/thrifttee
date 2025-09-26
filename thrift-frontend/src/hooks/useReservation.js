import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const useReservation = (productId) => {
  const { state } = useApp();
  const authToken = localStorage.getItem('authToken');
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkReservationStatus = async () => {
    try {
      const response = await fetch(`/api/v1/products/${productId}/reservation-status/`, {
        headers: authToken ? { 'Authorization': `Token ${authToken}` } : {}
      });
      const data = await response.json();
      
      if (data.is_reserved) {
        setReservation(data);
      } else {
        setReservation(null);
      }
    } catch (err) {
      setError('Failed to check reservation status');
    }
  };

  const createReservation = async () => {
    console.log('Creating reservation for product:', productId);
    console.log('Auth token:', authToken ? 'Present' : 'Missing');
    
    if (!authToken) {
      setError('Please log in to hold items');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/products/${productId}/reserve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Reservation created:', data);
        setReservation({
          is_reserved: true,
          expires_at: data.expires_at,
          time_remaining: data.time_remaining,
          is_own_reservation: true,
          reservation_id: data.reservation_id
        });
      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        setError(errorData.error || 'Failed to create reservation');
      }
    } catch (err) {
      console.log('Network error:', err);
      setError('Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  const extendReservation = async () => {
    if (!reservation?.reservation_id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/reservations/${reservation.reservation_id}/extend/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReservation(prev => ({
          ...prev,
          expires_at: data.expires_at,
          time_remaining: data.time_remaining,
          extensions_used: data.extensions_used
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to extend reservation');
      }
    } catch (err) {
      setError('Failed to extend reservation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      checkReservationStatus();
      const interval = setInterval(checkReservationStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [productId, state.isAuthenticated]);

  return {
    reservation,
    loading,
    error,
    createReservation,
    extendReservation,
    checkReservationStatus
  };
};

export default useReservation;