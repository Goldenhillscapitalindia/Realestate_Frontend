import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

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
      <DialogContent className="w-[min(92vw,760px)] max-w-[760px] rounded-[26px] border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <div className="rounded-[26px] bg-gradient-to-r from-[#101b56] via-[#2f35ac] to-[#2a9bcc] px-8 py-10 text-center text-white shadow-2xl sm:px-12 sm:py-12">
          <DialogTitle className="font-display text-[15px] font-bold tracking-tight text-white sm:text-[25px]">
            Session Ended
          </DialogTitle>
          <DialogDescription className="font-body mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-white/90 sm:text-[20px]">
            Your session has timed out for security reasons. Please log in again to continue.
          </DialogDescription>
          <Button
            type="button"
            className="mt-7 h-12 rounded-full bg-[#ff7f2a] px-10 text-[16px] font-semibold text-white hover:bg-[#f17422] sm:mt-8 sm:h-14 sm:px-12 sm:text-[18px]"
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
