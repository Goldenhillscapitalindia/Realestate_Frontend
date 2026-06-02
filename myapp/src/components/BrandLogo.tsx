import asset72Logo from "@/assets/asset72-logo.svg";
import asset72FooterLogo from "@/assets/asset72-footer-logo.svg";

type BrandLogoProps = {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  compact?: boolean;
  inverted?: boolean;
};

const BrandLogo = ({
  className = "",
  iconClassName = "",
  compact = false,
  inverted = false,
}: BrandLogoProps) => {
  const sizeClass = compact
    ? "h-14 w-auto max-w-[70vw] sm:h-[8rem] sm:max-w-[45rem]"
    : "h-16 w-auto max-w-[72vw] sm:h-[9.5rem] sm:max-w-[47rem]";
  const logoSrc = inverted ? asset72FooterLogo : asset72Logo;

  return (
    <div className={`flex items-center justify-center self-center leading-none ${className}`.trim()}>
      <img
        src={logoSrc}
        alt="Asset72"
        title="Analyze in Minutes. Act with Conviction"
        className={`${sizeClass} block shrink-0 object-contain align-middle ${iconClassName}`.trim()}
      />
    </div>
  );
};

export default BrandLogo;
