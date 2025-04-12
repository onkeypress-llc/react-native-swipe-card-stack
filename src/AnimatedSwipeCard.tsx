import { Animated, useWindowDimensions, PanResponder } from 'react-native';
import React, { useState, useMemo } from 'react';
import AnimatedSwipeView from './AnimatedSwipeView';

interface Props {
  position: Animated.ValueXY;
  previousPosition: Animated.ValueXY | null;
  children: React.ReactNode;
  width: number;
  height: number;
  depth: number;
  isActive: boolean;
  acceptItemFunction: () => void;
  rejectItemFunction: () => void;
}

export default function AnimatedSwipeCard({
  width,
  height,
  depth,
  isActive,
  acceptItemFunction,
  rejectItemFunction,
  children,
  position,
  previousPosition,
}: Props) {
  // whether to show this element at all
  const [isShown, setIsShown] = useState(true);

  const { width: screenWidth } = useWindowDimensions();

  const panResponder = useMemo(
    () =>
      isActive
        ? PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
              [null, { dx: position.x, dy: position.y }],
              { useNativeDriver: false }
            ),
            onPanResponderRelease(_, gestureState) {
              if (gestureState.dx > 120) {
                Animated.spring(position, {
                  toValue: { x: screenWidth + 100, y: gestureState.dy },
                  useNativeDriver: true,
                }).start(() => setIsShown(false));
                acceptItemFunction();
              } else if (gestureState.dx < -120) {
                Animated.spring(position, {
                  toValue: { x: -screenWidth - 100, y: gestureState.dy },
                  useNativeDriver: true,
                }).start(() => setIsShown(false));
                rejectItemFunction();
              } else {
                Animated.spring(position, {
                  toValue: { x: 0, y: 0 },
                  friction: 4,
                  useNativeDriver: true,
                }).start();
              }
            },
          })
        : null,
    [
      isActive,
      setIsShown,
      acceptItemFunction,
      rejectItemFunction,
      position,
      screenWidth,
    ]
  );
  if (!isShown) {
    return null;
  }
  return (
    <AnimatedSwipeView
      handlers={panResponder?.panHandlers}
      width={width}
      height={height}
      depth={depth}
      position={position}
      previousPosition={previousPosition}
    >
      {children}
    </AnimatedSwipeView>
  );
}
