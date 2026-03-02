import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription } from "./ui/dialog";
import { History } from "lucide-react";

type AccessBlockedModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToLogin: () => void;
};

const AccessBlockedModal = ({
  open,
  onOpenChange,
  onGoToLogin,
}: AccessBlockedModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,620px)] max-w-[620px] border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <div className="mx-auto w-full rounded-2xl bg-white px-7 py-8 text-center shadow-[0_16px_40px_rgba(22,35,98,0.28)] sm:px-9 sm:py-9">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-1 ring-slate-100">
            <History className="h-10 w-10 text-slate-700" strokeWidth={1.8} />
          </div>
          <DialogDescription className="font-body mx-auto mt-1 max-w-[460px] text-[15px] leading-snug text-slate-900 sm:text-[18px]">
            Your session has timed out for security reasons. Please log in again to continue.
          </DialogDescription>
          <Button
            type="button"
            className="mt-7 h-10 rounded-md bg-[#1e2f73] px-10 text-[14px] font-semibold text-white hover:bg-[#233889] sm:h-11 sm:text-[16px]"
            onClick={onGoToLogin}
          >
            Go to Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccessBlockedModal;
