import { toast } from 'sonner';

interface ToastProps {
  message: string;
}

// One id per message so a failing refetch loop shows one toast, not a stack.
export const errorToast = ({ message }: ToastProps) =>
  toast.error(message, { id: message });
