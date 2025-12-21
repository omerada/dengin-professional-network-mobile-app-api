#!/usr/bin/env node
/**
 * Otomatik olarak yerel IP adresini tespit eder ve .env dosyasını günceller
 * Windows, macOS ve Linux için uyumludur
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * IP adresinin gerçek yerel ağ IP'si olup olmadığını kontrol eder
 * (VPN, Docker, WSL gibi sanal interface'leri hariç tutar)
 */
function isValidLocalIP(ip) {
  // Özel yerel ağ IP aralıkları (RFC 1918)
  const privateRanges = [
    /^192\.168\.\d{1,3}\.\d{1,3}$/, // 192.168.0.0/16
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/, // 172.16.0.0/12
  ];

  // Docker, WSL, VPN gibi sanal interface'leri atla
  const excludeRanges = [
    /^172\.17\.\d{1,3}\.\d{1,3}$/, // Docker default bridge
    /^172\.18\.\d{1,3}\.\d{1,3}$/, // Docker custom networks
    /^172\.19\.\d{1,3}\.\d{1,3}$/,
    /^172\.20\.\d{1,3}\.\d{1,3}$/, // WSL
  ];

  // Önce hariç tutulması gerekenleri kontrol et
  if (excludeRanges.some(range => range.test(ip))) {
    return false;
  }

  // Sonra özel yerel ağ aralığında olup olmadığını kontrol et
  return privateRanges.some(range => range.test(ip));
}

/**
 * Aktif ağ arabirimine göre yerel IP adresini bulur
 * 192.168.x.x gibi gerçek yerel ağ IP'lerini önceliklendirir
 */
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  // Tercih sırası: Ethernet > Wi-Fi > Diğerleri (Windows için)
  const preferredNames = [
    'Ethernet', // Windows Ethernet
    'Wi-Fi', // Windows Wi-Fi
    'WiFi',
    'WLAN',
    'en0', // macOS Wi-Fi
    'en1', // macOS Ethernet
    'eth0', // Linux Ethernet
    'wlan0', // Linux Wi-Fi
    'eth1',
    'wlan1',
  ];

  // Tüm IPv4 adreslerini topla
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;

    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        const priority = preferredNames.indexOf(name);
        const isPreferred = priority !== -1;
        const isValid = isValidLocalIP(addr.address);

        candidates.push({
          name,
          address: addr.address,
          priority: isPreferred ? priority : 999,
          isValid,
        });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // Önce geçerli yerel ağ IP'lerini seç (192.168.x.x, 10.x.x.x)
  const validCandidates = candidates.filter(c => c.isValid);

  if (validCandidates.length > 0) {
    // Geçerli olanlar arasında en düşük priority'ye sahip olanı seç
    validCandidates.sort((a, b) => a.priority - b.priority);
    return validCandidates[0].address;
  }

  // Geçerli bulunamazsa fallback olarak priority'ye göre seç
  candidates.sort((a, b) => a.priority - b.priority);
  return candidates[0].address;
}

/**
 * .env dosyasını günceller veya oluşturur
 */
function updateEnvFile(ipAddress) {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  let envContent = '';

  // .env dosyası varsa oku, yoksa .env.example'dan başla
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf-8');
    console.log('📝 .env dosyası oluşturuluyor...');
  } else {
    // Hiçbiri yoksa temel template kullan
    envContent = `# Auto-generated .env file\n# Generated at: ${new Date().toISOString()}\n\n`;
  }

  const apiUrl = `http://${ipAddress}:8080`;
  const wsUrl = `ws://${ipAddress}:8080/ws`;

  // Mevcut değerleri güncelle veya yeni ekle
  const apiUrlRegex = /^EXPO_PUBLIC_API_BASE_URL=.*$/m;
  const wsUrlRegex = /^EXPO_PUBLIC_WS_URL=.*$/m;

  if (apiUrlRegex.test(envContent)) {
    envContent = envContent.replace(apiUrlRegex, `EXPO_PUBLIC_API_BASE_URL=${apiUrl}`);
  } else {
    envContent += `\nEXPO_PUBLIC_API_BASE_URL=${apiUrl}`;
  }

  if (wsUrlRegex.test(envContent)) {
    envContent = envContent.replace(wsUrlRegex, `EXPO_PUBLIC_WS_URL=${wsUrl}`);
  } else {
    envContent += `\nEXPO_PUBLIC_WS_URL=${wsUrl}`;
  }

  fs.writeFileSync(envPath, envContent, 'utf-8');

  return { apiUrl, wsUrl };
}

/**
 * Ana fonksiyon
 */
function main() {
  console.log('🔍 Yerel IP adresi tespit ediliyor...\n');

  const ipAddress = getLocalIPAddress();

  if (!ipAddress) {
    console.error('❌ Yerel IP adresi bulunamadı!');
    console.error('Lütfen ağ bağlantınızı kontrol edin.\n');
    process.exit(1);
  }

  console.log(`✅ IP Adresi bulundu: ${ipAddress}`);

  const { apiUrl, wsUrl } = updateEnvFile(ipAddress);

  console.log('\n📝 .env dosyası güncellendi:');
  console.log(`   API_BASE_URL: ${apiUrl}`);
  console.log(`   WS_URL: ${wsUrl}`);
  console.log('\n💡 Expo uygulamanızı yeniden başlatmanız gerekebilir.');
  console.log('   npx expo start --clear\n');
}

// Sadece doğrudan çalıştırıldığında çalış
if (require.main === module) {
  main();
}

module.exports = { getLocalIPAddress, updateEnvFile };
