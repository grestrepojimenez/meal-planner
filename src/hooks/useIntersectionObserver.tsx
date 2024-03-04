import { useEffect, useRef, useState } from 'react';


export default function useIntersectionOberver(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(true);
  const target = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    if(target?.current){
      observer.observe(target.current );
    }
    return () => observer.disconnect();
  }, []);

  return { isIntersecting, target }
}