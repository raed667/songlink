import { useEffect, useRef } from "react";
import { useCountUp } from "react-countup";

const getCount = async () => {
  const response = await fetch("/vanity_count", { next: { revalidate: 3600 } });
  const data = await response.json();
  return data.count;
};

export const Counter: React.FC = () => {
  const countUpRef = useRef(null);

  const { start, update } = useCountUp({
    ref: countUpRef,
    start: 1,
    end: 10,
    delay: 0,
    duration: 1.5,
  });

  useEffect(() => {
    start();
    getCount().then((count) => {
      update(count);
    });
  }, [start, update]);

  return (
    <div className="mx-auto max-w-2xl mt-8 flex justify-center text-gray-500 grayscale font-extralight">
      <div ref={countUpRef} className="mr-2" />
      <span>good vibes shared 🎶</span>
    </div>
  );
};
