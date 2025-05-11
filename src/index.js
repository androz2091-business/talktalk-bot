import 'dotenv/config';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { createElement } from 'react';
import MyEmail from './MyEmail.js';

import { getAllRemainingClasses } from './calculateRemainingClasses.js';
import readSheet from './readGoogleSheet.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function main() {
  const studentList = (await readSheet()).slice(7, 10);
  //const studentList = await readSheet();

  const classInfoList = await getAllRemainingClasses(studentList);

  if (classInfoList.length === 0) {
    console.warn('⚠️ No students passed Calendly checks or data was filtered out.');
  }

  for (const student of classInfoList) {
    const { email, remaining, expiration, count, name } = student;
    const firstName = name?.split(' ')[0] || 'there';

    const emailHtml = await render(
      createElement(MyEmail, {
        userName: firstName,
        remainingClasses: remaining,
        completedClasses: count,
        expirationDate: expiration,
      })
    );

    console.log(`--- Email to: ${email} ---`);
    //console.log(emailHtml);
    // console.log(firstName);
    // console.log(remaining);
    // console.log(count);
    // console.log(expiration);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'sam.lee@epfl.ch',
      subject: `Hi ${firstName}, here's your weekly class update`,
      html: emailHtml,
    });
  }
}

main().catch(console.error);
