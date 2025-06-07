import { Button, Card, Divider, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

import { IconMapPin } from '@tabler/icons-react';
import NavBar from './components/NavBar/NavBar';
import hero from '../../assets/hero.png';
import logoText from '../../assets/logo-text.svg';
import styles from './landingPage.module.css';
import change from '../../assets/change.png';
// import sync from '../../assets/sync.png';

export default function LandingPage() {
  return (
    <div>
      <header
        style={{
          position: 'sticky',
          padding: '1rem 0',
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
          <div className={`container-lg ${styles.heroContainer}`}>
            <SimpleGrid cols={{ sm: 2 }} className={styles.heroContent}>
              <Stack gap="xl">
                <Title order={1} c="white" className={styles.mainHeading}>
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
                alt="hero image"
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
          <div className={`container-lg ${styles.featuresContainer}`}>
            <Stack className={styles.features}>
              <Stack gap="xl">
                <Title className={styles.sectionHeading}>Customize routes for your needs.</Title>

                <SimpleGrid cols={{ sm: 3 }}>
                  <Card padding="lg">
                    <Stack>
                      <IconMapPin size={48} stroke={1.5} color="#0466C8" />

                      <Text size="xl" fw={500}>
                        Multi-City
                      </Text>

                      <Text c="dimmed">Lorem ipsum dolor sit amet consectetur adipisicing elit.</Text>
                    </Stack>
                  </Card>

                  <Card padding="lg">
                    <Stack>
                      <IconMapPin size={48} stroke={1.5} color="#0466C8" />

                      <Text size="xl" fw={500}>
                        Flexible Modes
                      </Text>

                      <Text c="dimmed">Lorem ipsum dolor sit amet consectetur adipisicing elit.</Text>
                    </Stack>
                  </Card>

                  <Card padding="lg">
                    <Stack>
                      <IconMapPin size={48} stroke={1.5} color="#0466C8" />

                      <Text size="xl" fw={500}>
                        Anytime Year-round
                      </Text>

                      <Text c="dimmed">Lorem ipsum dolor sit amet consectetur adipisicing elit.</Text>
                    </Stack>
                  </Card>
                </SimpleGrid>
              </Stack>
            </Stack>
          </div>
        </section>

        <section style={{ backgroundColor: '#242E2A' }}>
          <div className={`container-lg ${styles.featuresContainer}`}>
            <SimpleGrid cols={{ sm: 2 }} className={styles.reverseOnMobile}>
              <img src={change} alt="change" width="100%" />

              <Stack gap="xl">
                <Title className={styles.sectionHeading} c="white">
                  Don't Let the Sun Slow You Down
                </Title>

                <Text c="var(--mantine-color-gray-1)">
                  Too much sunlight should not be a reason to stop your fitness grind. Keep your routine going strong —
                  just tell us how much shade you prefer, and we'll generate a route tailored to your comfort.
                </Text>
              </Stack>
            </SimpleGrid>
          </div>
        </section>
      </main>

      {/* <section>
        <div className={`container-lg ${styles.featuresContainer}`}>
          <SimpleGrid cols={{ sm: 3 }} className={styles.cards}>
            <Card withBorder radius="lg" py="lg" styles={{ root: { borderColor: '#0466C8' } }}>
              <Stack gap="xl" className={styles.cardContent}>
                <img src={sync} alt="sync" width="200px" style={{ alignSelf: 'center' }} />

                <Stack>
                  <Text size="xl" fw={500}>
                    Seamless Planning
                  </Text>
                  <Text>Routes are synced between your devices. Plan routes on the web, access them on the go.</Text>
                </Stack>
              </Stack>
            </Card>

            <Card withBorder radius="lg" py="lg" styles={{ root: { borderColor: '#0466C8' } }}>
              <Stack gap="xl">
                <img src={sync} alt="sync" width="200px" style={{ alignSelf: 'center' }} />

                <Stack>
                  <Text size="xl" fw={500}>
                    Navigate Turn-by-Turn
                  </Text>

                  <Text>Stay on track with real-time, step-by-step directions.</Text>
                </Stack>
              </Stack>
            </Card>

            <Card withBorder radius="lg" py="lg" styles={{ root: { borderColor: '#0466C8' } }}>
              <Stack gap="xl">
                <img src={sync} alt="sync" width="200px" style={{ alignSelf: 'center' }} />

                <Stack>
                  <Text size="xl" fw={500}>
                    Navigate Turn-by-Turn
                  </Text>

                  <Text>Stay on track with real-time, step-by-step directions.</Text>
                </Stack>
              </Stack>
            </Card>
          </SimpleGrid>
        </div>
      </section> */}

      <footer
        style={{
          backgroundColor: '#1C2321',
          height: '350px',
          padding: '2rem 0',
        }}
      >
        <div className="container-lg">
          <Stack justify="space-between" h="100%">
            <SimpleGrid cols={{ sm: 3 }} className={styles.footerContent}>
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
