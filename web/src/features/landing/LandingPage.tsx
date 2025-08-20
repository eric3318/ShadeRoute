import { Button, Card, Divider, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

import { IconClock, IconMapPin, IconSettings } from '@tabler/icons-react';
import NavBar from './components/NavBar/NavBar';
import logoText from '../../assets/logo-text.svg';
import styles from './landingPage.module.css';
import change from '../../assets/change.png';
import androidIcon from '../../assets/android-download.png';

const MOBILE_APP_URL =
  'https://firebasestorage.googleapis.com/v0/b/shaderoute-f3c57.firebasestorage.app/o/shaderoute.apk?alt=media&token=c5b90d0a-f545-476e-8084-228fbcec5ef5';

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
              <Stack gap="xl" justify="center">
                <Title order={1} c="white" className={styles.mainHeading}>
                  Go Shade Yourself.
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
                      <IconSettings size={48} stroke={1.5} color="#0466C8" />

                      <Text size="xl" fw={500}>
                        Flexible Modes
                      </Text>
                    </Stack>
                  </Card>

                  <Card padding="lg">
                    <Stack>
                      <IconClock size={48} stroke={1.5} color="#0466C8" />

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

        <section>
          <div className="container-lg">
            <Stack py="xl">
              <Title className={styles.sectionHeading}>Try the app</Title>

              <Text size="lg">
                This website is designed for larger screens. Download the android app for best experience on your phone.
              </Text>

              <Link to={`${MOBILE_APP_URL}`} style={{ display: 'contents' }}>
                <img
                  src={androidIcon}
                  alt="mobile app download"
                  width={150}
                  style={{
                    borderRadius: 12,
                    alignSelf: 'center',
                  }}
                />
              </Link>
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
            </SimpleGrid>

            <Stack c="white">
              <Divider />

              <Text size="sm">
                Demo for <a href="https://sstd2025.github.io/index.html">SSTD 2025</a>
              </Text>
            </Stack>
          </Stack>
        </div>
      </footer>
    </div>
  );
}
