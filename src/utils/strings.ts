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
    legendHot: "Sıcak 🔥"
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
    legendHot: "Hot 🔥"
  }
};

export function getStrings(): typeof STRINGS.tr {
  const lang = (typeof window !== "undefined" && window.localStorage?.getItem("language")) || "en";
  if (lang === "tr") {
    return STRINGS.tr;
  }
  return STRINGS.en;
}
