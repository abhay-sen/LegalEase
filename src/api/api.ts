import { supabase } from '../services/supabase';
import auth from '@react-native-firebase/auth';
// import { useUserStore } from './../store/useUserStore';
const BASE_URL = 'https://legalease-backend-p39s.onrender.com';

export const getLegalReport = async (pdfUrl: string) => {
  const res = await fetch(`${BASE_URL}/process-pdf-url/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: pdfUrl }),
  });

  // First, get the raw response body as JSON
  const json = await res.json();

  // Check if the response was successful (status 200-299)
  if (!res.ok) {
    console.error('API Error Response:', json);
    // If there's a 'detail' field in the error response, use it as the error message.
    // This handles the specific 429 error you provided.
    if (json && json.detail) {
      throw new Error(json.detail);
    }
    // Otherwise, throw a generic error with the status code.
    throw new Error(`API request failed with status ${res.status}`);
  }

  // Ensure the successful response has the expected 'report' property
  if (!json.report || typeof json.report !== 'string') {
    throw new Error('Invalid report format received from the server.');
  }

  try {
    // Clean markdown fences if present
    const cleaned = json.report
      .replace(/^```json\s*/, '')
      .replace(/```$/, '')
      .trim();

    // Return the parsed JSON object
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error('Failed to parse report JSON:', parseError);
    // This error will be caught by the calling function in HomeScreen
    throw new Error('Failed to process the report data from the server.');
  }
};

export const inserReportToTable = async (pdfUrl: string, pdfReport: object,userId:string) => {
  // const user = useUserStore(state => state.user);
  try {
    const { data, error } = await supabase
      .from('file_to_report')
      .insert([{ fileLink: pdfUrl, report: pdfReport,userId:userId }])
      .select();
    if (error) {
      console.error('Supabase insert error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};

export const getUserReports = async (): Promise<any[] | null> => {
  const user = auth().currentUser;
  console.log(user);
  if (!user) {
    console.error('No user in store. Make sure user is set after login.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('file_to_report')
      .select('*')
      .eq('userId', user.uid);

    if (error) {
      console.error('Error fetching reports:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};