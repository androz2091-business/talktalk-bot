import React from 'react';
import { Html, Head, Preview, Body, Container, Text, Heading, Button, Img, Section, Row, Column } from '@react-email/components';

export default function MyEmail({ userName, completedClasses, remainingClasses, expirationDate }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your updated class balance from TalkTalk.Space</Preview>
      <Body style={{ backgroundColor: '#ffffff', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}>
          <Img 
            src="https://i.imgur.com/xyMsddb.jpeg"
            alt="TalkTalk Logo"
            width="120"
            height="120"
            style={{ 
              display: 'block', 
              margin: '0 auto 20px', 
              borderRadius: '50%',
              marginBottom: '10px' 
            }}
          />

          <Text style={{ fontSize: '16px', color: '#333', fontWeight: '500', marginBottom: '20px' }}>
            Hello{userName ? ` ${userName}` : ''}, it's TalkTalk 👋
          </Text>

          <Section style={{ marginBottom: '20px' }}>
            <Row>
              <Column style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '20px' }}>🔥</Text>
                <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#1c1b3b'}}>{completedClasses != null ? completedClasses : '--'}</Text>
                <Text style={{ fontSize: '14px', color: '#555' }}>Classes Completed</Text>
              </Column>
              <Column style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '20px' }}>📚</Text>
                <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#1c1b3b' }}>{remainingClasses}</Text>
                <Text style={{ fontSize: '14px', color: '#555' }}>Classes Remaining</Text>
              </Column>
              <Column style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '20px' }}>⏰</Text>
                <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#1c1b3b' }}>{expirationDate}</Text>
                <Text style={{ fontSize: '14px', color: '#555' }}>Expiration Date</Text>
              </Column>
            </Row>
          </Section>

          <Text style={{ color: '#555', fontSize: '16px', marginBottom: '20px', marginTop: '20px' }}>
            Don't forget to book all your remaining classes before they expire. Let's keep your learning journey going strong!
          </Text>

          <Section style={{ textAlign: 'center' }}>
            <Button 
              href="https://linktr.ee/hey.talktalk" 
              style={{ 
                backgroundColor: '#eb257a', 
                color: '#fff', 
                padding: '12px 15px', 
                borderRadius: '6px', 
                fontWeight: 'bold', 
                textDecoration: 'none',
                display: 'inline-block',
                margin: '20px auto 30px'
              }}
            >
              Book Your Next Class
            </Button>
          </Section>
        </Container>

        <Container
          style={{
            borderTop: '1px solid #eee',
            marginTop: '10px',
            paddingTop: '20px',
            color: '#999',
            fontSize: '12px',
            textAlign: 'center'
          }}
        >
          <Text style={{ marginBottom: '10px', lineHeight: '1.2' }}>
            Connect with us
          </Text>
          <div style={{ textAlign: 'center' }}>
            <a href="https://talktalk.space/" style={{ display: 'inline-block', margin: '0 5px' }}>
              <Img src="https://i.imgur.com/A0VfMwh.png" alt="Visit TalkTalk Website" width="24" />
            </a>
            <a href="https://discord.gg/nPktyQUQ3v" style={{ display: 'inline-block', margin: '0 5px' }}>
              <Img src="https://i.imgur.com/eOpcLAe.png" alt="Discord" width="24" />
            </a>
          </div>
        </Container>
      </Body>
    </Html>
  );
}
