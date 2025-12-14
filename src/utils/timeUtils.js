/**
 * Saniyeyi dakika:saniye formatına çevirir
 * @param {number} seconds - Saniye
 * @returns {string} MM:SS formatında string
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Saniyeyi saat:dakika formatına çevirir
 * @param {number} seconds - Saniye
 * @returns {string} HH:MM formatında string
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}s ${mins}dk`;
  }
  return `${mins}dk`;
};

/**
 * Tarihi gün formatına çevirir (örn: "12 Ara")
 * @param {string} dateString - ISO date string
 * @returns {string} Formatlanmış tarih
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

/**
 * Dakika cinsinden zamanı saniyeye çevirir
 * @param {number} minutes - Dakika
 * @returns {number} Saniye
 */
export const minutesToSeconds = (minutes) => {
  return minutes * 60;
};
