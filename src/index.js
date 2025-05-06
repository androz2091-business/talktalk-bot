import 'dotenv/config';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { createElement } from 'react';
import MyEmail from './MyEmail.js';

import { getAllRemainingClasses } from './calculateRemainingClasses.js';
import readSheet from './readGoogleSheet.js';

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const studentList = (await readSheet()).slice(0, 2);
  // const studentList = await readSheet();

  const classInfoList = await getAllRemainingClasses(studentList);

  console.log('✅ Remaining class info per student:');
  console.log(classInfoList);

  if (classInfoList.length === 0) {
    console.warn('⚠️ No students passed Calendly checks or data was filtered out.');
  }

  for (const student of classInfoList) {
    const { email, remaining, expiration, count, name } = student;
    const firstName = name?.split(' ')[0]

    const emailHtml = await render(
      createElement(MyEmail, {
        userName: firstName,
        remainingClasses: remaining,
        completedClasses: count,
        expirationDate: expiration,
      })
    );

    console.log(`--- Email to: ${email} ---`);
    console.log(emailHtml);

    // 나중에 실제 전송할 땐 아래 사용
    await resend.emails.send({
      from: 'reminder@talktalk.space',
      to: 'andsunlit@gmail.com', // email
      subject: `Hi, here's your weekly class update`,
      html: emailHtml,
    });
  }
}

main().catch(console.error);
