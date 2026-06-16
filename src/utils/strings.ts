export const STRINGS = {
  tr: {
    pluginLoading: "Knowledge Heat Map eklentisi yükleniyor...",
    pluginUnloading: "Knowledge Heat Map eklentisi kaldırılıyor...",
    noGraphViewWarning: "🔥 Lütfen önce bir Graph View (İlişki Grafiği) görünümü açın!",
    heatMapApplied: "🔥 Knowledge Heat Map uygulandı!",
    heatMapFailed: "❌ Heat Map uygulanamadı. Detaylar konsolda.",
    restoreSuccess: "❄️ Graph View orijinal haline döndürüldü.",
    restoreFailed: "❌ Restore işlemi başarısız oldu.",
    noMarkdownNotes: "⚠️ Kasada analiz edilecek markdown notu bulunamadı.",
    noNotesAfterFilter: "⚠️ Filtreler sonrasında analiz edilecek not kalmadı.",
    heatMapNotActive: "🔥 Knowledge Heat Map şu anda aktif değil.",
    
    // Side Panel
    panelTitle: "🔥 Knowledge Heat Map",
    panelToggleLabel: "Heat Map Aktif:",
    panelToggleOffInfo: "Isı haritasını etkinleştirmek için yukarıdaki butonu kullanın.",
    panelPresetsHeader: "Hazır Profiller (Presets)",
    panelPresetBalanced: "Balanced",
    panelPresetBalancedTooltip: "Dengeli Ayarlar",
    panelPresetRecency: "Recency Focus",
    panelPresetRecencyTooltip: "Son Düzenleme Ağırlıklı",
    panelPresetNetwork: "Network Focus",
    panelPresetNetworkTooltip: "Bağlantı Yoğunluğu Ağırlıklı",
    panelCriteriaHeader: "Kriter Ağırlıkları",
    panelTimeRangeHeader: "Zaman Aralığı",
    panelRestoreButton: "Geri Al (Restore)",
    panelOpenViewButton: "Open Full Heat View →",
    panelWeightDisabled: "[Devre Dışı]",
    
    // Time Ranges
    timeRangeAll: "Tümü",
    timeRange90d: "90 Gün",
    timeRange30d: "30 Gün",
    timeRange7d: "7 Gün",

    // Criteria names
    criterionRecency: "Son Düzenleme (Recency)",
    criterionLinkDensity: "Bağlantı Yoğunluğu (Link Density)",
    criterionVisitFreq: "Ziyaret Sıklığı (Visit Frequency)",
    criterionOrphan: "Bağlantısızlık Cezası (Orphan Penalty)",
    criterionContentLen: "Not Boyutu (Content Length)",
    
    // Settings Tab
    settingsTitle: "Knowledge Heat Map Ayarları",
    settingsGeneralHeader: "Genel Ayarlar",
    settingsEnableStartupName: "Başlangıçta Etkinleştir",
    settingsEnableStartupDesc: "Obsidian açıldığında Isı Haritasını otomatik olarak uygula.",
    settingsRefreshName: "Otomatik Yenileme Aralığı (Dakika)",
    settingsRefreshDesc: "Isı haritasını kaç dakikada bir otomatik yenilesin? (0 = Sadece manuel yenileme)",
    settingsNotificationsName: "Bildirimleri Göster",
    settingsNotificationsDesc: "Isı haritası uygulandığında veya geri alındığında bildirim pencereleri gösterir.",
    settingsVisualsHeader: "Görsel Ayarlar",
    settingsPaletteName: "Renk Paleti",
    settingsPaletteDesc: "Isı derecelerini göstermek için kullanılacak renk şeması.",
    settingsAdvancedHeader: "Gelişmiş Ayarlar",
    settingsCacheName: "Önbellek Süresi (Dakika)",
    settingsCacheDesc: "Isı skorlarının bellekte tutulma süresi. Değişiklik sonrasında önbellek sıfırlanır.",
    settingsExcludeFoldersName: "Hariç Tutulacak Klasörler",
    settingsExcludeFoldersDesc: "Isı haritası hesaplamasına dahil edilmeyecek klasör yolları (her satıra bir tane yazın).",
    settingsExcludeTagsName: "Hariç Tutulacak Etiketler (Tags)",
    settingsExcludeTagsDesc: "Isı haritası hesaplamasından dışlanacak etiketler (her satıra bir tane yazın, örn: #private).",
    settingsDebugName: "Geliştirici Modu (Debug Mode)",
    settingsDebugDesc: "Konsola daha fazla günlükleme (logging) bilgisi basar.",
    settingsMinNoteAgeDaysName: "Minimum Not Yaşı (Gün)",
    settingsMinNoteAgeDaysDesc: "Bu değerden daha yeni notları ısı haritasına dahil etmez (0 = Tüm notları dahil et).",
    settingsDefaultTimeRangeName: "Varsayılan Zaman Aralığı",
    settingsDefaultTimeRangeDesc: "Eklenti açıldığında varsayılan olarak uygulanacak zaman penceresi.",
    
    // D3 View & Stats Panel
    d3ViewTitle: "Knowledge Heat Map",
    d3RefreshButton: "↻ Yenile",
    d3SettingsButton: "⚙ Ayarlar",
    statsHeader: "📊 Vault İstatistikleri",
    statsOrphans: "🕳️ Orphan (Yalnız) Notlar:",
    statsAverageScore: "📈 Ortalama Isı Skoru:",
    statsTotalAnalyzed: "📁 Toplam Analiz Edilen:",
    statsNotesSuffix: "not",
    legendCold: "❄️ Soğuk",
    legendWarm: "Sıcaklık Skalası",
    legendHot: "Sıcak 🔥",
    tooltipLastModified: "Son Değişiklik:",
    tooltipLinks: "Bağlantılar:",
    tooltipVisitCount: "Ziyaret Sıklığı:",
    tooltipSize: "Boyut:",
    tooltipDaysAgo: "gün önce",
    d3SearchPlaceholder: "Not adı ara...",
    d3FilterLabel: "Filtrele:",
    d3FilterAll: "Tüm Notlar",
    d3FilterOrphans: "Yalnız (Orphan) Notlar",
    d3FilterBurning: "Çok Sıcak (Burning) Notlar",
    d3FilterCold: "Soğuk (Cold/Frozen) Notlar",

    // Shared labels
    calculatingLabel: "Isı haritası hesaplanıyor",
    closeButton: "Kapat",
    paletteAmberName: "Amber Isı Spektrumu",
    paletteCustomName: "Özel Renkler",
    colorFrozenName: "Frozen (En Soğuk) Rengi",
    colorColdName: "Cold Rengi",
    colorWarmName: "Warm Rengi",
    colorHotName: "Hot Rengi",
    colorBurningName: "Burning (En Sıcak) Rengi",
    contextMenuShowScore: "🌡 Isı Skorunu Göster",
    contextMenuShowInView: "🔥 Isı Haritasında Göster",
    scoreNotAvailable: "Skor hesaplanamadı",

    // B3: Node size
    d3NodeSizeLabel: "Node Boyutu:",
    d3NodeSizeLinks: "Bağlantı Sayısı",
    d3NodeSizeScore: "Isı Skoru",
    d3NodeSizeContent: "İçerik Uzunluğu",
    d3NodeSizeVisits: "Ziyaret Sayısı",

    // B4: Focus mode
    d3ShowAllButton: "Tümünü Göster",
    d3FocusModeHint: "Bir node'a sağ tıklayarak odak moduna geçin",

    // B5: Trend
    trendUp: "↑ Yükseliyor",
    trendDown: "↓ Düşüyor",
    trendStable: "→ Stabil",
    tooltipTrend: "Trend:",

    // B6: Export
    d3ExportPng: "📥 PNG Olarak İndir",
    d3ExportSvg: "📥 SVG Olarak İndir",

    // C2: Clustering
    d3GroupByLabel: "Grupla:",
    d3GroupByNone: "Gruplama Yok",
    d3GroupByFolder: "Klasöre Göre",
    d3GroupByTag: "Etikete Göre",

    // C5: Advanced filters
    d3TagFilterLabel: "Etiket Filtresi:",
    d3TagFilterAll: "Tüm Etiketler",
    d3FolderFilterLabel: "Klasör Filtresi:",
    d3FolderFilterAll: "Tüm Klasörler",
    d3ScoreRangeLabel: "Skor Aralığı:",

    // D2: GraphReloader
    graphViewNotOpen: "🔥 Lütfen önce Graph View (İlişki Grafiği) görünümünü açın!",
    hexInvalid: "Geçersiz hex renk kodu",

    // F4: Custom Presets
    panelCustomPresetsHeader: "Özel Profilleriniz",
    panelSavePresetButton: "Profili Kaydet",
    panelSavePresetPlaceholder: "Profil Adı...",
    presetDeleteTooltip: "Bu profili sil",
    presetSavedNotice: "Profil başarıyla kaydedildi!",
    presetDeletedNotice: "Profil silindi.",
    presetNameEmptyNotice: "Lütfen bir profil adı girin!",

    // F5: What's New
    whatsNewTitle: "🔥 Knowledge Heat Map v2.0.0 — Yenilikler!",
    whatsNewIntro: "Knowledge Heat Map'in yeni sürümü yayında! İşte eklenen harika özellikler:",
    whatsNewClose: "Harika, Başlayalım!",
    whatsNewFeature1Title: "🗺️ Canlı Mini Harita (MiniMap)",
    whatsNewFeature1Desc: "Büyük grafiklerde yönünüzü kaybetmeyin. Sağ alttaki interaktif harita ile konumunuzu takip edin.",
    whatsNewFeature2Title: "⏳ Zaman Yolculuğu & Snapshot",
    whatsNewFeature2Desc: "Isı haritasının geçmiş sürümlerini kaydedin, karşılaştırın ve zaman içindeki değişimi izleyin.",
    whatsNewFeature3Title: "📊 Haftalık Özet (Weekly Digest)",
    whatsNewFeature3Desc: "Haftalık olarak hangi notların ısındığını, hangilerinin soğuduğunu belirten akıllı özet bildirimler.",
    whatsNewFeature4Title: "🔗 Tıklanabilir İpuçları (Tooltip Link)",
    whatsNewFeature4Desc: "İlişki grafiğindeki baloncukta yer alan başlığa tıklayarak ilgili notu doğrudan açın.",
    whatsNewFeature5Title: "💾 Özel Profil Desteği (Custom Presets)",
    whatsNewFeature5Desc: "Kendi kriter ve ağırlık kombinasyonlarınızı profil olarak kaydedin, tek tıkla uygulayın.",
    whatsNewFeature6Title: "🎯 Odak Modu (Ego-Graph)",
    whatsNewFeature6Desc: "Bir not üzerine sağ tıklayarak sadece o notu ve komşularını görüntüleyin.",
    whatsNewFeature7Title: "🎨 Canlı Renk Paletleri",
    whatsNewFeature7Desc: "6 hazır canlı paletten birini seçin ya da kendi özel renk spektrumunuzu oluşturun.",
    whatsNewFeature8Title: "⚡ Üstün Performans",
    whatsNewFeature8Desc: "Yeni DOM güncellemeleri, animasyonlu sayaçlar ve akıllı delta analiz motoru ile sıfır gecikme.",
  },
  en: {
    pluginLoading: "Loading Knowledge Heat Map plugin...",
    pluginUnloading: "Unloading Knowledge Heat Map plugin...",
    noGraphViewWarning: "🔥 Please open a Graph View first!",
    heatMapApplied: "🔥 Knowledge Heat Map applied!",
    heatMapFailed: "❌ Heat Map failed. Check console for details.",
    restoreSuccess: "❄️ Graph View restored to original.",
    restoreFailed: "❌ Restore failed.",
    noMarkdownNotes: "⚠️ No markdown notes found to analyze in vault.",
    noNotesAfterFilter: "⚠️ No notes left to analyze after applying filters.",
    heatMapNotActive: "🔥 Knowledge Heat Map is currently not active.",
    
    // Side Panel
    panelTitle: "🔥 Knowledge Heat Map",
    panelToggleLabel: "Heat Map Active:",
    panelToggleOffInfo: "Use the toggle above to enable the heat map.",
    panelPresetsHeader: "Presets",
    panelPresetBalanced: "Balanced",
    panelPresetBalancedTooltip: "Balanced settings",
    panelPresetRecency: "Recency Focus",
    panelPresetRecencyTooltip: "Weighted towards modification date",
    panelPresetNetwork: "Network Focus",
    panelPresetNetworkTooltip: "Weighted towards link density",
    panelCriteriaHeader: "Criteria Weights",
    panelTimeRangeHeader: "Time Range",
    panelRestoreButton: "Restore Original",
    panelOpenViewButton: "Open Full Heat View →",
    panelWeightDisabled: "[Disabled]",
    
    // Time Ranges
    timeRangeAll: "All",
    timeRange90d: "90 Days",
    timeRange30d: "30 Days",
    timeRange7d: "7 Days",

    // Criteria names
    criterionRecency: "Last Modified (Recency)",
    criterionLinkDensity: "Link Density",
    criterionVisitFreq: "Visit Frequency",
    criterionOrphan: "Orphan Penalty",
    criterionContentLen: "Content Length",
    
    // Settings Tab
    settingsTitle: "Knowledge Heat Map Settings",
    settingsGeneralHeader: "General Settings",
    settingsEnableStartupName: "Enable on Startup",
    settingsEnableStartupDesc: "Automatically apply Heat Map when Obsidian loads.",
    settingsRefreshName: "Auto Refresh Interval (Minutes)",
    settingsRefreshDesc: "How often to refresh the heat map? (0 = Manual refresh only)",
    settingsNotificationsName: "Show Notifications",
    settingsNotificationsDesc: "Show notice alerts when applying or restoring the heat map.",
    settingsVisualsHeader: "Visual Settings",
    settingsPaletteName: "Color Palette",
    settingsPaletteDesc: "Color scheme to display heat intensity.",
    settingsAdvancedHeader: "Advanced Settings",
    settingsCacheName: "Cache Timeout (Minutes)",
    settingsCacheDesc: "In-memory cache duration for note scores.",
    settingsExcludeFoldersName: "Exclude Folders",
    settingsExcludeFoldersDesc: "Folders excluded from heat map analysis (one per line).",
    settingsExcludeTagsName: "Exclude Tags",
    settingsExcludeTagsDesc: "Tags excluded from heat map analysis (one per line, e.g. #private).",
    settingsDebugName: "Debug Mode",
    settingsDebugDesc: "Log more debug info to console.",
    settingsMinNoteAgeDaysName: "Minimum Note Age (Days)",
    settingsMinNoteAgeDaysDesc: "Excludes notes newer than this number of days from calculation (0 = Include all notes).",
    settingsDefaultTimeRangeName: "Default Time Range",
    settingsDefaultTimeRangeDesc: "The default time window to apply when the plugin loads.",
    
    // D3 View & Stats Panel
    d3ViewTitle: "Knowledge Heat Map",
    d3RefreshButton: "↻ Refresh",
    d3SettingsButton: "⚙ Settings",
    statsHeader: "📊 Vault Statistics",
    statsOrphans: "🕳️ Orphan Notes:",
    statsAverageScore: "📈 Average Heat Score:",
    statsTotalAnalyzed: "📁 Total Analyzed:",
    statsNotesSuffix: "notes",
    legendCold: "❄️ Cold",
    legendWarm: "Heat Scale",
    legendHot: "Hot 🔥",
    tooltipLastModified: "Last Modified:",
    tooltipLinks: "Links:",
    tooltipVisitCount: "Visit Count:",
    tooltipSize: "Size:",
    tooltipDaysAgo: "days ago",
    d3SearchPlaceholder: "Search note name...",
    d3FilterLabel: "Filter:",
    d3FilterAll: "All Notes",
    d3FilterOrphans: "Orphan Notes Only",
    d3FilterBurning: "Burning Notes Only",
    d3FilterCold: "Cold/Frozen Notes Only",

    // Shared labels
    calculatingLabel: "Calculating heat map",
    closeButton: "Close",
    paletteAmberName: "Amber Heat Spectrum",
    paletteCustomName: "Custom Colors",
    colorFrozenName: "Frozen (Coldest) Color",
    colorColdName: "Cold Color",
    colorWarmName: "Warm Color",
    colorHotName: "Hot Color",
    colorBurningName: "Burning (Hottest) Color",
    contextMenuShowScore: "🌡 Show Heat Score",
    contextMenuShowInView: "🔥 Show in Heat View",
    scoreNotAvailable: "Score not available",

    // B3: Node size
    d3NodeSizeLabel: "Node Size By:",
    d3NodeSizeLinks: "Link Count",
    d3NodeSizeScore: "Heat Score",
    d3NodeSizeContent: "Content Length",
    d3NodeSizeVisits: "Visit Count",

    // B4: Focus mode
    d3ShowAllButton: "Show All",
    d3FocusModeHint: "Right-click a node to enter focus mode",

    // B5: Trend
    trendUp: "↑ Rising",
    trendDown: "↓ Falling",
    trendStable: "→ Stable",
    tooltipTrend: "Trend:",

    // B6: Export
    d3ExportPng: "📥 Export PNG",
    d3ExportSvg: "📥 Export SVG",

    // C2: Clustering
    d3GroupByLabel: "Group By:",
    d3GroupByNone: "No Grouping",
    d3GroupByFolder: "By Folder",
    d3GroupByTag: "By Tag",

    // C5: Advanced filters
    d3TagFilterLabel: "Tag Filter:",
    d3TagFilterAll: "All Tags",
    d3FolderFilterLabel: "Folder Filter:",
    d3FolderFilterAll: "All Folders",
    d3ScoreRangeLabel: "Score Range:",

    // D2: GraphReloader
    graphViewNotOpen: "🔥 Please open a Graph View first!",
    hexInvalid: "Invalid hex color code",

    panelCustomPresetsHeader: "Custom Presets",
    panelSavePresetButton: "Save Preset",
    panelSavePresetPlaceholder: "Preset Name...",
    presetDeleteTooltip: "Delete this preset",
    presetSavedNotice: "Preset saved successfully!",
    presetDeletedNotice: "Preset deleted.",
    presetNameEmptyNotice: "Please enter a preset name!",

    // F5: What's New
    whatsNewTitle: "🔥 Knowledge Heat Map v2.0.0 — What's New!",
    whatsNewIntro: "A major update to Knowledge Heat Map is here! Check out the amazing new features:",
    whatsNewClose: "Awesome, let's start!",
    whatsNewFeature1Title: "🗺️ Interactive MiniMap",
    whatsNewFeature1Desc: "Never get lost in massive node networks. Track and navigate your viewport using the new mini-map.",
    whatsNewFeature2Title: "⏳ Time Travel Snapshots",
    whatsNewFeature2Desc: "Take snapshots of your heat map scores, keep history logs, and travel back in time.",
    whatsNewFeature3Title: "📊 Weekly Digests",
    whatsNewFeature3Desc: "Receive automated weekly summaries highlighting shifts in your note heat patterns.",
    whatsNewFeature4Title: "🔗 Clickable Tooltip Links",
    whatsNewFeature4Desc: "Click on any note title inside the node tooltip to open that file instantly.",
    whatsNewFeature5Title: "💾 Custom Presets",
    whatsNewFeature5Desc: "Configure your own weight distributions and save them as presets for easy switching.",
    whatsNewFeature6Title: "🎯 Ego-Graph Focus Mode",
    whatsNewFeature6Desc: "Right-click a node to isolate it and focus only on its first and second-degree neighbors.",
    whatsNewFeature7Title: "🎨 Vibrant Color Palettes",
    whatsNewFeature7Desc: "Choose from 6 professionally designed color themes or create your own custom spectrum.",
    whatsNewFeature8Title: "⚡ Performance Upgrades",
    whatsNewFeature8Desc: "DocumentFragment rendering, incremental analysis, and animated counters ensure lag-free use.",
  }
};

export function getStrings(): typeof STRINGS.tr {
  const lang = (typeof window !== "undefined" && window.localStorage?.getItem("language")) || "en";
  if (lang === "tr") {
    return STRINGS.tr;
  }
  return STRINGS.en;
}
