#!/usr/bin/env node
/**
 * Backend için otomatik IP tespit ve yapılandırma aracı
 * .env dosyasını ve docker-compose.yml'daki HOSTNAME_EXTERNAL'i günceller
 */

const os = require("os");
const fs = require("fs");
const path = require("path");

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
  if (excludeRanges.some((range) => range.test(ip))) {
    return false;
  }

  // Sonra özel yerel ağ aralığında olup olmadığını kontrol et
  return privateRanges.some((range) => range.test(ip));
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
    "Ethernet", // Windows Ethernet
    "Wi-Fi", // Windows Wi-Fi
    "WiFi",
    "WLAN",
    "en0", // macOS Wi-Fi
    "en1", // macOS Ethernet
    "eth0", // Linux Ethernet
    "wlan0", // Linux Wi-Fi
    "eth1",
    "wlan1",
  ];

  // Tüm IPv4 adreslerini topla
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;

    for (const addr of addrs) {
      if (addr.family === "IPv4" && !addr.internal) {
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
  const validCandidates = candidates.filter((c) => c.isValid);

  if (validCandidates.length > 0) {
    // Geçerli olanlar arasında en düşük priority'ye sahip olanı seç
    validCandidates.sort((a, b) => a.priority - b.priority);
    console.log(
      `   ✓ Geçerli yerel ağ IP'si bulundu: ${validCandidates[0].address} (${validCandidates[0].name})`
    );
    return validCandidates[0].address;
  }

  // Geçerli bulunamazsa fallback olarak priority'ye göre seç
  candidates.sort((a, b) => a.priority - b.priority);
  console.log(
    `   ⚠ Sadece sanal IP bulundu: ${candidates[0].address} (${candidates[0].name})`
  );
  return candidates[0].address;
}

/**
 * .env dosyasını günceller veya oluşturur
 */
function updateEnvFile(ipAddress) {
  const envPath = path.join(__dirname, "..", ".env");
  const envExamplePath = path.join(__dirname, "..", ".env.example");

  let envContent = "";

  // .env dosyası varsa oku, yoksa .env.example'dan başla
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, "utf-8");
    console.log("   📝 .env dosyası oluşturuluyor...");
  }

  // CORS_ALLOWED_ORIGINS'i güncelle - dinamik IP'yi ekle ama diğerlerini koru
  const corsRegex = /CORS_ALLOWED_ORIGINS=(.*)$/m;
  const match = envContent.match(corsRegex);

  if (match) {
    let origins = match[1].split(",").map((o) => o.trim());

    // Eski hardcode IP'leri kaldır (192.168.x.x, 172.x.x.x, 10.x.x.x formatında olanlar)
    origins = origins.filter(
      (origin) =>
        !origin.match(/192\.168\.\d+\.\d+|172\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+/)
    );

    // Yeni IP'yi ekle
    const newOrigins = [
      `http://${ipAddress}:8080`,
      `http://${ipAddress}:8081`,
      `http://${ipAddress}:19006`,
    ];

    // Benzersiz origins listesi oluştur
    const uniqueOrigins = [...new Set([...origins, ...newOrigins])];

    const newCorsLine = `CORS_ALLOWED_ORIGINS=${uniqueOrigins.join(",")}`;
    envContent = envContent.replace(corsRegex, newCorsLine);
  }

  fs.writeFileSync(envPath, envContent, "utf-8");

  return envContent;
}

/**
 * docker-compose.yml dosyasını günceller
 */
function updateDockerCompose(ipAddress) {
  const dockerComposePath = path.join(__dirname, "..", "docker-compose.yml");

  if (!fs.existsSync(dockerComposePath)) {
    console.log("   ⚠️  docker-compose.yml dosyası bulunamadı, atlanıyor...");
    return false;
  }

  let content = fs.readFileSync(dockerComposePath, "utf-8");

  // HOSTNAME_EXTERNAL değerini güncelle
  const hostnameRegex = /(HOSTNAME_EXTERNAL=)[\w.]+/;

  if (hostnameRegex.test(content)) {
    content = content.replace(hostnameRegex, `$1${ipAddress}`);
    fs.writeFileSync(dockerComposePath, content, "utf-8");
    return true;
  }

  return false;
}

/**
 * Ana fonksiyon
 */
function main() {
  console.log("🔍 Backend için yerel IP adresi tespit ediliyor...\n");

  const ipAddress = getLocalIPAddress();

  if (!ipAddress) {
    console.error("❌ Yerel IP adresi bulunamadı!");
    console.error("Lütfen ağ bağlantınızı kontrol edin.\n");
    process.exit(1);
  }

  console.log(`\n✅ IP Adresi: ${ipAddress}`);

  updateEnvFile(ipAddress);
  const dockerUpdated = updateDockerCompose(ipAddress);

  console.log("\n📝 Backend yapılandırması güncellendi:");
  console.log(`   API URL: http://${ipAddress}:8080`);
  console.log(
    `   CORS Origins: http://${ipAddress}:8080, http://${ipAddress}:8081, ...`
  );
  if (dockerUpdated) {
    console.log(`   Docker HOSTNAME_EXTERNAL: ${ipAddress}`);
  }

  console.log("\n💡 Docker servislerini yeniden başlatmanız gerekebilir:");
  console.log("   docker-compose down && docker-compose up -d\n");
}

// Sadece doğrudan çalıştırıldığında çalış
if (require.main === module) {
  main();
}

module.exports = { getLocalIPAddress, updateEnvFile, updateDockerCompose };
