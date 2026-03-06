
interface DeleteModalProps {
  isOpen: null | boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}
export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[320px] rounded-lg border border-[#F5EFE7] bg-white p-6 text-[#2D2318] shadow-2xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-[#5B3E2E]">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#D4A574] bg-white px-4 text-sm font-medium text-[#2D2318] transition-colors hover:bg-[#FAF4EC]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#d11a2a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#b31623]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}