// src/features/legal/screens/PrivacyScreen.tsx
// Gizlilik Politikası Ekranı

import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';

/**
 * Privacy Policy Screen
 */
export const PrivacyScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.backButtonText, { color: colors.text.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Gizlilik Politikası
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: colors.text.secondary }]}>
          Son Güncelleme: 6 Aralık 2025
        </Text>

        <Text style={[styles.intro, { color: colors.text.secondary }]}>
          Meslektaş olarak gizliliğinizi ciddiye alıyoruz. Bu politika, kişisel verilerinizin nasıl
          toplandığını, kullanıldığını ve korunduğunu açıklar.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          1. Toplanan Bilgiler
        </Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Platform kullanımınız sırasında aşağıdaki bilgiler toplanır:
          {'\n\n'}• Kişisel Bilgiler: Ad, soyad, e-posta, telefon numarası
          {'\n'}• Meslek Bilgileri: Meslek, diploma/sertifika bilgileri
          {'\n'}• Kimlik Doğrulama: Kimlik belgesi fotoğrafları (şifrelenmiş)
          {'\n'}• Kullanım Verileri: Platform etkileşimleri, tercihler
          {'\n'}• Teknik Veriler: IP adresi, cihaz bilgileri, konum (opsiyonel)
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          2. Verilerin Kullanımı
        </Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Toplanan veriler şu amaçlarla kullanılır:
          {'\n\n'}• Kimlik doğrulama ve hesap güvenliği
          {'\n'}• Platform hizmetlerinin sunulması
          {'\n'}• Kullanıcı deneyiminin iyileştirilmesi
          {'\n'}• Güvenlik ve dolandırıcılık önleme
          {'\n'}• Yasal yükümlülüklerin yerine getirilmesi
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          3. AI Destekli Kimlik Doğrulama
        </Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Kimlik doğrulama sürecinde AI teknolojisi kullanılır. Yüklediğiniz belge fotoğrafları:
          {'\n\n'}• Şifrelenmiş olarak saklanır
          {'\n'}• Sadece doğrulama amacıyla kullanılır
          {'\n'}• Üçüncü taraflarla paylaşılmaz
          {'\n'}• Doğrulama sonrası güvenli şekilde arşivlenir
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>4. Veri Paylaşımı</Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
          {'\n\n'}• Yasal zorunluluklar
          {'\n'}• Hizmet sağlayıcılar (AWS, veri güvenliği sağlayıcıları)
          {'\n'}• Açık rızanız dahilinde
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>5. Veri Güvenliği</Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Verilerinizin güvenliği için:
          {'\n\n'}• End-to-end şifreleme
          {'\n'}• Güvenli sunucu altyapısı (AWS)
          {'\n'}• Düzenli güvenlik denetimleri
          {'\n'}• İki faktörlü kimlik doğrulama
          {'\n'}• KVKK uyumluluk
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>6. KVKK Hakları</Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Kişisel Verilerin Korunması Kanunu kapsamında haklarınız:
          {'\n\n'}• Kişisel verilerinizin işlenip işlenmediğini öğrenme
          {'\n'}• İşlenmişse buna ilişkin bilgi talep etme
          {'\n'}• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
          {'\n'}• Yurt içinde veya yurt dışında aktarıldığı 3. kişileri bilme
          {'\n'}• Verilerin düzeltilmesini veya silinmesini talep etme
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>7. Çerezler</Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Platform deneyimini iyileştirmek için çerezler kullanılır. Çerez tercihlerinizi ayarlardan
          yönetebilirsiniz.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          8. Veri Saklama Süresi
        </Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Kişisel verileriniz, yasal zorunluluklar ve işleme amacı ortadan kalkana kadar saklanır.
          Hesabınızı sildiğinizde, verileriniz 30 gün içinde sistemden kalıcı olarak silinir.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>9. İletişim</Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Gizlilik politikası ve kişisel verileriniz hakkında sorularınız için:
          {'\n\n'}E-posta: privacy@meslektas.com
          {'\n'}Veri Sorumlusu: Meslektaş Teknoloji A.Ş.
        </Text>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 0,
  },
  backButtonText: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  intro: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
});
