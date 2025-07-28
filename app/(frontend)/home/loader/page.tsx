'use client';

import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import styles from './styles.module.css';
import StarIcon from './StarIcon';

// Generate numbers where first half < 50 and second half > 50
const generateRandomNumbers = () => {
  const count = Math.floor(Math.random() * 3) + 4; // 4 to 6 numbers
  const numbers = [15]; // Start with 15
  
  // Calculate how many numbers we need before and after 50
  const firstHalfCount = Math.floor((count - 1) / 2);
  const secondHalfCount = count - 1 - firstHalfCount;
  
  // Generate first half numbers (< 50)
  for (let i = 0; i < firstHalfCount; i++) {
    const lastNum = numbers[numbers.length - 1];
    const min = lastNum + 5;
    const max = 45; // Keep it less than 50
    numbers.push(Math.floor(Math.random() * (max - min) + min));
  }
  
  // Add 50 in the middle
  numbers.push(50);
  
  // Generate second half numbers (> 50)
  for (let i = 0; i < secondHalfCount; i++) {
    const lastNum = numbers[numbers.length - 1];
    const min = Math.max(lastNum + 5, 55);
    const max = 95;
    numbers.push(Math.floor(Math.random() * (max - min) + min));
  }
  
  numbers.push(99); // End with 100
  return numbers;
};

const numbers = generateRandomNumbers();

export default function Loader() {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Hide body scroll during animation
    document.body.style.overflow = 'hidden';
    
    // Check if content might be cached (using performance navigation type)
    const navEntry = window.performance.getEntriesByType('navigation')[0];
    const isCached = navEntry && 'type' in navEntry && navEntry.type === 'reload';
    
    // Adjust animation speeds based on whether content is cached
    const speedMultiplier = isCached ? 0.7 : 1; // Faster if cached
    
    const windowWidth = window.innerWidth;
    const wrapperWidth = 90;
    const padding = windowWidth * 0.08;
    const finalPosition = windowWidth - wrapperWidth - (padding * 2);
    const stepDistance = finalPosition / (numbers.length - 1);
    const tl = gsap.timeline();

    // Initial setup - hide all digits except the first one
    document.querySelectorAll(`.${styles.digit}`).forEach((digit, index) => {
      if (index > 0) {
        gsap.set(digit, { opacity: 0 });
      }
    });

    // Initial position at left side with padding
    gsap.set(`.${styles.countWrapper}`, {
      x: padding + 40,
    });

    numbers.forEach((_, index) => {
      if (index === 0) return;

      const xPosition = -90 * (index + 1);
      
      tl.to(document.querySelector(`.${styles.digit}:nth-child(${index})`), {
        opacity: 0,
        duration: 0.15 * speedMultiplier,
        ease: "power2.out",
      });

      tl.to(`.${styles.count}`, {
        x: xPosition,
        duration: 0.3 * speedMultiplier,
        ease: "power4.inOut",
      }, ">");

      tl.to(document.querySelector(`.${styles.digit}:nth-child(${index + 1})`), {
        opacity: 1,
        duration: 0.15 * speedMultiplier,
        ease: "power2.in",
      }, "<");

      tl.to(`.${styles.countWrapper}`, {
        x: padding + 40 + (stepDistance * index),
        duration: 0.3 * speedMultiplier,
        ease: "power4.inOut",
      }, "<");
    });

    const numbersDuration = tl.duration();
    gsap.set(`.${styles.revealer} svg`, { scale: 0 });

    const baseDelays = [0.3, 0.5, 0.7];
    const delays = baseDelays.map(delay => numbersDuration + (delay * speedMultiplier));
    let completedStars = 0;

    document.querySelectorAll(`.${styles.revealer} svg`).forEach((el, i) => {
      gsap.to(el, {
        scale: 45,
        duration: 0.5 * speedMultiplier,
        ease: "power4.inOut",
        delay: delays[i],
        onComplete: () => {
          completedStars++;
          if (completedStars === 3) {
            // All stars animation complete
            gsap.to(`.${styles.header} h1`, {
              onStart: () => {
                gsap.to(`.${styles.toggleBtn}`, {
                  scale: 1,
                  duration: 0.4 * speedMultiplier,
                  ease: "power4.inOut",
                });
                gsap.to(`.${styles.line} p`, {
                  y: 0,
                  duration: 0.4 * speedMultiplier,
                  stagger: 0.05 * speedMultiplier,
                  ease: "power3.out",
                });
              },
              rotateY: 0,
              opacity: 1,
              duration: 0.8 * speedMultiplier,
              ease: "power3.out",
              onComplete: () => {
                // Wait a bit before signaling completion
                setTimeout(() => {
                  document.body.style.overflow = 'auto';
                  setAnimationComplete(true);
                  window.dispatchEvent(new Event('loaderComplete'));
                }, 200 * speedMultiplier);
              }
            });
          }
        },
      });
    });

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (animationComplete) return null;

  return (
    <div className={styles.loader}>
      <div className={styles.countWrapper}>
        <div className={styles.count}>
          {numbers.map((number, index) => (
            <div key={index} className={styles.digit}>
              <h1>{number}</h1>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.revealer}>
        <StarIcon fill="black" />
      </div>

      <div className={styles.revealer}>
        <StarIcon fill="#76C043" />
      </div>

      <div className={styles.revealer}>
        <StarIcon fill="white" />
      </div>
    </div>
  );
}
