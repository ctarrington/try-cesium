import { useEffect, useRef, useState } from "react";
import type { Metadata } from "./models.ts";

const FPS = 15;

export const useFetchAll = () => {
  const tick = useRef(0);
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  useEffect(() => {
    console.log("set up interval for fetching metadata");
    const intervalId = setInterval(() => {
      const tickString = tick.current.toString().padStart(6, "0");

      fetch(`http://localhost:3001/metadata/${tickString}`)
        .then((response) => response.json())
        .then((data) => {
          setMetadata(data);
        })
        .catch((error) => {
          console.error("Error fetching sensor data:", error);
          tick.current = 0;
        });

      tick.current = tick.current + 1;
    }, 1000 / FPS);

    return () => {
      clearInterval(intervalId);
    };
  }, [setMetadata]);

  return { metadata };
};
