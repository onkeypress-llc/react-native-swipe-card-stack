import {
  Animated,
  StyleSheet,
  type GestureResponderHandlers,
  Text,
  useWindowDimensions,
} from 'react-native';
import React, { useRef } from 'react';

interface Props {
  children: React.ReactNode;
  width: number;
  height: number;
  depth: number;
  position: Animated.ValueXY;
  handlers: GestureResponderHandlers | undefined;
  previousPosition: Animated.ValueXY | null;
  acceptElement?: React.ReactNode;
  rejectElement?: React.ReactNode;
}

export default function AnimatedSwipeView({
  children,
  width,
  height,
  depth,
  position,
  handlers,
  previousPosition,
  acceptElement,
  rejectElement,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const rotate = useRef(
    position.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    })
  ).current;

  const likeOpacity = useRef(
    position.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    })
  ).current;

  const nopeOpacity = useRef(
    position.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp',
    })
  ).current;

  // tied to previous, if pressent
  const cardOpacity = useRef(
    previousPosition
      ? previousPosition.x.interpolate({
          inputRange: [-screenWidth / 2, 0, screenWidth / 2],
          outputRange: [1, 0, 1],
          extrapolate: 'clamp',
        })
      : 1.0
  ).current;
  const cardScale = useRef(
    previousPosition
      ? previousPosition.x.interpolate({
          inputRange: [-screenWidth / 2, 0, screenWidth / 2],
          outputRange: [1, 0.8, 1],
          extrapolate: 'clamp',
        })
      : 1.0
  ).current;

  const transformStyle = {
    transform: [
      { rotate },
      { scale: cardScale },
      ...position.getTranslateTransform(),
    ],
    opacity: cardOpacity,
  };
  return (
    <Animated.View
      {...handlers}
      style={[
        styles.view,
        transformStyle,
        {
          height: height,
          width: width,
          zIndex: depth,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.swipeTextView,
          styles.acceptContainer,
          {
            opacity: likeOpacity,
          },
        ]}
      >
        {acceptElement || (
          <Text style={[styles.text, styles.acceptText]}>Like</Text>
        )}
      </Animated.View>
      <Animated.View
        style={[
          styles.swipeTextView,
          styles.rejectContainer,
          {
            opacity: nopeOpacity,
          },
        ]}
      >
        {rejectElement || (
          <Text style={[styles.text, styles.rejectText]}>Nope</Text>
        )}
      </Animated.View>

      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  view: {
    position: 'absolute',
  },
  rejectText: {
    borderColor: 'red',
    color: 'red',
  },
  acceptText: {
    borderColor: 'green',
    color: 'green',
  },
  rejectContainer: {
    transform: [{ rotate: '30deg' }],
    right: 40,
  },
  acceptContainer: {
    transform: [{ rotate: '-30deg' }],
    left: 40,
  },
  swipeTextView: {
    position: 'absolute',
    top: 50,
    zIndex: 1000,
  },
  text: {
    borderWidth: 1,
    fontSize: 32,
    fontWeight: '800',
    padding: 10,
  },
});
