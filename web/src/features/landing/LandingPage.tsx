import { Button, Card, Divider, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

import { IconMapPin } from '@tabler/icons-react';
import NavBar from './components/NavBar/NavBar';
import hero from '../../assets/hero.png';
import logoText from '../../assets/logo-text.svg';

export default function LandingPage() {
  return (
    <div>
      <header
        style={{
          position: 'sticky',
          height: '80px',
          top: 0,
          zIndex: 1000,
          backgroundColor: '#0466C8',
        }}
      >
        <div className="container-lg">
          <NavBar />
        </div>
      </header>

      <main>
        <section style={{ backgroundColor: '#0466C8' }}>
          <div className="container-lg" style={{ padding: '64px 0' }}>
            <SimpleGrid cols={2}>
              <Stack gap={'xl'}>
                <Title order={1} size={64} c="white">
                  Power your daily runs — without the <span style={{ color: '#FAA916' }}>burn.</span>
                </Title>

                <div>
                  <Button component={Link} to="/map" size="lg" radius="md" color="#0AB6FF" c="black">
                    Start now
                  </Button>
                </div>
              </Stack>

              <Image
                src={hero}
                alt="react"
                style={{
                  objectFit: 'contain',
                  border: '2.5px solid #0AB6FF',
                  borderRadius: 'var(--mantine-radius-md)',
                }}
              />
            </SimpleGrid>
          </div>
        </section>

        <section>
          <div className="container-lg" style={{ padding: '64px 0' }}>
            <Stack gap="xl">
              <Title order={2} size={36}>
                Customize routes for your needs.
              </Title>

              <SimpleGrid cols={3}>
                <Card padding="lg">
                  <Stack>
                    <IconMapPin size={48} stroke={1} color="#0466C8" />

                    <Text size="xl" fw={500}>
                      Multi-City
                    </Text>

                    <Text c="dimmed">Lorem ipsum dolor sit amet consectetur adipisicing elit.</Text>
                  </Stack>
                </Card>

                <Card padding="lg">
                  <Stack>
                    <IconMapPin size={48} stroke={1} color="#0466C8" />

                    <Text size="xl" fw={500}>
                      Flexible Modes
                    </Text>

                    <Text c="dimmed">Lorem ipsum dolor sit amet consectetur adipisicing elit.</Text>
                  </Stack>
                </Card>

                <Card padding="lg">
                  <Stack>
                    <IconMapPin size={48} stroke={1} color="#0466C8" />

                    <Text size="xl" fw={500}>
                      Anytime Year-round
                    </Text>

                    <Text c="dimmed">Lorem ipsum dolor sit amet consectetur adipisicing elit.</Text>
                  </Stack>
                </Card>
              </SimpleGrid>
            </Stack>
          </div>
        </section>

        <section>
          <div className="container-lg" style={{ padding: '64px 0' }}>
            <SimpleGrid cols={2}>
              <div></div>

              <Stack gap="xl">
                <Title order={2} size={48} maw={500}>
                  Don't Let the Sun Slow You Down
                </Title>

                <Text>
                  Too much sunlight should not be a reason to stop your fitness grind. Keep your routine going strong —
                  just tell us how much shade you prefer, and we'll generate a route tailored to your comfort.
                </Text>
              </Stack>
            </SimpleGrid>
          </div>
        </section>
      </main>

      <footer
        style={{
          backgroundColor: '#1C2321',
          height: '350px',
        }}
      >
        <div className="container-lg" style={{ padding: '64px 0' }}>
          <Stack justify="space-between" h="100%">
            <SimpleGrid cols={4}>
              <img src={logoText} alt="logo" width={200} />

              <Stack c="white">
                <Title size="lg">Contact</Title>

                <Text>m.nascimento@northeastern.edu</Text>

                <Text>nie.han@northeastern.edu</Text>
              </Stack>
            </SimpleGrid>

            <Stack c="white">
              <Divider />

              <Text size="sm">Demo for SSTD 2025.</Text>

              <Text size="sm">© 2025 ShadeRoute. All rights reserved. </Text>
            </Stack>
          </Stack>
        </div>
      </footer>
    </div>
  );
}
