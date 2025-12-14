# Odaklanma Takibi ve Raporlama Uygulaması

**BSM 447 - Mobil Uygulama Geliştirme Dersi Dönem Projesi**

React Native (Expo) kullanılarak geliştirilmiş bir odaklanma takip uygulaması. Pomodoro tekniği benzeri zamanlayıcı ile kullanıcının dikkat dağınıklığını izler ve detaylı raporlar sunar.

## 📋 Proje Özellikleri

### ✅ Tamamlanan Özellikler

#### 1. Ana Sayfa (Zamanlayıcı)
- ⏱️ Ayarlanabilir geri sayım zamanlayıcısı (15, 25, 45, 60 dakika)
- ▶️ Başlat, Duraklat, Sıfırla butonları
- 📁 Kategori seçimi (Ders Çalışma, Kodlama, Proje, Kitap Okuma, Diğer)
- 📊 Seans özeti gösterimi
- 🎯 Görsel progress ring ve progress bar

#### 2. Dikkat Dağınıklığı Takibi
- 📱 **AppState API** kullanılarak arka plan takibi
- 🚨 Kullanıcı uygulamadan çıktığında otomatik sayaç durdurma
- 📈 Dikkat dağınıklığı sayacı
- ⚠️ Uyarı bildirimleri

#### 3. Raporlar Ekranı
- 📊 Bugünkü toplam odaklanma süresi
- 🏆 Tüm zamanların toplam odaklanma süresi
- ⚡ Toplam dikkat dağınıklığı sayısı
- 📈 Son 7 günün çubuk grafiği (Bar Chart)
- 🥧 Kategorilere göre pasta grafiği (Pie Chart)
- 🔄 Pull-to-refresh desteği

#### 4. Veri Yönetimi
- 💾 **AsyncStorage** ile kalıcı veri saklama
- 📦 Seans geçmişi kaydı
- 🗑️ Veri temizleme özelliği (test için)

## 🛠️ Kullanılan Teknolojiler

- **React Native** (Expo SDK 54)
- **React Navigation** - Tab Navigator
- **AsyncStorage** - Veri saklama
- **React Native Chart Kit** - Grafikler
- **React Native SVG** - Grafik desteği

## 📁 Proje Yapısı

```
odaklanma-takibi-raporlama/
├── App.js                      # Ana uygulama ve navigasyon
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js       # Zamanlayıcı ekranı
│   │   └── ReportsScreen.js    # Raporlar ekranı
│   ├── storage/
│   │   └── SessionStorage.js   # AsyncStorage yönetimi
│   └── utils/
│       ├── constants.js        # Sabitler ve kategoriler
│       └── timeUtils.js        # Zaman formatlama fonksiyonları
├── package.json
└── README.md
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn
- Expo Go uygulaması (mobil cihazda)

### Adımlar

1. **Projeyi klonlayın veya indirin**
```bash
git clone <repository-url>
cd odaklanma-takibi-raporlama
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Uygulamayı başlatın**
```bash
npx expo start
```

4. **Telefonunuzda Çalıştırın**
   - Android: Expo Go uygulamasını açın ve QR kodu tarayın
   - iOS: Kamera uygulamasıyla QR kodu tarayın

### Alternatif Çalıştırma Komutları
```bash
npm run android    # Android emülatör
npm run ios        # iOS simulator (sadece macOS)
npm run web        # Web tarayıcı
```

## 📱 Kullanım Kılavuzu

### 1. Odaklanma Seansı Başlatma
1. Ana sayfada bir kategori seçin
2. İstediğiniz süreyi seçin (15, 25, 45 veya 60 dk)
3. "Başlat" butonuna tıklayın
4. Odaklanmaya başlayın!

### 2. Dikkat Dağınıklığı Takibi
- Seans sırasında uygulamadan çıkarsanız:
  - Zamanlayıcı otomatik durur
  - Dikkat dağınıklığı sayacı artar
  - Bir uyarı mesajı alırsınız

