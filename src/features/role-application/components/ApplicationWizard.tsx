"use client";

import React, {
  Children,
  Fragment,
  isValidElement,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import RequireAuth from "@/shared/auth/RequireAuth";
import { toast } from "sonner";
import { ApplicationFlowHeader } from "./ApplicationFlowHeader";

export interface WizardStepProps {
  /** Short name in the stepper. */
  label: string;
  /** Heading above this step's fields. */
  title: string;
  description?: string;
  /** Checks beyond the browser's own `required`/`pattern` rules (an upload, a
   * chosen location…). Return a message to stop the person moving on. */
  validate?: () => string | null;
  children: React.ReactNode;
}

/** One step of an application. Only meaningful inside `ApplicationWizard`. */
export function WizardStep({ children }: WizardStepProps) {
  return <>{children}</>;
}

type StepElement = React.ReactElement<WizardStepProps>;

// A form can switch between whole sets of steps (the Foxer form has one per
// provider type), so steps are collected through fragments rather than only
// read as direct children.
function collectSteps(children: React.ReactNode): StepElement[] {
  const found: StepElement[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === WizardStep) found.push(child as StepElement);
    else if (child.type === Fragment)
      found.push(
        ...collectSteps(
          (child.props as { children?: React.ReactNode }).children,
        ),
      );
  });
  return found;
}

export interface SummaryRow {
  label: string;
  value: string;
}

interface ApplicationWizardProps {
  /** Role colour — the icon, stepper, glow and primary button. */
  accent: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  /** Shown above the stepper: a role switcher, links to the other roles… */
  intro?: React.ReactNode;
  /** Where Back goes from the first step. */
  backHref?: string;
  /** What the final Review step lists back to the applicant. */
  summary: SummaryRow[];
  /** The line the applicant agrees to by submitting. */
  agreement: string;
  isPending: boolean;
  onSubmit: () => void;
  children: React.ReactNode;
}

const FIELD_SELECTOR = "input, textarea, select";

function firstInvalid(container: HTMLElement | null) {
  if (!container) return null;
  const fields = container.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(FIELD_SELECTOR);
  for (const field of fields) if (!field.checkValidity()) return field;
  return null;
}

/**
 * The shell every role application sits in: a header, a stepper, the current
 * step's fields, and a final Review step that reads the answers back before
 * anything is sent. All steps stay mounted (the others are only hidden), so
 * uploads and typed answers survive moving back and forth.
 */
