function spinAnimation(angle, callback) {
  const spinSound = document.getElementById('spinSound');
  spinSound.play().catch(err => console.log('Audio play failed:', err));

  const rotationObj = { angle: 0 };

  gsap.to(rotationObj, {
    angle: angle,
    duration: 5,
    ease: 'power4.out',
    onUpdate: () => {
      rotationAngle = rotationObj.angle;
      drawRoulette();
    },
    onComplete: () => {
      spinSound.pause();
      spinSound.currentTime = 0;
      callback();
    }
  });
}