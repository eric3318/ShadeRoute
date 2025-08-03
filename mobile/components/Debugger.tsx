import { ScrollView } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';

type Props = {
  log: string[];
  visible: boolean;
  onClose: () => void;
};

export default function Debugger({ log, visible, onClose }: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={{ borderRadius: 6 }}>
        <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
            {log.map((text) => (
              <Text>{text}</Text>
            ))}
          </ScrollView>
        </Dialog.ScrollArea>
      </Dialog>
    </Portal>
  );
}
