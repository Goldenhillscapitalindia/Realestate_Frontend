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
      <DialogContent className="max-w-[580px] rounded-[26px] border-0 bg-transparent p-0 shadow-none [&>button]:hidden">
        <div className="rounded-[26px] bg-gradient-to-r from-[#101b56] via-[#2f35ac] to-[#2a9bcc] px-8 py-10 text-center text-white shadow-2xl">
          <DialogTitle className="text-4xl font-bold tracking-tight text-white sm:text-[40px]">
            Session Ended
          </DialogTitle>
          <DialogDescription className="mx-auto mt-4 max-w-[440px] text-base leading-relaxed text-white/90 sm:text-[17px]">
            Your session has timed out for security reasons. Please log in again to continue.
          </DialogDescription>
          <Button
            type="button"
            className="mt-7 h-12 rounded-full bg-[#ff7f2a] px-9 text-[15px] font-semibold text-white hover:bg-[#f17422] sm:h-12 sm:text-base"
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
