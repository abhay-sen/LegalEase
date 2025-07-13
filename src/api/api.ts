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

  const json = await res.json();

  // Clean markdown fences if present
  const cleaned = json.report
    .replace(/^```json\s*/, '')
    .replace(/```$/, '')
    .trim();
  return JSON.parse(cleaned);
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