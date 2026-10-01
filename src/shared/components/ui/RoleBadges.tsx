import {
  ROLE_BADGE,
  ROLE_TYPES,
  type RoleType,
} from "@/shared/constants/roles";

interface RoleBadgesProps {
  /** Straight from an API payload, so untyped — unknown names are skipped. */
  roleType?: readonly string[] | null;
  /** How many pills to show before collapsing the rest into "+N". */
  max?: number;
  className?: string;
}

/**
 * Small role pills (Venue Foxer, Organizer…) in the same colors as the
 * profile card, for tight spots like chat headers and conversation rows —
 * so you can tell who you're talking to. Renders nothing for someone who
 * holds no role, i.e. a plain Citizen.
 */
export function RoleBadges({
  roleType,
  max = 2,
  className = "",
}: RoleBadgesProps) {
  const roles = (roleType ?? []).filter((r): r is RoleType =>
    (ROLE_TYPES as readonly string[]).includes(r),
  );
  if (roles.length === 0) return null;

  const shown = roles.slice(0, max);
  const hidden = roles.slice(max);

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {shown.map((role) => {
        const { label, color } = ROLE_BADGE[role];
        return (
          <span
            key={role}
            className="px-1.5 py-px rounded-full text-[9px] font-bold uppercase tracking-wide border leading-tight whitespace-nowrap"
            style={{
              color,
              borderColor: `${color}40`,
              background: `${color}1a`,
            }}
          >
            {label}
          </span>
        );
      })}
      {hidden.length > 0 && (
        <span
          className="text-[9px] font-bold text-white/40"
          title={hidden.map((r) => ROLE_BADGE[r].label).join(", ")}
        >
          +{hidden.length}
        </span>
      )}
    </span>
  );
}
