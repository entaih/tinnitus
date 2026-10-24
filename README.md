# Dingin — Tinnitus değerlendirme ve rehabilitasyon uygulaması

**Dingin**, tinnitusu (kulak çınlaması) bilimsel ölçütlerle değerlendiren, olası profili ve sevk gereksinimini belirleyen ve kişiye özel, kanıta dayalı 12 haftalık bir rehabilitasyon programı üreten iOS + Android uygulamasıdır. Expo SDK 58 ile yazılmıştır ve **Expo Go** içinde çalışır.

> Dingin, ölçüt tabanlı bir **tanısal karar destek** algoritmasıyla ICD-10 kodlu **ön tanı** üretir (birincil neden, eşlik eden tanılar, dışlanması gereken ayırıcı tanılar, doğrulama planı). Bu çıktı **araştırma sürümüdür**: klinik araştırmada doğrulanacak ve MDR sertifikasyonu hedeflenmektedir; o zamana kadar hekim doğrulaması zorunludur.

## Hızlı başlangıç (Expo Go)

```bash
npm install
npx expo start            # aynı Wi-Fi ağındaysanız
npx expo start --tunnel   # farklı ağlar için (ngrok tüneli)
```

1. Telefonunuza App Store / Google Play'den **Expo Go** (SDK 58 destekli sürüm) yükleyin.
2. Terminaldeki QR kodu iOS'ta Kamera, Android'de Expo Go ile tarayın.
3. iOS'ta fiziksel cihaz için `npx expo login` ile aynı Expo hesabına giriş yapmanız gerekebilir.

Kontroller: `npm run typecheck`, `npm test`.

## Ne yapar?

