import 'dotenv/config';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { createElement } from 'react';
import MyEmail from './MyEmail.js';

import { getAllRemainingClasses } from './calculateRemainingClasses.js';
import readSheet from './readGoogleSheet.js';
import { getTransporter, sendEmail } from './sendGmail.js';
async function main() {
  const studentList = await readSheet();

  const classInfoList = await getAllRemainingClasses(studentList);

  if (classInfoList.length === 0) {
    console.warn('⚠️ No students passed Calendly checks or data was filtered out.');
  }

  const transporter = await getTransporter();

  for (const student of classInfoList) {
    const { email, remaining, expiration, count, name } = student;
    const firstName = name?.split(' ')[0] || 'there';

    const emailHtml = await render(
      createElement(MyEmail, {
        userName: firstName,
        remainingClasses: remaining,
        completedClasses: count,
        expirationDate: expiration,
        comment: student.comment,
      })
    );

    // console.log(`--- Email to: ${email} ---`);
    // console.log(emailHtml);
    // console.log(firstName);
    // console.log('Remaining: ', remaining);
    // console.log('Completed: ', count);
    // console.log('Expiration: ', expiration);

    await sendEmail(transporter, email, `Hi ${firstName}, here's your weekly class update`, emailHtml);
  }
}

main().catch(console.error);
