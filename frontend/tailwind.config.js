export default {
    theme: {
      extend: {
        backgroundImage: {
          'header': "url('/fondos/fondo-login1.jpg')",
        },
        animation: {
          blink: 'blink 1s ease-in-out infinite'
        },
        keyframes: {
          blink:{
            '0%, 100%': {
              opacity: '1'
            },
            '50%':{
              opacity: '0.5'
            }
          },
          bounceScale: {
            '0%, 100%': { transform: 'scale(0.0)' },
            '50%': { transform: 'scale(1.0)' },
          },
        },
        animation: {
          'double-bounce': 'bounceScale 2s infinite ease-in-out',
          'double-bounce-delay': 'bounceScale 2s infinite ease-in-out -1s',
        },
      },
    },
    plugins: [],
};