import { Dialog, TextInput, Button, Text } from 'react-native-paper';
import { useState } from 'react';
import { View, TouchableWithoutFeedback, Keyboard } from 'react-native';
type InputDialogProps = {
  title?: string;
  description: string;
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
};

export default function InputDialog({
  title,
  description,
  visible,
  onClose,
  onSave,
}: InputDialogProps) {
  const [text, setText] = useState('');

  const onSaveButtonClick = () => {
    onSave(text);
  };

  return (
    <Dialog visible={visible} onDismiss={onClose}>
      {title && (
        <Dialog.Title style={{ fontSize: 18, fontWeight: 'bold' }}>
          {title}
        </Dialog.Title>
      )}
      <Dialog.Content>
        <View style={{ gap: 12 }}>
          <Text>{description}</Text>
          <TextInput value={text} onChangeText={setText} />
        </View>
      </Dialog.Content>

      <Dialog.Actions>
        <Button onPress={onClose}>Cancel</Button>
        <Button onPress={onSaveButtonClick}>Save</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
