import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import {
  getSessions,
  getTodaySessions,
  getLastSevenDaysSessions,
  clearAllSessions,
} from '../storage/SessionStorage';
import { formatDuration, formatDate } from '../utils/timeUtils';
import { CATEGORIES, COLORS } from '../utils/constants';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const [todayTotal, setTodayTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [totalDistractions, setTotalDistractions] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Bugünkü toplam
      const todaySessions = await getTodaySessions();
      const todaySum = todaySessions.reduce((sum, session) => sum + session.duration, 0);
      setTodayTotal(todaySum);

      // Tüm zamanlar toplamı
      const allSessions = await getSessions();
      const allSum = allSessions.reduce((sum, session) => sum + session.duration, 0);
      setAllTimeTotal(allSum);

      // Toplam dikkat dağınıklığı
      const distractionsSum = allSessions.reduce((sum, session) => sum + session.distractions, 0);
      setTotalDistractions(distractionsSum);

      // Son 7 gün verileri
      const last7Days = await getLastSevenDaysSessions();
      processWeeklyData(last7Days);

      // Kategori bazlı veriler
      processCategoryData(allSessions);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const processWeeklyData = (sessions) => {
    const last7DaysMap = {};
    const today = new Date();

    // Son 7 günü başlat
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      last7DaysMap[dateStr] = { duration: 0, label: formatDate(date.toISOString()) };
    }

    // Seansları gruplama
    sessions.forEach((session) => {
      const sessionDate = new Date(session.date).toDateString();
      if (last7DaysMap[sessionDate]) {
        last7DaysMap[sessionDate].duration += session.duration;
      }
    });

    const chartData = Object.values(last7DaysMap).map((day) => ({
      label: day.label,
      value: Math.round(day.duration / 60), // dakikaya çevir
    }));

    setWeeklyData(chartData);
  };

  const processCategoryData = (sessions) => {
    const categoryMap = {};

    CATEGORIES.forEach((cat) => {
      categoryMap[cat.value] = {
        name: cat.label,
        duration: 0,
        color: cat.color,
        legendFontColor: COLORS.dark,
        legendFontSize: 12,
      };
    });

    sessions.forEach((session) => {
      if (categoryMap[session.category]) {
        categoryMap[session.category].duration += session.duration;
      }
    });

    const pieData = Object.values(categoryMap)
      .filter((cat) => cat.duration > 0)
      .map((cat) => ({
        name: cat.name,
        population: Math.round(cat.duration / 60), // dakikaya çevir
        color: cat.color,
        legendFontColor: cat.legendFontColor,
        legendFontSize: cat.legendFontSize,
      }));

    setCategoryData(pieData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClearData = async () => {
    await clearAllSessions();
    await loadData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Raporlar</Text>

      {/* Genel İstatistikler */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Bugün</Text>
          <Text style={styles.statValue}>{formatDuration(todayTotal)}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tüm Zamanlar</Text>
          <Text style={styles.statValue}>{formatDuration(allTimeTotal)}</Text>
        </View>

        <View style={[styles.statCard, styles.distractionCard]}>
          <Text style={styles.statLabel}>Dikkat Dağınıklığı</Text>
          <Text style={[styles.statValue, styles.distractionValue]}>{totalDistractions}</Text>
        </View>
      </View>

      {/* Son 7 Gün Çubuk Grafik */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Son 7 Gün Odaklanma Süresi (Dakika)</Text>
        {weeklyData.length > 0 ? (
          <BarChart
            data={{
              labels: weeklyData.map((d) => d.label),
              datasets: [
                {
                  data: weeklyData.map((d) => d.value),
                },
              ],
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: COLORS.primary,
              backgroundGradientFrom: COLORS.primary,
              backgroundGradientTo: COLORS.secondary,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 10,
              },
            }}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Henüz veri yok</Text>
          </View>
        )}
      </View>

      {/* Kategorilere Göre Pasta Grafik */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Kategorilere Göre Dağılım (Dakika)</Text>
        {categoryData.length > 0 ? (
          <PieChart
            data={categoryData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Henüz veri yok</Text>
          </View>
        )}
      </View>

      {/* Test Amaçlı Temizleme Butonu */}
      <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
        <Text style={styles.clearButtonText}>🗑️ Tüm Verileri Temizle (Test)</Text>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
}

