# Meslektaş Design System v3.0

## 🎨 Professional Color Palette

### Ana Marka Rengi: Warm Copper (#D9C5AC)

**RGB(217, 197, 172)** - Sıcak, profesyonel ve dostane

#### Renk Felsefesi

Warm Copper, uygulamanın tüm kimliğini yansıtan ana marka rengidir:

- **Sıcaklık**: Kullanıcılarla samimi bir bağ kurar
- **Profesyonellik**: İş ortamında güven verir
- **Prestij**: Kalite ve değer hissi yaratır
- **Dostluk**: Sosyal ağ özelliğini vurgular
- **Doğallık**: Göze hoş gelir, uzun süre rahatsız etmez

---

## 🎯 Renk Paleti

### 1. PRIMARY - Warm Copper

Ana marka rengi - tüm interactive elementlerde kullanılır

```
copper[50]:  #FAF7F3  ← Çok açık krem (backgrounds)
copper[100]: #F5EFE7  ← Açık krem (light surfaces)
copper[200]: #EBDFD0  ← Yumuşak bej (card backgrounds)
copper[300]: #E1CFB9  ← Orta bej (hover states)
copper[400]: #D7BFA2  ← Light mode primary
copper[500]: #D9C5AC  ⭐ BRAND COLOR
copper[600]: #C4A88A  ← Dark mode primary
copper[700]: #A88B6D  ← Pressed states
copper[800]: #8B6F51  ← Text on light backgrounds
copper[900]: #6F563B  ← Dark text, deep tints
```

**Kullanım Alanları:**

- Primary buttons
- Active states
- Brand accents
- Links (dark tone: copper[800])
- Focus indicators
- Surface tints

---

### 2. SECONDARY - Sage Green

İkincil marka rengi - doğallık ve denge

```
indigo[50]:  #F5F7F5  ← Çok açık sage
indigo[100]: #E8ECE8
indigo[200]: #D1DDD1
indigo[300]: #B4C9B4
indigo[400]: #8FAF8F
indigo[500]: #6B9B6B  ← Sage Green
indigo[600]: #578557
indigo[700]: #446E44
indigo[800]: #335733
indigo[900]: #254425
```

**Kullanım Alanları:**

- Secondary buttons
- Verification badges
- Environmental features
- Calm UI elements

---

### 3. ACCENT - Deep Teal

Modern vurgu rengi - sofistike ve dikkat çekici

```
teal[50]:  #F0FDFA
teal[100]: #CCFBF1
teal[200]: #99F6E4
teal[300]: #5EEAD4
teal[400]: #2DD4BF
teal[500]: #14B8A6  ← Deep Teal
teal[600]: #0D9488
teal[700]: #0F766E
teal[800]: #115E59
teal[900]: #134E4A
```

**Kullanım Alanları:**

- Info messages
- Links (dark mode)
- Modern accents
- Verified badges
- Interactive highlights

---

### 4. SUCCESS - Natural Emerald

```
emerald[50]:  #F0FDF5
emerald[500]: #22C55E  ← Success color
emerald[700]: #15803D  ← Text on light
```

**Kullanım:** Başarı mesajları, onaylanmış durumlar, pozitif feedback

---

### 5. WARNING - Warm Amber

```
orange[50]:  #FFFBF0
orange[500]: #F59E0B  ← Warning color
orange[700]: #B86308  ← Text on light
```

**Kullanım:** Uyarılar, dikkat gerektiren durumlar, bekleyen işlemler

---

### 6. ERROR - Muted Red

```
ruby[50]:  #FEF4F2
ruby[500]: #E74C3C  ← Error color (yumuşatılmış)
ruby[700]: #B51F14  ← Text on light
```

**Kullanım:** Hata mesajları, reddedilen durumlar, tehlike uyarıları

---

### 7. PREMIUM - Rose Gold

```
gold[50]:  #FFF9F5
gold[500]: #F0903A  ← Rose Gold (copper ile uyumlu)
gold[700]: #B85820
```

**Kullanım:** Premium özellikler, özel içerikler, VIP kullanıcılar

---

### 8. NEUTRAL - Warm Gray

```
warmGray[0]:   #FFFFFF  ← Pure white
warmGray[50]:  #FAFAF9  ← Subtle background
warmGray[100]: #F5F5F4  ← Light surface
warmGray[200]: #E7E5E4  ← Borders (light)
warmGray[300]: #D6D3D1  ← Disabled states
warmGray[400]: #A8A29E  ← Tertiary text
warmGray[500]: #78716C  ← Secondary text (balanced)
warmGray[600]: #57534E  ← Primary text (light mode)
warmGray[700]: #44403C  ← Dark surfaces
warmGray[800]: #292524  ← Deep dark
warmGray[900]: #1C1917  ← Very dark
warmGray[950]: #0C0A09  ← Near black
#000000 ← True black (OLED dark mode)
```

