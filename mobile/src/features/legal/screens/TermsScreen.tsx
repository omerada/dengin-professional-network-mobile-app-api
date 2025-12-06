// src/features/legal/screens/TermsScreen.tsx
// Kullanım Koşulları Ekranı

import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';

/**
 * Terms of Service Screen
 */
export const TermsScreen: React.FC = () => {
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
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.background.secondary,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={[styles.backButtonText, { color: colors.text.primary }]}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Kullanım Koşulları</Text>
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

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>1. Kabul</Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Meslektaş platformunu kullanarak, işbu Kullanım Koşullarını kabul etmiş sayılırsınız. Bu
          koşulları kabul etmiyorsanız, lütfen platformu kullanmayın.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          2. Hesap Oluşturma
        </Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Meslektaş&apos;ta hesap oluşturmak için 18 yaşında veya daha büyük olmalısınız.
          Hesabınızın güvenliğinden siz sorumlusunuz ve şifrenizi gizli tutmalısınız.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          3. Kimlik Doğrulama
        </Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Platformumuz, AI destekli kimlik doğrulama sistemi kullanır. Doğrulama sürecinde
          sağladığınız bilgilerin doğru ve güncel olması gerekmektedir. Sahte kimlik veya belge
          kullanımı hesabınızın kalıcı olarak kapatılmasına neden olur.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          4. İçerik Politikası
        </Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Platformda paylaştığınız içeriklerden siz sorumlusunuz. Yasadışı, zararlı, taciz edici,
          iftira niteliğinde veya başkalarının haklarını ihlal eden içerik paylaşamazsınız.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          5. Gizlilik ve Veri Koruma
        </Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Kişisel verileriniz KVKK kapsamında korunur. Detaylı bilgi için Gizlilik Politikamızı
          inceleyebilirsiniz.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>6. Fikri Mülkiyet</Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Platform üzerindeki tüm içerik, tasarım, logo ve markalar Meslektaş&apos;ın
          mülkiyetindedir. İzinsiz kullanım yasaktır.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>7. Hesap İptali</Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Kullanım koşullarını ihlal ettiğiniz tespit edilirse, hesabınız uyarı vermeksizin askıya
          alınabilir veya kapatılabilir.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          8. Sorumluluk Reddi
        </Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Meslektaş, platformun kesintisiz ve hatasız çalışacağını garanti etmez. Kullanıcılar arası
          etkileşimlerden doğan zararlardan sorumlu tutulamaz.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>9. İletişim</Text>
        <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
          Kullanım koşulları hakkında sorularınız için: info@meslektas.com
        </Text>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 32,
    fontWeight: '300',
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
  lastUpdated: {
    fontSize: 14,
    marginBottom: spacing.xl,
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
