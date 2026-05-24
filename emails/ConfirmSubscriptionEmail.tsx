// emails/ConfirmSubscriptionEmail.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface Props {
  firstName?: string;
  confirmUrl: string;
  listName: string;
  brandColor: string;
}

export default function ConfirmSubscriptionEmail({
  firstName,
  confirmUrl,
  listName,
  brandColor,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your {listName} subscription</Preview>
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
            Confirm Your Subscription
          </Heading>
          <Text style={{ color: '#3a3a3a', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' }}>
            {firstName ? `Hey ${firstName},` : 'Hey,'}{' '}
            you&apos;re one click away from independent news delivered directly to your inbox.
          </Text>
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button
              href={confirmUrl}
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
              Confirm Subscription
            </Button>
          </Section>
          <Text style={{ color: '#5a5a5a', fontSize: '13px', lineHeight: '1.6' }}>
            Or copy and paste this link into your browser:
          </Text>
          <Text
            style={{
              color: brandColor,
              fontSize: '12px',
              wordBreak: 'break-all' as const,
              marginBottom: '32px',
            }}
          >
            {confirmUrl}
          </Text>
          <Hr style={{ borderColor: '#e5e5e5', margin: '24px 0' }} />
          <Text style={{ color: '#999', fontSize: '11px', lineHeight: '1.5', margin: 0 }}>
            If you did not sign up for {listName} updates, you can safely ignore this email.
            This confirmation link expires in 48 hours.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
