// import TimePicker from './TimePicker';
// import { useState } from 'react';
// import { format } from 'date-fns';
// import { useOptions } from '@/hooks/useOptions/useOptions';

// interface TimeDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// function TimeDialog({ open, onOpenChange }: TimeDialogProps) {
//   const { date, setDate } = useOptions();
//   const [dateValue, setDateValue] = useState<Date | null>(date);
//   const [mode, setMode] = useState<'date' | 'time'>('date');

//   const onDateConfirm = (date: Date | null) => {
//     setDate(date);
//   };

//   const onLastButtonClick = () => {
//     toggleMode();
//   };

//   const onNextButtonClick = () => {
//     if (mode === 'date') {
//       toggleMode();
//       return;
//     }
//     onDateConfirm(dateValue);
//     setMode('date');
//     onOpenChange(false);
//   };

//   const toggleMode = () => {
//     setMode((prev) => (prev === 'date' ? 'time' : 'date'));
//   };

//   const onOpenChangeHandler = (open: boolean) => {
//     setMode('date');
//     onOpenChange(open);
//   };

//   return (
//     <Dialog modal open={open} onOpenChange={onOpenChangeHandler}>
//       <Dialog.Trigger asChild>
//         <Button theme="black" fontWeight="bold">
//           {date ? format(date, 'MMM d, hh:mm aaa') : 'Now'}
//         </Button>
//       </Dialog.Trigger>

//       <Dialog.Portal>
//         <Dialog.Overlay
//           key="overlay"
//           animation="slow"
//           opacity={0.5}
//           enterStyle={{ opacity: 0 }}
//           exitStyle={{ opacity: 0 }}
//         />

//         <Dialog.Content
//           bordered
//           elevate
//           key="content"
//           animateOnly={['transform', 'opacity']}
//           animation={[
//             'quicker',
//             {
//               opacity: {
//                 overshootClamping: true,
//               },
//             },
//           ]}
//           enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
//           exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
//           position="absolute"
//           bottom="50%"
//         >
//           <Dialog.Title size="$3" fontWeight="bold">
//             Trip begins
//           </Dialog.Title>

//           <TimePicker
//             mode={mode}
//             date={dateValue}
//             onTimeChange={setDateValue}
//           />

//           <YStack gap="$3">
//             {mode === 'time' && (
//               <Button
//                 onPress={onLastButtonClick}
//                 theme="red"
//                 color="red"
//                 fontWeight="bold"
//               >
//                 Choose a different day
//               </Button>
//             )}

//             <Button onPress={onNextButtonClick} theme="black" fontWeight="bold">
//               Next
//             </Button>
//           </YStack>

//           <Dialog.Close asChild>
//             <Button
//               position="absolute"
//               top="$3"
//               right="$3"
//               size="$2"
//               circular
//             />
//           </Dialog.Close>
//         </Dialog.Content>
//       </Dialog.Portal>
//     </Dialog>
//   );
// }

// export default TimeDialog;
