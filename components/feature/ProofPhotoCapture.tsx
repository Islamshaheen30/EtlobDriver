import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

interface ProofPhotoCaptureProps {
  visible: boolean;
  orderId: string;
  orderNumber: string;
  onConfirm: (uri: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function ProofPhotoCapture({
  visible,
  orderId,
  orderNumber,
  onConfirm,
  onSkip,
  onClose,
}: ProofPhotoCaptureProps) {
  const { theme, t, isRTL } = useApp();
  const c = theme.colors;
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTakePhoto = async () => {
    setLoading(true);
    try {
      const permResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permResult.status !== 'granted') {
        setLoading(false);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChooseGallery = async () => {
    setLoading(true);
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permResult.status !== 'granted') {
        setLoading(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (photoUri) {
      onConfirm(photoUri);
      setPhotoUri(null);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  const handleClose = () => {
    setPhotoUri(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: c.surface }]}>
          {/* Handle bar */}
          <View style={[styles.handle, { backgroundColor: c.border }]} />

          {/* Header */}
          <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.iconWrap, { backgroundColor: Colors.primary + '22' }]}>
              <MaterialIcons name="camera-alt" size={24} color={Colors.primary} />
            </View>
            <View style={[styles.headerText, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : Spacing.sm, marginRight: isRTL ? Spacing.sm : 0 }]}>
              <Text style={[styles.title, { color: c.text }]}>{t('proofPhotoTitle')}</Text>
              <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                {t('orderID')}{orderNumber}
              </Text>
            </View>
            <Pressable onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={22} color={c.textMuted} />
            </Pressable>
          </View>

          <Text style={[styles.description, { color: c.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('proofPhotoSubtitle')}
          </Text>

          {/* Photo preview or placeholder */}
          {photoUri ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: photoUri }}
                style={styles.preview}
                contentFit="cover"
                transition={200}
              />
              <View style={[styles.previewBadge, { backgroundColor: '#4CAF50' }]}>
                <MaterialIcons name="check" size={14} color="#fff" />
                <Text style={styles.previewBadgeText}>{t('proofPhotoSuccess')}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.placeholder, { backgroundColor: c.card, borderColor: c.border }]}>
              <MaterialIcons name="add-a-photo" size={44} color={c.textMuted} />
              <Text style={[styles.placeholderText, { color: c.textMuted }]}>{t('takePhoto')}</Text>
            </View>
          )}

          {/* Action buttons */}
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.lg }} />
          ) : photoUri ? (
            <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
                onPress={handleRetake}
              >
                <MaterialIcons name="refresh" size={18} color={c.text} />
                <Text style={[styles.secondaryBtnText, { color: c.text }]}>{t('retakePhoto')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
                onPress={handleConfirm}
              >
                <MaterialIcons name="check-circle" size={20} color="#1A1A1A" />
                <Text style={styles.primaryBtnText}>{t('usePhoto')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.captureActions}>
              <Pressable
                style={({ pressed }) => [styles.cameraBtn, { backgroundColor: Colors.primary, ...Shadow.lg, opacity: pressed ? 0.85 : 1 }]}
                onPress={handleTakePhoto}
              >
                <MaterialIcons name="camera-alt" size={22} color="#1A1A1A" />
                <Text style={styles.cameraBtnText}>{t('takePhoto')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.galleryBtn, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
                onPress={handleChooseGallery}
              >
                <MaterialIcons name="photo-library" size={20} color={c.text} />
                <Text style={[styles.galleryBtnText, { color: c.text }]}>{t('choosePhoto')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
                onPress={onSkip}
              >
                <Text style={[styles.skipText, { color: c.textMuted }]}>{t('skipProof')}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  previewContainer: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
  },
  previewBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
  },
  previewBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  placeholder: {
    height: 160,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  placeholderText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  actions: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  secondaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
    gap: Spacing.sm,
  },
  primaryBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#1A1A1A',
  },
  captureActions: {
    gap: Spacing.sm,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: Radius.xl,
    gap: Spacing.sm,
  },
  cameraBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#1A1A1A',
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  galleryBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
