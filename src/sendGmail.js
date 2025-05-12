import 'dotenv/config';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { createElement } from 'react';
import MyEmail from './MyEmail.js';

import { getAllRemainingClasses } from './calculateRemainingClasses.js';
import readSheet from './readGoogleSheet.js';
import { google } from 'googleapis';


async function getAccessToken() {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
  
    oAuth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
  
    const accessToken = await oAuth2Client.getAccessToken();
    return accessToken.token;
}

async function getTransporter() {
    const accessToken = await getAccessToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken,
    },
  });

  return transporter;
}

async function sendEmail(transporter, to, subject, html) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        html,
    };

    console.log('Sending email to:', to);
    await transporter.sendMail(mailOptions);
}

export { getTransporter, sendEmail };