export function ApplicationWizard({
  accent,
  icon,
  title,
  subtitle,
  intro,
  backHref = "/onboarding",
  summary,
  agreement,
  isPending,
  onSubmit,
  children,
}: ApplicationWizardProps) {
  const steps = collectSteps(children);
  const [index, setIndex] = useState(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  // Steps can disappear when the form switches role; never point past the end.
  const lastContent = steps.length - 1;
  const current = Math.min(index, steps.length);
  const onReview = current >= steps.length;
  const labels = [...steps.map((s) => s.props.label), "Review"];

  // Returns whether step `i` is fine to leave, showing what's wrong if not.
  const stepIsValid = (i: number) => {
    const bad = firstInvalid(panels.current[i]);
    if (bad) {
      bad.reportValidity();
      return false;
    }
    const message = steps[i]?.props.validate?.();
    if (message) {
      toast.error(message);
      return false;
    }
    return true;
  };

  const next = () => {
    if (current <= lastContent && !stepIsValid(current)) return;
    setIndex(current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setIndex(Math.max(0, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => {
    // Anything skipped past (the stepper allows going back and editing) is
    // checked again; send the applicant to the first step that needs work.
    for (let i = 0; i <= lastContent; i++) {
      if (firstInvalid(panels.current[i]) || steps[i].props.validate?.()) {
        setIndex(i);
        requestAnimationFrame(() => stepIsValid(i));
        return;
      }
    }
    onSubmit();
  };

  const accentTint = (pct: number) =>
    `color-mix(in srgb, ${accent} ${pct}%, transparent)`;

  return (
    <RequireAuth>
      <ApplicationFlowHeader />
      <div className="min-h-screen bg-background bg-gradient-dark flex flex-col items-center p-4 pt-24 pb-12 font-body">
        <div className="w-full max-w-2xl">
          {/* Stepper */}
          <ol className="mb-6 flex items-center gap-2" aria-label="Progress">
            {labels.map((label, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li key={label} className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    disabled={!done}
                    onClick={() => setIndex(i)}
                    aria-current={active ? "step" : undefined}
                    className="flex items-center gap-2 disabled:cursor-default cursor-pointer"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors"
                      style={
                        done || active
                          ? { backgroundColor: accent, color: "#000" }
                          : {
                              backgroundColor:
                                "color-mix(in srgb, var(--color-white) 8%, transparent)",
                              color:
                                "color-mix(in srgb, var(--color-white) 40%, transparent)",
                            }
                      }
                    >
                      {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={`hidden text-xs font-bold uppercase tracking-wider sm:inline ${
                        active ? "text-white" : "text-white/40"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                  {i < labels.length - 1 && (
                    <span
                      aria-hidden
                      className="h-px flex-1"
                      style={{
                        backgroundColor: done
                          ? accent
                          : "color-mix(in srgb, var(--color-white) 12%, transparent)",
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          <form
            noValidate
            // Only the Continue and Submit buttons move things along: Enter in a
            // field, or a stray button inside an uploader, must never send the
            // application early.
            onSubmit={(e) => e.preventDefault()}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-surface-raised p-6 shadow-2xl sm:p-10 md:p-12"
          >
            <div
              className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full blur-[100px] transition-colors duration-500"
              style={{ backgroundColor: accentTint(15) }}
            />

            <div className="relative mb-8 text-center">
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300"
                style={{ backgroundColor: accentTint(20), color: accent }}
              >
                {icon}
              </div>
              <h1 className="mb-2 font-display text-3xl font-bold text-white md:text-4xl">
                {title}
              </h1>
              <p className="text-white/60">{subtitle}</p>
            </div>

            {intro && <div className="relative mb-8">{intro}</div>}

            <div className="relative">
              {steps.map((step, i) => (
                <div
                  key={step.props.label}
                  ref={(el) => {
                    panels.current[i] = el;
                  }}
                  hidden={current !== i}
                  className="animate-in fade-in space-y-6 duration-300"
                >
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="font-display text-xl font-bold text-white">
                      {step.props.title}
                    </h2>
                    {step.props.description && (
                      <p className="mt-1 text-sm text-white/50">
                        {step.props.description}
                      </p>
                    )}
                  </div>
                  {step.props.children}
                </div>
              ))}

              {onReview && (
                <div className="animate-in fade-in space-y-6 duration-300">
                  <div className="border-b border-white/5 pb-4">
                    <h2 className="font-display text-xl font-bold text-white">
                      Review your application
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                      Check your answers. Use Back to change anything.
                    </p>
                  </div>
                  <dl className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/3">
                    {summary.map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                      >
                        <dt className="text-xs font-bold uppercase tracking-wider text-white/40">
                          {row.label}
                        </dt>
                        <dd className="min-w-0 break-words text-sm text-white sm:text-right">
                          {row.value || (
                            <span className="text-white/30">Not provided</span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div
                    className="flex items-start gap-3 rounded-2xl border p-4"
                    style={{
                      backgroundColor: accentTint(10),
                      borderColor: accentTint(25),
                    }}
                  >
                    <ShieldCheck
                      size={20}
                      className="mt-0.5 shrink-0"
                      style={{ color: accent }}
                    />
                    <p className="text-xs leading-relaxed text-white/70">
                      {agreement}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="relative mt-10 flex flex-col-reverse gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-center">
              {current === 0 ? (
                <Link
                  href={backHref}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-bold text-white/40 transition-colors hover:text-white"
                >
                  <ArrowLeft size={16} /> Back
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 px-4 py-3 text-sm font-bold text-white/40 transition-colors hover:text-white"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              <button
                type="button"
                onClick={onReview ? submit : next}
                disabled={isPending}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: accent }}
              >
                {onReview
                  ? isPending
                    ? "Submitting…"
                    : "Submit application"
                  : "Continue"}
                {!isPending && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}