| Alan | İçerik | Kanıt |
|---|---|---|
| **Güvenlik taraması** | 12 maddelik kırmızı bayrak taraması (ani işitme kaybı, pulsatil, tek taraflı, nörolojik belirti, vertigo, kendine zarar verme) → NICE NG155 sevk kademeleri | NICE 2020, AAO-HNS 2014 / AAO-HNSF 2026, Cima 2019 |
| **Ölçekler** | THI (Newman 1996; TR: Aksoy 2007), Hiperakuzi Anketi (Khalfa 2002), PHQ-9, GAD-7, Uyku Durumu Göstergesi (Espie 2014), RaSST somatosensoriyel tarama (Michiels 2022) | Valide, puanlama kesme noktaları literatürden |
| **Psikoakustik profil** | 2AFC tekrarlı perde eşleme (medyan, güven aralığı), oktav karışıklığı testi, gürlük eşleme (dB SL), minimum maskeleme düzeyi, 60 s rezidüel inhibisyon testi | Vielsmeier 2020, Wunderlich 2015, Sendesen 2024 |
| **İşitme taraması** | 0.5–8 kHz saf ton taraması, asimetri ve gürültü çentiği bayrakları, ±10 dB belirsizlik bandı ve zorunlu "tarama, test değil" uyarısı | Chen 2021 meta-analizi |
| **Ön tanı motoru** | Her neden için gerekli / destekleyici / çelişen ölçütler, kesinlik düzeyi (yüksek/orta/düşük), ICD-10 kodu; birincil ön tanı + eşlik eden nedenler + dışlanması gereken ayırıcı tanılar + eşlik eden tanılar (işitme kaybı, hiperakuzi, insomnia, kaygı, depresyon) + doğrulama planı; hekim özetine yazılır | `src/clinical/diagnosis.ts`; klinik araştırmada doğrulanacak |
| **Neden analizi** | 16 mekanizma (koklea tüy hücresi, presbiakuzi, ani işitme kaybı, Ménière, iletim tipi/Östaki, otoskleroz, ototoksik, boyun ve çene kaynaklı somatosensoriyel, damar kaynaklı pulsatil, sistemik, retrokoklear, miyoklonus, üçüncü pencere, travma/fistül, merkezi) öykü, kırmızı bayraklar, odyogram, psikoakustik, uyarlanabilir sorular ve otomatik muayene bulgularıyla puanlanır; her neden için organ/mekanizma, kesinleştiren test, uzman ve tedavi yolu (kür / tedavi / yönetim) | Kılavuzlar + otoloji literatürü, `docs/research` |
| **Otomatik muayene** | Telefonla yapılan testler: rakam-gürültü (TTS), ses tolerans eşiği (LDL), Östaki basınç manevraları, damar manevraları (pulsatil), ivmeölçer denge testi, somatik manevra testi; tümü "ekran tahmini" etiketiyle | Tarama niteliğinde |
| **Profil motoru** | Kademeli triyaj (0–5), fenotipler (akut/kronik, tonal, somatosensoriyel, hiperakuzi, işitme kaybı ilişkili, pulsatil…), sıkıntı sürücüleri, kanıt rozetli öneriler, "doktorunuza söyleyebilecekleriniz" PDF raporu | Bkz. `docs/research/diagnosis.md` §6.6 |
| **Program üreteci** | 8 haftalık iBDT omurgası (Beukes/Andersson modül yapısı, Öst uygulamalı gevşeme) + ses zenginleştirme; eklentiler: CBT-I (Marks 2023), hiperakuzi kademeli maruziyet (Formby/Jüris), somatosensoriyel egzersizler (Michiels/van der Wal), işitme yolu; RI pozitifse ses öncelikli; 4/8/12. haftada ölçüm ve sonuca dayalı uyarlama kuralları | `docs/research/treatment.md` §12 |
| **Ses laboratuvarı** | Cihaz üzerinde sentezlenen (native modül yok) beyaz/pembe/kahverengi gürültü, perdeye göre 1 oktav çentikli gürültü, dar bant, 40 Hz AM (deneysel), doğa sesleri, 3 katmanlı karıştırıcı, uyku zamanlayıcı, karışma noktası kalibrasyonu, çıkış sınırı | Sereda 2018, TRTT 2019, Okamoto 2010 / Stein 2016 |
| **Zihin** | 21 BDT modülü, ACT alternatifi, MBCT-lite, CBT-I, hiperakuzi modülleri, düşünce kaydı, nefes/PMR egzersizleri | Fuller 2020 Cochrane, Hesser 2012, McKenna 2017 |
| **Eğitim** | Atıflı makaleler; takviye/ilaç "ne önerilmez" (betahistin, ginkgo, çinko), nöromodülasyon ve Lenire gerçekleri, dijital terapötik kanıt karşılaştırması | Cochrane derlemeleri |

## Mimari

Bkz. `docs/ARCHITECTURE.md` (klasör yapısı ve kurallar), `docs/DESIGN.md` (tasarım sistemi), `docs/research/` (literatür özetleri ve karar ağaçları).

## Lisans notları

THI, PHQ-9, GAD-7, SCI, Khalfa HQ ve RaSST madde metinleri atıfla kullanılmıştır. **TFI (OHSU)** ve **ISI (Mapi)** ticari lisans gerektirdiği için uygulamaya gömülmemiştir; klinikte ölçülmüş bir TFI puanı yorumlamak için yalnızca kesme noktaları kullanılır. Ticari yayın öncesi THI için yazar izni alınmalıdır.

## Bilinen Expo Go sınırları

- Android'de ekran kapalıyken arka plan sesi ~3 dk sonra durabilir (Expo Go manifestinde ses servisi yok); uygulama ekranı açık tutar. Geliştirme derlemesi (`eas build --profile development`) bu sınırı kaldırır. iOS'ta arka plan sesi çalışır.
- Kulaklık algılama API'si yoktur; test ekranları kulaklık kullanımını kullanıcıdan ister.
- Sağ/sol kanal yönlendirme mümkün değildir; işitme taramasında karşı kulaklığın çıkarılması istenir.
