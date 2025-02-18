import { Dialog, TextInput, Button, Text } from 'react-native-paper';
import { useState } from 'react';
type InputDialogProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
};

export default function InputDialog({
  visible,
  onClose,
  onSave,
}: InputDialogProps) {
  const [text, setText] = useState('');

  const onSaveButtonClick = () => {
    onSave(text);
  };

  return (
    <Dialog
      visible={visible}
      onDismiss={onClose}
      style={{ backgroundColor: 'white' }}
    >
      <Dialog.Title>Save route</Dialog.Title>
      <Dialog.Content>
        <Text>Please name your route</Text>
        <TextInput label="Route name" value={text} onChangeText={setText} />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onClose}>Cancel</Button>
        <Button onPress={onSaveButtonClick}>Save</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
