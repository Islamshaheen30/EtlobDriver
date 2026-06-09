import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function RatingStars({ rating, maxStars = 5, size = 18, interactive = false, onRate }: RatingStarsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const halfFilled = !filled && i < rating;
        return (
          <MaterialIcons
            key={i}
            name={filled ? 'star' : halfFilled ? 'star-half' : 'star-border'}
            size={size}
            color={filled || halfFilled ? Colors.primary : '#555'}
            onPress={interactive && onRate ? () => onRate(i + 1) : undefined}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
