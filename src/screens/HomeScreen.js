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
} from 'react-native';
import { CATEGORIES, DEFAULT_DURATION, COLORS } from '../utils/constants';
import { formatTime, minutesToSeconds } from '../utils/timeUtils';
import { saveSession } from '../storage/SessionStorage';

export default function HomeScreen() {
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
      <Text style={styles.title}>Odaklanma Takibi</Text>

      {/* Kategori Seçici */}
      <TouchableOpacity
        style={[styles.categoryButton, { backgroundColor: selectedCategory.color }]}
        onPress={() => setShowCategoryModal(true)}
        disabled={isRunning}
      >
        <Text style={styles.categoryIcon}>{selectedCategory.icon}</Text>
        <Text style={styles.categoryText}>{selectedCategory.label}</Text>
      </TouchableOpacity>

      {/* Süre Ayarlayıcı */}
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
                onPress={() => handleDurationChange(minutes)}
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
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStart}>
            <Text style={styles.buttonText}>▶ Başlat</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={handlePause}>
            <Text style={styles.buttonText}>⏸ Duraklat</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>↻ Sıfırla</Text>
        </TouchableOpacity>
      </View>

      {isRunning && timeLeft < totalDuration.current && (
        <TouchableOpacity style={[styles.button, styles.completeButton]} onPress={handleSessionComplete}>
          <Text style={styles.buttonText}>✓ Seansı Bitir</Text>
        </TouchableOpacity>
      )}

      {/* Kategori Seçim Modal */}
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

      {/* Seans Özeti Modal */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 40,
    marginBottom: 20,
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
    color: COLORS.white,
  },
  durationSelector: {
    width: '100%',
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
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
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray,
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  durationButtonTextActive: {
    color: COLORS.white,
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
    backgroundColor: COLORS.white,
  },
  timerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    justifyContent: 'space-between',
  },
  distractionsLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  distractionsCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.danger,
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
    backgroundColor: COLORS.success,
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
  },
  resetButton: {
    backgroundColor: COLORS.gray,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
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
    color: COLORS.dark,
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
    color: COLORS.white,
  },
  closeButton: {
    backgroundColor: COLORS.gray,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    width: '85%',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: COLORS.dark,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  summaryButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  summaryButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
