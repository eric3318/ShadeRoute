import { Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import AuthForm from '../../../auth/components/AuthForm';
import { useAuth } from '../../../auth/hooks/useAuth/useAuth';
import { useState } from 'react';

type Props = {
  opened: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
};

export default function SaveRouteModal({ opened, onClose, onSave }: Props) {
  const { user } = useAuth();
  const [text, setText] = useState<string>('');

  const onSaveClick = () => {
    if (text.length === 0) {
      return;
    }

    onSave(text);

    setText('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      title={user ? 'Saving route...' : 'Login Required'}
      radius="md"
      zIndex={1000}
    >
      {user ? (
        <Stack>
          <Text>Give your route a name</Text>

          <TextInput placeholder="Route name" value={text} onChange={(event) => setText(event.currentTarget.value)} />

          <Button onClick={onSaveClick} size="md" radius="md" disabled={text.length === 0}>
            Save
          </Button>
        </Stack>
      ) : (
        <Stack>
          <Text>You need to login to save routes.</Text>

          <AuthForm isSignIn={true} onSignInSuccess={() => {}} />
        </Stack>
      )}
    </Modal>
  );
}
