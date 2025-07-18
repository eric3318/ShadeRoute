import { Image, StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { differenceInDays, differenceInMonths } from 'date-fns';

export default function Profile() {
  const { user, logout } = useAuth();
  const userCreationTime = user?.metadata.creationTime;
  const today = new Date();

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={{ rowGap: 12, alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          {user.displayName || 'Anonymous'}
        </Text>

        {userCreationTime && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '',
            }}
          >
            Joined{' '}
            {differenceInMonths(today, new Date(userCreationTime)) > 0
              ? `${differenceInMonths(today, new Date(userCreationTime))} month`
              : `${differenceInDays(today, new Date(userCreationTime))} day`}{' '}
            ago
          </Text>
        )}
      </View>

      <Button
        mode="contained"
        onPress={logout}
        style={{ borderRadius: 6 }}
        labelStyle={{ fontSize: 18 }}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    rowGap: 12,
    padding: 12,
    justifyContent: 'center',
  },
});
