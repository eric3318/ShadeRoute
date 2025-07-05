import { Dialog, TextInput, Button, Text, Portal } from 'react-native-paper';
import { useState } from 'react';
import { View } from 'react-native';

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
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onClose}
        style={{ backgroundColor: '#f5f5f5', borderRadius: 6 }}
      >
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
          <Button
            onPress={onClose}
            textColor="#FF0000"
            mode="outlined"
            style={{ borderRadius: 6, borderColor: '#FF0000', width: 80 }}
          >
            Cancel
          </Button>
          <Button
            onPress={onSaveButtonClick}
            textColor="white"
            buttonColor="#ee6352"
            mode="contained"
            style={{ borderRadius: 6, width: 80 }}
          >
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