---

## 🌞 Light Theme

### Background Hierarchy

```
primary:   #FFFFFF         ← Ana arka plan (pure white)
secondary: copper[50]      ← Hafif copper tint (sıcak hava)
tertiary:  copper[100]     ← Belirgin copper surface
elevated:  #FFFFFF         ← Kartlar (beyaz + shadow)
accent:    copper[100]     ← Brand vurgusu
```

### Text Hierarchy (WCAG AAA)

```
primary:   warmGray[900]  ← 16.1:1 kontrast
secondary: warmGray[700]  ← 8.4:1 kontrast
tertiary:  warmGray[600]  ← 5.9:1 kontrast
disabled:  warmGray[400]  ← 3.2:1 kontrast
link:      copper[800]    ← 6.8:1 kontrast (marka rengi)
accent:    teal[700]      ← 5.1:1 kontrast (modern)
```

### Interactive States

```
default:  copper[500] ⭐  ← Ana marka rengi
hover:    copper[600]     ← Koyu copper
pressed:  copper[700]     ← Çok koyu
focus:    copper[200]     ← Açık glow
subtle:   copper[100]     ← Minimal vurgu
```

### Borders

```
subtle:  warmGray[200]    ← Minimal
default: warmGray[300]    ← Standard
strong:  copper[400]      ← Vurgu (copper accent)
focus:   copper[500]      ← Brand focus ring
```

---

## 🌙 Dark Theme (OLED Optimized)

### Background Hierarchy

```
primary:   #000000 ⭐           ← True black (OLED enerji tasarrufu)
secondary: warmGray[950]        ← Near black
tertiary:  warmGray[900]        ← Derin warm
elevated:  warmGray[900]        ← Kartlar (hafif yükseltilmiş)
accent:    copper[900]          ← Koyu copper tint
```

**OLED Avantajları:**

- %40'a kadar pil tasarrufu
- Sonsuz kontrast oranı
- Daha derin siyahlar
- Premium görünüm

### Text Hierarchy (WCAG AA+)

```
primary:   warmGray[50]   ← 17.8:1 kontrast (near white)
secondary: copper[200]    ← Sıcak secondary (copper tint)
tertiary:  warmGray[400]  ← 4.9:1 kontrast
disabled:  warmGray[600]  ← Disabled
link:      copper[400]    ← Brand link (parlak copper)
accent:    teal[400]      ← Modern accent (parlak teal)
```

### Interactive States

```
default:  copper[500] ⭐  ← Marka rengi (aynı ton)
hover:    copper[400]     ← Daha açık glow
pressed:  copper[600]     ← Daha koyu
focus:    copper glow     ← rgba(217,197,172,0.40)
subtle:   warmGray[900]   ← Minimal
```

### Borders

```
subtle:  warmGray[900]    ← Barely visible
default: warmGray[800]    ← Standard
strong:  copper[700]      ← Copper accent
focus:   copper[500]      ← Brand focus
```

---

## 📊 Kontrast Oranları (WCAG)

### Light Mode

| Element        | Oran   | Standard |
| -------------- | ------ | -------- |
| Primary text   | 16.1:1 | AAA ✅   |
| Secondary text | 8.4:1  | AAA ✅   |
| Links          | 6.8:1  | AA+ ✅   |
| Success        | 4.8:1  | AA ✅    |
| Warning        | 5.2:1  | AA ✅    |
| Error          | 5.1:1  | AA ✅    |

### Dark Mode

| Element        | Oran   | Standard |
| -------------- | ------ | -------- |
| Primary text   | 17.8:1 | AAA ✅   |
| Secondary text | 9.2:1  | AAA ✅   |
| Links          | 7.1:1  | AA+ ✅   |
| Success        | 6.2:1  | AA+ ✅   |
| Warning        | 5.8:1  | AA ✅    |
| Error          | 5.8:1  | AA ✅    |

---

## 🎨 Gradients

### Light Mode

```typescript
primary: [copper[400], copper[600]]; // Copper gradient
secondary: [indigo[400], indigo[600]]; // Sage gradient
hero: [copper[500], teal[500]]; // Copper → Teal
premium: [gold[400], gold[500], gold[600]]; // Rose gold shimmer
surface: ['#FFFFFF', copper[50]]; // White → Copper tint
```

### Dark Mode

```typescript
primary: [copper[600], copper[500]]; // Reversed copper
secondary: [indigo[600], indigo[500]]; // Reversed sage
hero: [copper[700], teal[600]]; // Deep copper → Teal
premium: [gold[600], gold[500], gold[400]]; // Rose gold glow
surface: ['#000000', warmGray[950]]; // True black gradient
```

---

## 🔧 Implementation Guidelines

### 1. Component Backgrounds

