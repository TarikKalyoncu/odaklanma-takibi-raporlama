import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  Modal,
  ScrollView,
  Alert,
  Switch, // EKLENDİ
  StatusBar, // EKLENDİ (Üst bar rengini değiştirmek için)
} from 'react-native';
import { CATEGORIES, DEFAULT_DURATION } from '../utils/constants'; // COLORS buradan silindi, context'ten gelecek
import { formatTime, minutesToSeconds } from '../utils/timeUtils';
import { saveSession } from '../storage/SessionStorage';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  // TEMA HOOK'UNU ÇAĞIRIYORUZ
  const { theme, isDarkMode, toggleTheme } = useTheme(); 
  
  // Stilleri tema rengine göre yeniden oluşturuyoruz
  const styles = createStyles(theme); 

  const [timeLeft, setTimeLeft] = useState(minutesToSeconds(DEFAULT_DURATION));
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [distractions, setDistractions] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [customMinutes, setCustomMinutes] = useState(DEFAULT_DURATION);

  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const totalDuration = useRef(minutesToSeconds(DEFAULT_DURATION));
  
  // Zamanlayıcı
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // AppState Listener - Dikkat Dağınıklığı Takibi
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Eğer uygulama çalışıyorsa ve arka plana giderse
      if (
        isRunning &&
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        setDistractions((prev) => prev + 1);
        setIsRunning(false);
        Alert.alert(
          'Dikkat Dağınıklığı!',
          'Uygulamadan çıktınız. Zamanlayıcı durakladı.',
          [{ text: 'Tamam' }]
        );
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isRunning]);

  const handleStart = () => {
    if (timeLeft === 0) {
      Alert.alert('Uyarı', 'Lütfen önce zamanlayıcıyı sıfırlayın.');
      return;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalDuration.current);
    setDistractions(0);
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    const completedDuration = totalDuration.current - timeLeft;
    const summary = {
      category: selectedCategory.label,
      duration: completedDuration,
      distractions,
      completed: timeLeft === 0,
    };

    // Veritabanına kaydet
    try {
      await saveSession({
        category: selectedCategory.value,
        duration: completedDuration,
        distractions,
      });
    } catch (error) {
      console.error('Seans kaydetme hatası:', error);
    }

    setSessionSummary(summary);
    setShowSummary(true);
  };

  const handleSaveAndReset = () => {
    setShowSummary(false);
    handleReset();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handleDurationChange = (minutes) => {
    const newDuration = minutesToSeconds(minutes);
    setCustomMinutes(minutes);
    setTimeLeft(newDuration);
    totalDuration.current = newDuration;
  };

  const progress = ((totalDuration.current - timeLeft) / totalDuration.current) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* BAŞLIK VE SWITCH ALANI */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Odaklanma Takibi</Text>
        <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{isDarkMode ? '🌙' : '☀️'}</Text>
            <Switch
                trackColor={{ false: "#767577", true: theme.primary }}
                thumbColor={isDarkMode ? theme.white : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleTheme}
                value={isDarkMode}
            />
        </View>
      </View>

      {/* Geri kalan JSX yapısı neredeyse aynı, sadece style nesnesi artık dinamik */}
      
      {/* Kategori Seçici */}
      <TouchableOpacity
        style={[styles.categoryButton, { backgroundColor: selectedCategory.color }]}
        onPress={() => setShowCategoryModal(true)}
        disabled={isRunning}
      >
        <Text style={styles.categoryIcon}>{selectedCategory.icon}</Text>
        <Text style={styles.categoryText}>{selectedCategory.label}</Text>
      </TouchableOpacity>

      {/* ... Diğer kodlar (Süre ayarlayıcı, Zamanlayıcı vb.) aynı ... */}
      
      {!isRunning && (
        <View style={styles.durationSelector}>
          <Text style={styles.durationLabel}>Süre Ayarla:</Text>
          <View style={styles.durationButtons}>
            {[15, 25, 45, 60].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.durationButton,
                  customMinutes === minutes && styles.durationButtonActive,
                ]}
                onPress={() => {
                    const newDuration = minutesToSeconds(minutes);
                    setCustomMinutes(minutes);
                    setTimeLeft(newDuration);
                    totalDuration.current = newDuration;
                }}
              >
                <Text
                  style={[
                    styles.durationButtonText,
                    customMinutes === minutes && styles.durationButtonTextActive,
                  ]}
                >
                  {minutes}dk
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Zamanlayıcı */}
      <View style={styles.timerContainer}>
        <View style={[styles.progressRing, { borderColor: selectedCategory.color }]}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: selectedCategory.color }]} />
        </View>
      </View>

      {/* Dikkat Dağınıklığı Sayacı */}
      <View style={styles.distractionsContainer}>
        <Text style={styles.distractionsLabel}>Dikkat Dağınıklığı</Text>
        <Text style={styles.distractionsCount}>{distractions}</Text>
      </View>

      {/* Kontrol Butonları */}
      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={() => setIsRunning(true)}>
            <Text style={styles.buttonText}>▶ Başlat</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={() => setIsRunning(false)}>
            <Text style={styles.buttonText}>⏸ Duraklat</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={() => {
            setIsRunning(false);
            setTimeLeft(totalDuration.current);
            setDistractions(0);
        }}>
          <Text style={styles.buttonText}>↻ Sıfırla</Text>
        </TouchableOpacity>
      </View>
      
      {/* ... Modallar aynı kalacak ... */}
      
    </View>
  );
}

// STİLLERİ ARTIK BİR FONKSİYON OLARAK TANIMLIYORUZ
// Bu sayede 'theme' değiştiğinde renkler de değişecek
const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light, // Dinamik
    padding: 20,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 8,
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.dark, // Dinamik
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 30,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // Bu sabit kalabilir
  },
  durationSelector: {
    width: '100%',
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.dark, // Dinamik
    marginBottom: 10,
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: theme.white, // Dinamik
    borderWidth: 2,
    borderColor: theme.gray, // Dinamik
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: theme.primary,
    backgroundColor: theme.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.gray, // Dinamik
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
    width: '100%',
  },
  progressRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.white, // Dinamik
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: theme.dark, // Dinamik
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: theme.white, // Dinamik
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  distractionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white, // Dinamik
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    justifyContent: 'space-between',
  },
  distractionsLabel: {
    fontSize: 16,
    color: theme.gray, // Dinamik
  },
  distractionsCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.danger,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  button: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  startButton: {
    backgroundColor: theme.success,
  },
  pauseButton: {
    backgroundColor: theme.warning,
  },
  resetButton: {
    backgroundColor: theme.gray,
  },
  completeButton: {
    backgroundColor: theme.primary,
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal stillerini de güncellemek gerekebilir ancak şimdilik temel UI yeterli
});