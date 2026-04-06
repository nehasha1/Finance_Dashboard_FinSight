import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (val: number) => string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 600, 
  format = (val) => val.toString() 
}) => {
  const [count, setCount] = useState(0);
  const prevValue = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    const startValue = prevValue.current;
    const endValue = value;
    const distance = endValue - startValue;

    const animate = (currentTime: number) => {
      if (!startTime.current) startTime.current = currentTime;
      const progress = Math.min((currentTime - startTime.current) / duration, 1);
      
      // Ease-out cubic curve: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = startValue + distance * easeProgress;
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = endValue;
        startTime.current = 0;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{format(count)}</span>;
};

export default AnimatedCounter;