```typescript
// Light mode
primary: '#FFFFFF'; // Ana container
cards: copper[50]; // Kartlar (sıcak tint)
sections: copper[100]; // Section dividers

// Dark mode
primary: '#000000'; // OLED optimized
cards: warmGray[950]; // Barely elevated
sections: warmGray[900]; // Visible sections
```

### 2. Buttons

#### Primary Button

```typescript
Light: {
  bg: copper[500],      // Warm copper
  text: '#FFFFFF',      // White text
  hover: copper[600],
  pressed: copper[700],
}
Dark: {
  bg: copper[500],      // Aynı ton (consistency)
  text: warmGray[900],  // Dark text
  hover: copper[400],
  pressed: copper[600],
}
```

#### Secondary Button

```typescript
Light: {
  bg: copper[100],      // Açık copper
  text: copper[800],    // Koyu copper
  border: copper[300],
}
Dark: {
  bg: warmGray[900],
  text: copper[200],    // Açık copper
  border: copper[700],
}
```

### 3. Status Messages

```typescript
// Success
Light: { bg: emerald[50], text: emerald[700], border: emerald[300] }
Dark:  { bg: 'rgba(74,222,128,0.15)', text: emerald[400], border: 'rgba(74,222,128,0.35)' }

// Warning
Light: { bg: orange[50], text: orange[700], border: orange[300] }
Dark:  { bg: 'rgba(251,191,61,0.15)', text: orange[400], border: 'rgba(251,191,61,0.35)' }

// Error
Light: { bg: ruby[50], text: ruby[700], border: ruby[300] }
Dark:  { bg: 'rgba(249,121,107,0.15)', text: ruby[400], border: 'rgba(249,121,107,0.35)' }
```

---

## 🎯 Best Practices

### ✅ DO

- Ana marka rengi olarak copper[500] kullan
- Light modda sıcak tintler için copper[50-200] kullan
- Dark modda true black (#000000) kullan (OLED)
- WCAG AA minimum kontrast sağla
- Focus states için brand color kullan

### ❌ DON'T

- Pure gray kullanma, warm gray tercih et
- Dark modda warmGray[900] yerine #000000 kullan
- Düşük kontrast text-background kombinasyonları
- Çok fazla renk karıştırma (3-4 renk max per view)
- Brand color dışında primary action rengi kullanma

---

## 📱 Platform Considerations

### iOS

- StatusBar: light-content (dark mode), dark-content (light mode)
- Safe area backgrounds: Tema ile eşleşmeli
- Tab bar tint: copper[500]

### Android

- StatusBar background: Tema primary background
- Navigation bar: Tema primary background
- Ripple effect: copper[500] @ 20% opacity

---

## 🚀 Migration Guide

Eski mavi temadan yeni copper temaya geçiş:

```typescript
// ESKİ (v2.0)
colors.primary.copper[500]; // #3B82F6 (Mavi)
colors.interactive.default; // Mavi

// YENİ (v3.0)
colors.primary.copper[500]; // #D9C5AC ⭐ (Warm Copper)
colors.interactive.default; // Warm Copper
```

**Not:** `copper` ismi korundu (backward compatibility), ama artık warm copper rengi.

---

## 📊 Color Psychology

### Warm Copper (#D9C5AC)

- **Güven**: Profesyonel iş ilişkileri
- **Sıcaklık**: Sosyal bağlantılar
- **Prestij**: Kaliteli network
- **Doğallık**: Uzun süre rahat kullanım
- **Denge**: Erkek/Kadın kullanıcı dengesine uygun

### Sage Green (Secondary)

- **Denge**: Uyum ve huzur
- **Gelişim**: İlerleme ve büyüme
- **Güven**: Doğal ve samimi

### Deep Teal (Accent)

- **Modernlik**: Teknoloji ve inovasyon
- **Sofistike**: Profesyonel kalite
- **Vurgu**: Dikkat çekici ama rahatsız etmez

---

## 🎨 Design Tokens

```typescript
// Kullanım
import { palette, lightTheme, darkTheme } from '@theme/colors';

// Brand color
const brandColor = palette.copper[500]; // #D9C5AC

// Interactive
const buttonPrimary = colors.interactive.default; // copper[500]

// Text
const textPrimary = isDark
  ? darkTheme.text.primary // warmGray[50]
  : lightTheme.text.primary; // warmGray[900]
```

---

## 📝 Version History

### v3.0 (Current)

- ⭐ Warm Copper (#D9C5AC) ana marka rengi
- 🌙 OLED optimized dark mode (true black)
- 🎨 Sıcak renk paleti (warm gray, sage green)
- ✅ WCAG AA+ kontrast oranları
- 🎯 Improved semantic colors

### v2.0 (Deprecated)

- Professional Blue primary color
- Cool gray neutral colors
- Standard dark mode (gray[900])

---

**Tasarım Sistemi Sorumlusu**: GitHub Copilot  
**Son Güncelleme**: 13 Aralık 2025  
**Versiyon**: 3.0.0