### 3. Raporları Görüntüleme
1. Alt menüden "Raporlar" sekmesine geçin
2. İstatistiklerinizi görüntüleyin:
   - Bugün ne kadar çalıştığınız
   - Tüm zamanların toplamı
   - Dikkat dağınıklığı sayınız
3. Grafikleri inceleyin:
   - Son 7 günün performansı
   - Hangi kategorilerde ne kadar zaman harcadığınız

## 🎨 Özellikler ve Fonksiyonlar

### Ana Sayfa Özellikleri
- ⏱️ Geri sayım zamanlayıcısı
- 🎯 Görsel progress göstergeleri
- 📊 Dikkat dağınıklığı sayacı
- 🎨 Kategori bazlı renkli arayüz
- ⚙️ Süre ayarlama (15-60 dk)
- 📝 Seans özeti modal'ı

### Raporlar Ekranı Özellikleri
- 📈 İstatistik kartları
- 📊 Bar chart (Son 7 gün)
- 🥧 Pie chart (Kategoriler)
- 🔄 Pull-to-refresh
- 🗑️ Veri temizleme (test)

## 🎓 Proje Gereksinimleri (Karşılanan)

### Teknik Gereksinimler
- ✅ Expo kullanılarak geliştirildi
- ✅ Component bazlı yapı
- ✅ Temiz ve okunabilir kod
- ✅ Tab Navigator ile 2 ekran arası geçiş
- ✅ AsyncStorage ile veri saklama
- ✅ AppState API ile dikkat takibi
- ✅ React Native Chart Kit ile grafikler

### Fonksiyonel Gereksinimler
- ✅ Zamanlayıcı (25 dk ± ayarlanabilir)
- ✅ Başlat, Duraklat, Sıfırla butonları
- ✅ Kategori seçimi
- ✅ Seans özeti gösterimi
- ✅ Dikkat dağınıklığı takibi
- ✅ Bugün toplam odaklanma süresi
- ✅ Tüm zamanların toplam süresi
- ✅ Toplam dikkat dağınıklığı sayısı
- ✅ Son 7 gün bar chart
- ✅ Kategori bazlı pie chart

## 🐛 Bilinen Sorunlar ve Çözümler

### Sorun: Grafik Görünmüyor
**Çözüm:** Önce birkaç seans tamamlayın, ardından raporlar ekranında yukarıdan aşağı kaydırarak yenileyin.

### Sorun: Zamanlayıcı Durmuyor
**Çözüm:** Uygulamayı tamamen kapatıp yeniden açın.

## 📝 Geliştirici Notları

### Veri Yapısı
Her seans aşağıdaki bilgileri içerir:
```javascript
{
  id: "timestamp",
  category: "kodlama",
  duration: 1500, // saniye
  distractions: 2,
  date: "2025-12-12T10:30:00.000Z"
}
```

### Test Etme
Veri temizleme özelliği test amaçlıdır. Raporlar ekranının en altındaki "Tüm Verileri Temizle" butonunu kullanabilirsiniz.

## 🚀 Gelecek Geliştirmeler (Opsiyonel)

- 🔔 Push notification desteği
- 🌙 Dark mode
- 📱 Widget desteği
- ☁️ Cloud senkronizasyon
- 🏅 Başarı rozetleri
- 📅 Haftalık/Aylık raporlar
- 🎵 Odaklanma müziği entegrasyonu

## 👨‍💻 Geliştirici

**Tarık**  
Sakarya Üniversitesi - Bilgisayar Mühendisliği  
BSM 447 - Mobil Uygulama Geliştirme

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

---

**Not:** Bu uygulama Sakarya Üniversitesi Bilgisayar Mühendisliği Bölümü BSM 447 Mobil Uygulama Geliştirme dersi dönem projesi olarak hazırlanmıştır.
