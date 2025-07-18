require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: ['@babel/preset-env', '@babel/preset-react'],
});

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const MyEmail = require('./MyEmail.jsx').default;

const html = ReactDOMServer.renderToStaticMarkup(
  React.createElement(MyEmail, {
    userName: 'Sam',
    completedClasses: 8,
    remainingClasses: 2,
    expirationDate: '18/07/2025',
    comment: 'This week: Focus on phrasal verbs!'
  })
);

require('fs').writeFileSync('email-preview.html', html);
console.log('Preview written to email-preview.html');