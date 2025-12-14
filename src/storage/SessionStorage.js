import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@focus_sessions';

/**
 * Yeni bir odaklanma seansı kaydeder
 * @param {Object} session - Seans bilgileri
 * @param {string} session.category - Kategori (Ders, Kodlama, vb.)
 * @param {number} session.duration - Süre (saniye)
 * @param {number} session.distractions - Dikkat dağınıklığı sayısı
 * @param {string} session.date - Tarih (ISO string)
 */
export const saveSession = async (session) => {
  try {
    const existingSessions = await getSessions();
    const newSession = {
      id: Date.now().toString(),
      ...session,
      date: session.date || new Date().toISOString(),
    };
    
    const updatedSessions = [...existingSessions, newSession];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
    return newSession;
  } catch (error) {
    console.error('Seans kaydetme hatası:', error);
    throw error;
  }
};

/**
 * Tüm seansları getirir
 * @returns {Array} Seanslar dizisi
 */
export const getSessions = async () => {
  try {
    const sessions = await AsyncStorage.getItem(SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Seansları getirme hatası:', error);
    return [];
  }
};

/**
 * Bugünkü seansları getirir
 * @returns {Array} Bugünkü seanslar
 */
export const getTodaySessions = async () => {
  try {
    const allSessions = await getSessions();
    const today = new Date().toDateString();
    
    return allSessions.filter(session => {
      const sessionDate = new Date(session.date).toDateString();
      return sessionDate === today;
    });
  } catch (error) {
    console.error('Bugünkü seansları getirme hatası:', error);
    return [];
  }
};

/**
 * Son 7 günün seanslarını getirir
 * @returns {Array} Son 7 günün seansları
 */
export const getLastSevenDaysSessions = async () => {
  try {
    const allSessions = await getSessions();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return allSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= sevenDaysAgo;
    });
  } catch (error) {
    console.error('Son 7 günün seanslarını getirme hatası:', error);
    return [];
  }
};

/**
 * Tüm seansları siler (test amaçlı)
 */
export const clearAllSessions = async () => {
  try {
    await AsyncStorage.removeItem(SESSIONS_KEY);
  } catch (error) {
    console.error('Seansları silme hatası:', error);
  }
};
