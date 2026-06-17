import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  visible: boolean;
  onClose: () => void;
  supermarketName: string;
  city: string;
  country: string;
}

const { height } = Dimensions.get('window');

export default function SupermarketMapModal({
  visible,
  onClose,
  supermarketName,
  city,
  country,
}: Props) {
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (visible) {
      setLoading(true);
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
  }, [visible, slideAnim]);

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #09090f; font-family: -apple-system, sans-serif; }
    #map { width: 100vw; height: 100vh; }
    .leaflet-tile-pane { filter: brightness(0.85) saturate(0.9); }
    .custom-marker {
      background: #8b5cf6;
      border: 2px solid #ffffff;
      border-radius: 50%;
      width: 14px;
      height: 14px;
    }
    .leaflet-popup-content-wrapper {
      background: #110d1f;
      color: #ffffff;
      border: 1px solid rgba(139,92,246,0.3);
      border-radius: 12px;
    }
    .leaflet-popup-tip { background: #110d1f; }
    .leaflet-popup-content { 
      color: #ffffff; 
      font-size: 13px;
      margin: 10px 14px;
    }
    .store-name { 
      font-weight: 600; 
      color: #a78bfa;
      margin-bottom: 2px;
    }
    .store-addr { 
      color: rgba(255,255,255,0.5); 
      font-size: 11px; 
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    const violetIcon = L.divIcon({
      className: '',
      html: '<div style="width:16px;height:16px;background:#8b5cf6;border:2.5px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(139,92,246,0.6)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -12],
    });

    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + 
      encodeURIComponent('${city}, ${country}') + '&limit=1')
      .then(r => r.json())
      .then(cityData => {
        if (!cityData.length) return;
        
        const cityLat = parseFloat(cityData[0].lat);
        const cityLon = parseFloat(cityData[0].lon);
        
        map.setView([cityLat, cityLon], 13);

        function runOverpass(query) {
          return fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: 'data=' + encodeURIComponent(query),
          }).then(r => r.json());
        }

        const nameQuery = '[out:json][timeout:25];(' +
          'node["name"~"${supermarketName}",i]["shop"="supermarket"]' +
          '(around:5000,' + cityLat + ',' + cityLon + ');' +
          'way["name"~"${supermarketName}",i]["shop"="supermarket"]' +
          '(around:5000,' + cityLat + ',' + cityLon + ');' +
        ');out body center;';

        const brandQuery = '[out:json][timeout:25];(' +
          'node["brand"~"${supermarketName}",i]' +
          '(around:5000,' + cityLat + ',' + cityLon + ');' +
          'way["brand"~"${supermarketName}",i]' +
          '(around:5000,' + cityLat + ',' + cityLon + ');' +
        ');out body center;';

        function renderResults(elements) {
          const bounds = [];

          elements.forEach((el) => {
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            if (!lat || !lon) return;

            bounds.push([lat, lon]);

            const name = el.tags?.name || '${supermarketName}';
            const addr = [
              el.tags?.['addr:street'],
              el.tags?.['addr:housenumber'],
            ].filter(Boolean).join(' ') || 'Tap for directions';

            L.marker([lat, lon], { icon: violetIcon })
              .addTo(map)
              .bindPopup(
                '<div class="store-name">' + name + '</div>' +
                '<div class="store-addr">' + addr + '</div>'
              );
          });

          if (bounds.length > 0) {
            if (bounds.length === 1) {
              map.setView(bounds[0], 15);
            } else {
              map.fitBounds(bounds, { padding: [40, 40] });
            }
          }
        }

        function showNoResults() {
          L.marker([cityLat, cityLon], { icon: violetIcon })
            .addTo(map)
            .bindPopup(
              '<div class="store-name">${supermarketName}</div>' +
              '<div class="store-addr">No ${supermarketName} locations found in OpenStreetMap for this area yet.</div>'
            )
            .openPopup();
        }

        runOverpass(nameQuery)
          .then(data => {
            const elements = data.elements || [];
            if (elements.length > 0) {
              renderResults(elements);
              return;
            }
            // Fallback: broader search using the brand tag.
            return runOverpass(brandQuery).then(brandData => {
              const brandElements = brandData.elements || [];
              if (brandElements.length > 0) {
                renderResults(brandElements);
              } else {
                showNoResults();
              }
            });
          })
          .catch(() => {
            map.setView([cityLat, cityLon], 14);
          });
      })
      .catch(() => {
        map.setView([38.9637, 22.3261], 7);
      });
  </script>
</body>
</html>
  `;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="none"
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.header}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>{supermarketName}</Text>
              <Text style={styles.headerSub}>
                Nearby locations in {city}
              </Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.mapContainer}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text style={styles.loadingText}>
                Finding {supermarketName} locations...
              </Text>
            </View>
          )}
          <WebView
            source={{ html: mapHtml }}
            style={styles.webview}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
            mixedContentMode="always"
            onError={() => setLoading(false)}
          />
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '82%',
    backgroundColor: '#09090f',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,92,246,0.1)',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#09090f',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#09090f',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  footer: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139,92,246,0.08)',
  },
  footerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
  },
});
