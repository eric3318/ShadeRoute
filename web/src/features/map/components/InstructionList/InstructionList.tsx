import { Group, ScrollArea, Stack, Text, UnstyledButton } from '@mantine/core';
import type { Instruction } from '../../types';
import { IconArrowRight, IconX } from '@tabler/icons-react';

type Props = {
  opened: boolean;
  onClose: () => void;
  instructions: Instruction[];
};

export default function InstructionList({ opened, onClose, instructions }: Props) {
  if (!opened) return null;

  return (
    <Stack gap="xs" p="xs">
      <UnstyledButton style={{ alignSelf: 'flex-end' }} onClick={onClose}>
        <IconX size={24} color="var(--mantine-color-gray-6)" />
      </UnstyledButton>

      <ScrollArea h={400}>
        <Stack>
          {instructions.map((instruction, index) => (
            <Group key={index}>
              <IconArrowRight size={48} />

              <Stack gap={0}>
                <Text fw={500}>{instruction.turnDescription}</Text>

                <Text fw={500} c="var(--mantine-color-gray-6)" size="sm">
                  {instruction.distance.toFixed(0)} m
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
