import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyContext = createContext();

const SUPPORTED_CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'INR';
  });
  const [rates, setRates] = useState({ INR: 1 }); // Default fallback
  const [loading, setLoading] = useState(true);

  // Fetch exchange rates on load
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/INR');
        if (response.data && response.data.rates) {
          setRates(response.data.rates);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates, using fallback.', error);
        // Fallback rates if API fails
        setRates({
          INR: 1,
          USD: 0.012,
          EUR: 0.011,
          GBP: 0.0094
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const handleSetCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  // Utility function to format any amount based on the selected currency
  const formatCurrency = (amountInINR) => {
    const rate = rates[currency] || 1;
    const convertedAmount = amountInINR * rate;
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency, 
      maximumFractionDigits: 0 
    }).format(convertedAmount || 0);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency: handleSetCurrency, 
      formatCurrency, 
      supportedCurrencies: SUPPORTED_CURRENCIES,
      loading 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
