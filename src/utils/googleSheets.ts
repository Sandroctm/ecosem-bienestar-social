import { AttendanceRecord } from '../types';

/**
 * Sends a scanned attendance record to the configured Google Sheets Webhook.
 * Stores/retrieves the Webhook URL from localStorage.
 */
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbydoY24Hyj8CSDqZqkS8QEIg3P0IkU2JDZDnYvPGq8ul1n0UU810gFM5Z4u6TR6qO2M/exec';

export const getGoogleSheetsWebhookUrl = (): string => {
  return localStorage.getItem('ecosem_sheets_webhook') || DEFAULT_WEBHOOK_URL;
};

export const setGoogleSheetsWebhookUrl = (url: string): void => {
  localStorage.setItem('ecosem_sheets_webhook', url.trim());
};

export const sendToGoogleSheets = async (record: AttendanceRecord): Promise<boolean> => {
  const url = getGoogleSheetsWebhookUrl();
  if (!url) {
    console.log('Google Sheets Webhook no configurado.');
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // standard for Google Apps Script Web App webhooks to avoid CORS issues
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    console.log('Asistencia enviada a Google Sheets', response);
    return true;
  } catch (error) {
    console.error('Error al enviar asistencia a Google Sheets:', error);
    return false;
  }
};
