import { AttendanceRecord } from '../types';

/**
 * Sends a scanned attendance record to the configured Google Sheets Webhook.
 * Stores/retrieves the Webhook URL from localStorage.
 */
export const getGoogleSheetsWebhookUrl = (): string => {
  return localStorage.getItem('ecosem_sheets_webhook') || '';
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
