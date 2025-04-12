import { Animated } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AnimatedSwipeCard from './AnimatedSwipeCard';

interface Props<T> {
  loadData: () => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
  width: number;
  height: number;
  onItemApproved: (item: T) => void;
  onItemRejected: (item: T) => void;
  extractID?: (item: T) => string;
}

function defaultIDExtractor(v: any): string {
  return v.id;
}

export default function AnimatedSwipeStack<T>({
  loadData,
  renderItem,
  width,
  height,
  onItemApproved,
  onItemRejected,
  extractID = defaultIDExtractor,
}: Props<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const positionMap = useRef<{ [key: string]: Animated.ValueXY }>({});

  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const cleanup = (items: T[]) => {
      setIsCleaning(true);
      items.forEach((item) => {
        delete positionMap.current[extractID(item)];
      });
      setIsCleaning(false);
    };

    // fake load from from web call
    const newValues = await loadData();
    // process new values, set up positions in map
    const addValues: T[] = [];
    newValues.forEach((value) => {
      const key = extractID(value);
      if (!positionMap.current[key]) {
        // ensure position animated value is initialized
        positionMap.current[key] = new Animated.ValueXY();
      }
      addValues.push(value);
    });
    const offset = 5;
    let start = 0;
    let newIndex = currentIndex;
    // automatically truncate the results more than $offset ago
    if (currentIndex > offset) {
      start = currentIndex - offset;
      newIndex = offset;
    }
    setResults((prev) => [...prev.slice(start), ...addValues]);
    setCurrentIndex(newIndex);
    cleanup(results.slice(0, start));
    setIsLoading(false);
  }, [isLoading, setIsLoading, loadData, currentIndex, extractID, results]);

  useEffect(() => {
    if (currentIndex + 2 > results.length) {
      loadMore();
    }
  }, [currentIndex, results.length, loadMore]);
  return (
    <>
      {results.map((result, i) => {
        if (i > currentIndex + 1) {
          return null;
        }
        const currentPosition = positionMap.current[extractID(result)];
        if (currentPosition == null) {
          console.warn('Missing position variable for element: ', result);
          return null;
        }
        const previous = results[i - 1];
        let previousPosition: Animated.ValueXY | null = null;
        if (previous != null) {
          const previousID = extractID(previous);
          previousPosition = positionMap.current[previousID] || null;
        }
        return (
          <AnimatedSwipeCard
            key={extractID(result)}
            width={width}
            height={height}
            depth={results.length - i}
            position={currentPosition}
            previousPosition={previousPosition}
            isActive={!isCleaning && i === currentIndex}
            acceptItemFunction={() => {
              setCurrentIndex((v) => v + 1);
              onItemApproved(result);
            }}
            rejectItemFunction={() => {
              setCurrentIndex((v) => v + 1);
              onItemRejected(result);
            }}
          >
            {renderItem(result)}
          </AnimatedSwipeCard>
        );
      })}
    </>
  );
}
