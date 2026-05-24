// emails/WelcomeEmail.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from '@react-email/components';

interface Props {
  firstName?: string;
  listName: string;
  brandColor: string;
  missionCopy: string;
  unsubscribeUrl: string;
}

export default function WelcomeEmail({
  firstName,
  listName,
  brandColor,
  missionCopy,
  unsubscribeUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {listName} — you&apos;re in.</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ width: '48px', height: '4px', backgroundColor: brandColor, marginBottom: '24px' }} />
          <Heading
            style={{
              color: '#0a0a0a',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '22px',
              margin: '0 0 16px',
            }}
          >
            Welcome to {listName}
          </Heading>
          <Text style={{ color: '#3a3a3a', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }}>
            {firstName ? `Welcome, ${firstName}.` : 'Welcome.'}{' '}
            {missionCopy}
          </Text>
          <Text style={{ color: '#3a3a3a', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px' }}>
            You&apos;ll hear from us when there&apos;s something worth reading.
          </Text>
          <Button
            href='https://untelevised.media'
            style={{
              backgroundColor: brandColor,
              color: '#ffffff',
              padding: '14px 32px',
              fontWeight: 900,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              fontSize: '12px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Read the Latest
          </Button>
          <Hr style={{ borderColor: '#e5e5e5', margin: '32px 0' }} />
          <Text style={{ color: '#999', fontSize: '11px', lineHeight: '1.5', margin: 0 }}>
            You&apos;re receiving this because you subscribed at untelevised.media.{' '}
            <a href={unsubscribeUrl} style={{ color: '#999' }}>
              Unsubscribe
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
