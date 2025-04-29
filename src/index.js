import { Resend } from 'resend';
import { render } from '@react-email/render';
import MyEmail from './MyEmail.js';
import { createElement } from 'react';

const resend = new Resend('re_D38E9uf1_6p5gZ1UnqXG89htTuGDJWHoX');

async function sendEmail() {
  const userName = "Andsunlit";
  const remainingClasses = 5;
  const completedClasses = 10;
  const expirationDate = "2025-05-30";

  const emailHtml = await render(
    createElement(MyEmail, { 
      userName, 
      remainingClasses, 
      completedClasses,
      expirationDate
    })
  );

  await resend.emails.send({
    from: 'reminder@talktalk.space',
    to: 'andsunlit@gmail.com',
    subject: `Hi ${userName}, here's your weekly class update`,
    html: emailHtml,
  }).then((email) => {
    console.log(email);
  }).catch((error) => {
    console.error(error);
  });
}

sendEmail();
