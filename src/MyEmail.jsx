import React from 'react';
import { Html, Head, Preview, Body, Container, Text, Heading, Button, Img, Section, Row, Column } from '@react-email/components';

export default function MyEmail({ userName, completedClasses, remainingClasses, expirationDate }) {
  return (
    <Html>
      <Head />
      <Preview>Your updated class balance from TalkTalk.Space</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <Img 
            src="https://i.imgur.com/xyMsddb.jpeg"
            alt="TalkTalk Logo"
            width="120"
            height="120"
            style={{ 
              display: 'block', 
              margin: '0 auto 20px', 
              borderRadius: '50%' 
            }}
          />

          <Text style={{ fontSize: '16px', color: '#333', fontWeight: '500', marginBottom: '10px' }}>
            Hello, it's TalkTalk 👋
          </Text>

          <Section style={{ marginBottom: '30px' }}>
            <Row>
              <Column style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '20px' }}>🔥</Text>
                <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{completedClasses}</Text>
                <Text style={{ fontSize: '14px', color: '#555' }}>Classes Completed</Text>
              </Column>
              <Column style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '20px' }}>📚</Text>
                <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{remainingClasses}</Text>
                <Text style={{ fontSize: '14px', color: '#555' }}>Classes Remaining</Text>
              </Column>
              <Column style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '20px' }}>⏰</Text>
                <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{expirationDate}</Text>
                <Text style={{ fontSize: '14px', color: '#555' }}>Expiration Date</Text>
              </Column>
            </Row>
          </Section>

          <Text style={{ color: '#555', fontSize: '16px', marginBottom: '20px', marginTop: '20px' }}>
            Don't forget to book all your remaining classes before they expire! Let's keep your learning journey going strong!
          </Text>

          <Button 
            href="https://talktalk.space" 
            style={{ 
              backgroundColor: '#1c1b39', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              textDecoration: 'none',
              display: 'block',
              margin: '20px auto 30px'
            }}
          >
            Book Your Next Class
          </Button>
        </Container>

        <Container style={{ borderTop: '1px solid #eee', marginTop: '40px', paddingTop: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
          <Text style={{ marginBottom: '5px' }}>
            1000, Adress
          </Text>
          <Text style={{ marginBottom: '20px' }}>
            <a href="https://your-unsubscribe-link.com" style={{ color: '#999', textDecoration: 'underline' }}>
              Unsubscribe
            </a>
          </Text>
          <Section>
            <Row>
              <Column>
                <a href="https://yourwebsite.com">
                  <Img src="https://i.imgur.com/Pc1NAun.png" alt="Website" width="24" style={{ margin: '0 10px' }} />
                </a>
              </Column>
              <Column>
                <a href="https://discord.gg/nPktyQUQ3v">
                  <Img src="https://i.imgur.com/8kprVul.png" alt="Discord" width="24" style={{ margin: '0 10px' }} />
                </a>
              </Column>
            </Row>
          </Section>
        </Container>

      </Body>
    </Html>
  );
}
