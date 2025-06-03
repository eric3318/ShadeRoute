import { Menu } from '@mantine/core';

type Props = {
  contextMenu: { x: number; y: number; lat: number; lng: number } | null;
  opened: boolean;
  onClose: () => void;
  onAction: (action: 'set-start' | 'set-end', coordinates: { lat: number; lng: number }) => void;
};

export default function ContextMenu({ contextMenu, opened, onClose, onAction }: Props) {
  if (!contextMenu) return null;

  const handleMenuAction = (action: 'set-start' | 'set-end') => {
    const { lat, lng } = contextMenu;
    onAction(action, { lat, lng });
    onClose();
  };

  return (
    <Menu
      opened={opened}
      onClose={onClose}
      styles={{
        dropdown: {
          position: 'fixed',
          left: contextMenu.x,
          top: contextMenu.y,
          zIndex: 1000,
        },
      }}
    >
      <Menu.Dropdown>
        <Menu.Label>Navigation</Menu.Label>

        <Menu.Item onClick={() => handleMenuAction('set-start')}>Set as start point</Menu.Item>

        <Menu.Item onClick={() => handleMenuAction('set-end')}>Set as end point</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
