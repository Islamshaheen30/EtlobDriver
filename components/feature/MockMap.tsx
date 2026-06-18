import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useOrders } from '@/hooks/useOrders';

const { width } = Dimensions.get('window');

interface MockMapProps {
  pickupLabel?: string;
  dropoffLabel?: string;
  height?: number;
  showRoute?: boolean;
}

export function MockMap({
  pickupLabel = 'Restaurant',
  dropoffLabel = 'Customer',
  height = 220,
  showRoute = true,
}: MockMapProps) {
  const { theme, t } = useApp();
  const { riderLocation, isLocationSharing, locationPermissionDenied } = useOrders();
  const c = theme.colors;
  const isDark = theme.isDark;

  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const bikeX = useRef(new Animated.Value(0)).current;
  const bikeY = useRef(new Animated.Value(0)).current;
  const gpsPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    if (showRoute) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(bikeX, { toValue: 1, duration: 2800, useNativeDriver: true }),
            Animated.timing(bikeY, { toValue: 1, duration: 2800, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(bikeX, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(bikeY, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [showRoute]);

  // GPS pulse ring
  useEffect(() => {
    if (isLocationSharing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(gpsPulse, { toValue: 2.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(gpsPulse, { toValue: 1, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isLocationSharing]);

  const mapBg = isDark ? '#1A2820' : '#E8F0E8';
  const gridColor = isDark ? '#1E2E1E' : '#D8E8D8';

  return (
    <View style={[styles.container, { height, backgroundColor: mapBg, borderRadius: Radius.lg, overflow: 'hidden' }]}>
      {/* Grid */}
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={`h${i}`} style={[styles.gridLineH, { backgroundColor: gridColor, top: (height / 8) * i }]} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={`v${i}`} style={[styles.gridLineV, { backgroundColor: gridColor, left: (width / 6) * i }]} />
      ))}

      {/* Route */}
      {showRoute && (
        <View style={styles.routeContainer}>
          <View style={[styles.routeLine, { backgroundColor: Colors.primary + '44' }]} />
          <View style={[styles.routeDash, { borderColor: Colors.primary }]} />
        </View>
      )}

      {/* Pickup marker */}
      <View style={[styles.markerContainer, styles.pickupMarker]}>
        <Animated.View style={[styles.markerPulse, { backgroundColor: '#4CAF5033', transform: [{ scale: pulseAnim }] }]} />
        <View style={[styles.marker, { backgroundColor: '#4CAF50' }]}>
          <MaterialIcons name="store" size={14} color="#fff" />
        </View>
        <View style={[styles.markerLabel, { backgroundColor: isDark ? '#1A1A1A' : '#fff' }]}>
          <Text style={[styles.markerLabelText, { color: c.text }]} numberOfLines={1}>{pickupLabel}</Text>
        </View>
      </View>

      {/* Dropoff marker */}
      <View style={[styles.markerContainer, styles.dropoffMarker]}>
        <Animated.View style={[styles.markerPulse, { backgroundColor: Colors.primary + '33', transform: [{ scale: pulseAnim }] }]} />
        <View style={[styles.marker, { backgroundColor: Colors.primary }]}>
          <MaterialIcons name="home" size={14} color="#1A1A1A" />
        </View>
        <View style={[styles.markerLabel, { backgroundColor: isDark ? '#1A1A1A' : '#fff' }]}>
          <Text style={[styles.markerLabelText, { color: c.text }]} numberOfLines={1}>{dropoffLabel}</Text>
        </View>
      </View>

      {/* Animated rider bike */}
      {showRoute && (
        <Animated.View
          style={[
            styles.bikeIcon,
            {
              transform: [
                {
                  translateX: bikeX.interpolate({
                    inputRange: [0, 1],
                    outputRange: [width * 0.15, width * 0.65],
                  }),
                },
                {
                  translateY: bikeY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height * 0.55, height * 0.2],
                  }),
                },
              ],
            },
          ]}
        >
          {/* GPS accuracy ring */}
          {isLocationSharing && (
            <Animated.View
              style={[
                styles.gpsRing,
                { borderColor: Colors.primary + '55', transform: [{ scale: gpsPulse }] },
              ]}
            />
          )}
          <View style={[styles.bikeContainer, { backgroundColor: Colors.primary }]}>
            <MaterialIcons name="directions-bike" size={16} color="#1A1A1A" />
          </View>
        </Animated.View>
      )}

      {/* GPS Status badge */}
      <View
        style={[
          styles.mapLabel,
          { backgroundColor: isDark ? '#00000066' : '#ffffff88' },
        ]}
      >
        <MaterialIcons
          name={locationPermissionDenied ? 'location-off' : isLocationSharing ? 'my-location' : 'map'}
          size={12}
          color={isLocationSharing ? Colors.primary : c.textSecondary}
        />
        <Text
          style={[
            styles.mapLabelText,
            { color: isLocationSharing ? Colors.primary : c.textSecondary },
          ]}
        >
          {'  '}
          {locationPermissionDenied
            ? t('gpsPermissionDenied')
            : isLocationSharing
            ? t('gpsSharing')
            : 'Live Navigation'}
        </Text>
        {isLocationSharing && riderLocation && (
          <View style={[styles.gpsDot, { backgroundColor: Colors.primary }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  routeContainer: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    right: '20%',
    bottom: '40%',
    justifyContent: 'center',
  },
  routeLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
    transform: [{ rotate: '-25deg' }],
  },
  routeDash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 4,
    borderStyle: 'dashed',
    transform: [{ rotate: '-25deg' }],
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pickupMarker: {
    left: '12%',
    bottom: '35%',
  },
  dropoffMarker: {
    right: '12%',
    top: '15%',
  },
  markerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    top: -8,
    left: -8,
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerLabel: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    maxWidth: 90,
  },
  markerLabelText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  bikeIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  bikeContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  mapLabel: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  mapLabelText: {
    fontSize: FontSize.xs,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
});
