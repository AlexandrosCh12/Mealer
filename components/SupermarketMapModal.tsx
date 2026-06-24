/**
 * Map modal for supermarket store locations (Leaflet in WebView).
 *
 * Slides up from bottom via Animated.spring. Embeds dark-themed Leaflet map
 * with markers from supermarketLocations. Shows expansion message for cities
 * without coordinate data.
 */
import React from 'react';
import {
  Modal, View, Text, Pressable, StyleSheet,
  Animated, Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { getStoreLocations } from '@/constants/supermarketLocations';

function escapeForHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\$/g, '&#36;');
}

interface Props {
  visible: boolean;
  onClose: () => void;
  supermarketName: string;
  city: string;
  country: string;
}

const { height } = Dimensions.get('window');

/** Supermarket locations map bottom sheet with Leaflet WebView. */
export default function SupermarketMapModal({
  visible, onClose, supermarketName, city, country,
}: Props) {
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const safeSupermarketName = escapeForHtml(supermarketName);
  const safeCity = escapeForHtml(city);
  const safeCountry = escapeForHtml(country);

  const locations = React.useMemo(
    () => getStoreLocations(safeSupermarketName, safeCity),
    [safeSupermarketName, safeCity]
  );

  const mapHtml = React.useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<!-- ${safeCountry} -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #09090f; }
#map { width: 100vw; height: 100vh; }
#counter {
  position: fixed; top: 12px; right: 12px;
  background: rgba(139,92,246,0.95); color: #fff;
  padding: 7px 14px; border-radius: 20px; font-size: 12px;
  font-family: -apple-system, sans-serif; z-index: 1000;
  font-weight: 600;
}
.leaflet-popup-content-wrapper {
  background: #1a0f2e; color: #fff;
  border: 1px solid rgba(139,92,246,0.4);
  border-radius: 12px;
}
.leaflet-popup-tip { background: #1a0f2e; }
.leaflet-popup-content { color: #fff; font-size: 13px; margin: 10px 14px; }
.popup-name { font-weight: 600; color: #a78bfa; margin-bottom: 3px; }
.popup-addr { color: rgba(255,255,255,0.5); font-size: 11px; }
.popup-area { color: rgba(139,92,246,0.7); font-size: 10px; margin-top: 2px; }
</style>
</head>
<body>
<div id="counter">${locations.length} location${locations.length !== 1 ? 's' : ''}</div>
<div id="map"></div>
<script>
var locations = ${JSON.stringify(locations)};

var map = L.map('map', { zoomControl: true, attributionControl: false });

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
}).addTo(map);

var violetIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#8b5cf6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(139,92,246,0.8)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -14],
});

if (locations.length === 0) {
  map.setView([40.6401, 22.9444], 12);
} else {
  var bounds = [];
  for (var i = 0; i < locations.length; i++) {
    var loc = locations[i];
    bounds.push([loc.lat, loc.lon]);
    L.marker([loc.lat, loc.lon], { icon: violetIcon })
      .addTo(map)
      .bindPopup(
        '<div class="popup-name">' + loc.name + '</div>' +
        '<div class="popup-addr">' + loc.address + '</div>' +
        '<div class="popup-area">' + loc.area + '</div>'
      );
  }
  if (bounds.length === 1) {
    map.setView(bounds[0], 14);
  } else {
    map.fitBounds(bounds, { padding: [60, 60] });
  }
}
</script>
</body>
</html>
    `;
  }, [locations, safeCountry]);

  const isThessaloniki = city.toLowerCase().includes('thessalonik') ||
    city.toLowerCase().includes('θεσσαλον');

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}
      statusBarTranslucent animationType="none">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet,
        { transform: [{ translateY: slideAnim }] }]}>

        <View style={styles.header}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>{supermarketName}</Text>
              <Text style={styles.headerSub}>
                {locations.length === 0 ? (
                  city.toLowerCase().includes('thessalonik') ||
                  city.toLowerCase().includes('θεσσαλον')
                    ? 'No locations found nearby'
                    : 'Map data is currently limited to Thessaloniki'
                ) : (
                  locations.length + ' location' + (locations.length !== 1 ? 's' : '') + ' in ' + city
                )}
              </Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.mapContainer}>
          {!isThessaloniki && locations.length === 0 ? (
            <View style={styles.unsupportedCityOverlay}>
              <Text style={styles.unsupportedCityEmoji}>🗺️</Text>
              <Text style={styles.unsupportedCityTitle}>
                Map coverage is expanding
              </Text>
              <Text style={styles.unsupportedCityText}>
                We currently have verified store locations for Thessaloniki.
                Support for {city} and other cities is on the roadmap —
                this will use a live location API once the app goes live.
              </Text>
            </View>
          ) : (
            <WebView
              source={{ html: mapHtml }}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['about:blank', 'https://*']}
              mixedContentMode="never"
              allowFileAccess={false}
              allowUniversalAccessFromFileURLs={false}
              javaScriptCanOpenWindowsAutomatically={false}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📍 Tap a marker to see the address
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '82%',
    backgroundColor: '#09090f',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(139,92,246,0.1)',
  },
  handle: {
    width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 14,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  mapContainer: { flex: 1, position: 'relative' },
  unsupportedCityOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  unsupportedCityEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  unsupportedCityTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  unsupportedCityText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  webview: { flex: 1, backgroundColor: '#09090f' },
  footer: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(139,92,246,0.08)' },
  footerText: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
});
