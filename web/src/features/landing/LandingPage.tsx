import { Button, Card, Divider, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

import { IconMapPin } from '@tabler/icons-react';
import NavBar from './components/NavBar/NavBar';
import logoText from '../../assets/logo-text.svg';
import styles from './landingPage.module.css';
import change from '../../assets/change.png';

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

              <img src={change} alt="change" width="100%" />
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
                    </Stack>
                  </Card>

                  <Card padding="lg">
                    <Stack>
                      <IconMapPin size={48} stroke={1.5} color="#0466C8" />

                      <Text size="xl" fw={500}>
                        Flexible Modes
                      </Text>
                    </Stack>
                  </Card>

                  <Card padding="lg">
                    <Stack>
                      <IconMapPin size={48} stroke={1.5} color="#0466C8" />

                      <Text size="xl" fw={500}>
                        Anytime Year-round
                      </Text>
                    </Stack>
                  </Card>
                </SimpleGrid>
              </Stack>
            </Stack>
          </div>
        </section>
      </main>

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

              {/* <Stack c="white">
                <Title size="lg">Contact</Title>

                <Text>m.nascimento@northeastern.edu</Text>

                <Text>nie.han@northeastern.edu</Text>
              </Stack> */}
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
