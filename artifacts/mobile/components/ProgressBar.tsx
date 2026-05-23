import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  progress: number;
  color?: string;
  height?: number;
}

export default function ProgressBar({ progress, color, height = 8 }: Props) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(100, Math.max(0, progress)),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.track, { height, backgroundColor: colors.muted, borderRadius: height / 2, flex: 1 }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color ?? colors.primary,
            borderRadius: height / 2,
            width: anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: "hidden" },
  fill: {},
});
