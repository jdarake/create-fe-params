anime({
  targets: '.animeStar',
  keyframes: [
    {translateX: [0, -5], translateY: [-30, -32]},
    {translateX: [-5, -10], translateY: [-32, -35]},
    {translateX: [-10, -25], translateY: [-35, -40]},
    {translateX: [-25, -35], translateY: [-40, -55]},
    {translateX: [-35, -48], translateY: [-55, -78]},
    {translateX: [-48, -50], translateY: [-78, -80]},
    
    {translateX: [-50, -45], translateY: [-80, -90]},
    {translateX: [-45, -25], translateY: [-90, -105]},
    {translateX: [-25, -10], translateY: [-105, -115]},
    {translateX: [-10, 0], translateY: [-115, -125]},
    
    {translateX: [0, 10], translateY: [-125, -115]},
    {translateX: [10, 25], translateY: [-115, -105]},
    {translateX: [25, 45], translateY: [-105, -90]},
    {translateX: [45, 50], translateY: [-90, -80]},
    
    {translateX: [50, 45], translateY: [-80, -70]},
    {translateX: [45, 25], translateY: [-70, -55]},
    {translateX: [25, 10], translateY: [-55, -40]},
    {translateX: [10, 0], translateY: [-40, -30]},
    
  ],
  duration: 500,
  easing: 'cubicBezier(.5, .05, .1, .3)'
});
