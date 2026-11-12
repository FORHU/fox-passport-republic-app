import { cn } from "@/shared/lib/utils";

/**
 * Facebook's "f" logo. The same mark as the sign-in button (LoginForm); lucide's
 * brand icons are deprecated. `brand` paints it Facebook blue, otherwise it
 * takes the text colour like the other action-bar icons.
 */
export function FacebookIcon({
  className,
  brand = false,
}: {
  className?: string;
  brand?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-[18px] w-[18px]", className)}
      fill={brand ? "#1877F2" : "currentColor"}
    >
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.563H7.078V12.073H10.125V9.429C10.125 6.423 11.916 4.761 14.656 4.761C15.968 4.761 17.344 4.995 17.344 4.995V7.948H15.83C14.34 7.948 13.875 8.873 13.875 9.822V12.073H17.203L16.671 15.563H13.875V24C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  );
}
