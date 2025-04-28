import { Resend } from 'resend';
import { render } from '@react-email/render';
import MyEmail from './MyEmail.js';
import { createElement } from 'react';

const resend = new Resend('re_D38E9uf1_6p5gZ1UnqXG89htTuGDJWHoX');

async function sendEmail() {
  const emailHtml = await render(
    createElement(MyEmail, { 
      userName: "Andsunlit", 
      remainingClasses: 5, 
      completedClasses: 10,
      expirationDate: "2025-05-30"
    })
  );

  await resend.emails.send({
    from: 'reminder@talktalk.space',
    to: 'andsunlit@gmail.com',
    subject: 'TalkTalk.Space - Class Balance Update',
    html: emailHtml,
  }).then((email) => {
    console.log(email);
  }).catch((error) => {
    console.error(error);
  });
}

sendEmail();
