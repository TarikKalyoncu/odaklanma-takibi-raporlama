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
  Switch,
  StatusBar,
  Vibration, // Titreşim için ekledik (İstersen kaldırabilirsin)
} from 'react-native';
import { CATEGORIES, DEFAULT_DURATION } from '../utils/constants';
import { formatTime, minutesToSeconds } from '../utils/timeUtils';
import { saveSession } from '../storage/SessionStorage';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
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
      if (
        isRunning &&
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // Uyarı titreşimi
        Vibration.vibrate(500);
        
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

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    // Bitiş titreşimi
    Vibration.vibrate([0, 500, 200, 500]); 

    const completedDuration = totalDuration.current - timeLeft;
    const summary = {
      category: selectedCategory.label,
      duration: completedDuration,
      distractions,
      completed: timeLeft === 0,
    };

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
    setIsRunning(false);
    setTimeLeft(totalDuration.current);
    setDistractions(0);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const progress = ((totalDuration.current - timeLeft) / totalDuration.current) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* HEADER & SWITCH */}
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

      {/* KATEGORİ SEÇİCİ BUTON (ARADIĞIN BUTON BURADA) */}
      <TouchableOpacity
        style={[styles.categoryButton, { backgroundColor: selectedCategory.color }]}
        onPress={() => setShowCategoryModal(true)}
        disabled={isRunning}
      >
        <Text style={styles.categoryIcon}>{selectedCategory.icon}</Text>
        <Text style={styles.categoryText}>{selectedCategory.label}</Text>
      </TouchableOpacity>

      {/* SÜRE SEÇİCİ */}
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

      {/* ZAMANLAYICI */}
      <View style={styles.timerContainer}>
        <View style={[styles.progressRing, { borderColor: selectedCategory.color }]}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: selectedCategory.color }]} />
        </View>
      </View>

      {/* DİKKAT DAĞINIKLIĞI */}
      <View style={styles.distractionsContainer}>
        <Text style={styles.distractionsLabel}>Dikkat Dağınıklığı</Text>
        <Text style={styles.distractionsCount}>{distractions}</Text>
      </View>

      {/* KONTROLLER */}
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

      {isRunning && timeLeft < totalDuration.current && (
        <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={handleSessionComplete}>
          <Text style={styles.buttonText}>✓ Seansı Bitir</Text>
        </TouchableOpacity>
      )}
      
      {/* --- EKSİK OLAN KISIMLAR AŞAĞIDAYDI, ŞİMDİ EKLENDİ --- */}

      {/* KATEGORİ MODALI */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategori Seç</Text>
            <ScrollView>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={[styles.categoryOption, { backgroundColor: category.color }]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                  <Text style={styles.categoryOptionText}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.closeButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ÖZET MODALI */}
      <Modal
        visible={showSummary}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSummary(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>
              {sessionSummary?.completed ? '🎉 Tebrikler!' : '📊 Seans Özeti'}
            </Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Kategori:</Text>
              <Text style={styles.summaryValue}>{sessionSummary?.category}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Süre:</Text>
              <Text style={styles.summaryValue}>
                {sessionSummary ? Math.floor(sessionSummary.duration / 60) : 0} dakika
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Dikkat Dağınıklığı:</Text>
              <Text style={styles.summaryValue}>{sessionSummary?.distractions}</Text>
            </View>
            <TouchableOpacity style={styles.summaryButton} onPress={handleSaveAndReset}>
              <Text style={styles.summaryButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light,
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
    color: theme.dark,
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
    color: '#FFFFFF',
  },
  durationSelector: {
    width: '100%',
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.dark,
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
    backgroundColor: theme.white,
    borderWidth: 2,
    borderColor: theme.gray,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: theme.primary,
    backgroundColor: theme.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.gray,
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
    backgroundColor: theme.white,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: theme.dark,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: theme.white,
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
    backgroundColor: theme.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    justifyContent: 'space-between',
  },
  distractionsLabel: {
    fontSize: 16,
    color: theme.gray,
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
  // Modal stilleri (KODDA EKSİKTİ, EKLENDİ)
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.white,
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: theme.dark,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryOptionIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  categoryOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: theme.gray,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContent: {
    backgroundColor: theme.white,
    borderRadius: 20,
    padding: 30,
    width: '85%',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: theme.dark,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.light,
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.gray,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.dark,
  },
  summaryButton: {
    backgroundColor: theme.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  summaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});