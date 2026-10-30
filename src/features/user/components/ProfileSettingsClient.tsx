"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { ZodType } from "zod";
import { useProfile } from "@/features/user/hooks/useProfile";
import { useLogout } from "@/shared/auth/useLogout";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import AvatarUploader from "@/features/user/components/AvatarUploader";
import { FieldControl, FieldError } from "@/shared/components/ui/FieldError";
import { FormErrorSummary } from "@/shared/components/ui/FormErrorSummary";
import { InlineAlert } from "@/shared/components/ui/InlineAlert";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import SearchableDropdown from "@/shared/components/ui/SearchableDropdown";
import { cn } from "@/shared/lib/utils";
import { usernameSchema } from "@/shared/lib/schema";
import { countryOfPhone, phoneSchema, splitPhone } from "@/shared/lib/phone";
import { fetchCountries, type GeoCountry } from "@/shared/api/geo";
import { BackButton } from "@/shared/components/ui/BackButton";

export type SettingsSection = "profile" | "privacy" | "security" | "danger";

type ValidatedField = "username" | "phone";
// How each field is named in the "things to fix" summary.
const FIELD_FIXES: Record<ValidatedField, string> = {
  username: "Fix your username",
  phone: "Fix your phone number",
};

function schemaError(schema: ZodType, value: string) {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

const phoneCountryLabel = (c: GeoCountry) =>
  `${c.flag} ${c.name} (+${c.phoneCode})`;

function SectionButton({
  active,
  icon,
  label,
  onClick,
  danger,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
        active
          ? danger
            ? "bg-red-500/10 text-red-400 border border-red-500/20"
            : "bg-accent/10 text-accent border border-accent/20"
          : "text-white/40 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      {label}
    </button>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-black transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ProfileSettingsClient({
  blockedUsersSlot,
  initialSection = "profile",
}: {
  blockedUsersSlot?: React.ReactNode;
  initialSection?: SettingsSection;
}) {
  const logout = useLogout();
  const storeUser = useAuthStore((state) => state.user);
  const { profile, isLoading, updateProfile, changePassword, deleteAccount } =
    useProfile();

  const [activeSection, setActiveSection] =
    useState<SettingsSection>(initialSection);
  // A server-side failure about the whole form; field problems go under the
  // field (fieldErrors) and successes are toasts.
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ValidatedField, string>>
  >({});
  // Set by a save that validation blocked; the summary only shows after one.
  const [saveBlocked, setSaveBlocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Profile form
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("PH");
  const [profileImage, setProfileImage] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete form
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // The project's countries that have phone numbering — the same list (and
  // cache) as the location pickers.
  const countries = useQuery({
    queryKey: ["geo", "countries"],
    queryFn: fetchCountries,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const phoneCountries = useMemo(
    () => (countries.data ?? []).filter((c) => c.phoneCode),
    [countries.data],
  );
  const allowedPhoneCountries = useMemo(
    () =>
      countries.data ? new Set(phoneCountries.map((c) => c.code)) : undefined,
    [countries.data, phoneCountries],
  );
  const selectedPhoneCountry = phoneCountries.find(
    (c) => c.code === phoneCountry,
  );

  const fieldError = (
    field: ValidatedField,
    value: string,
    country = phoneCountry,
  ) =>
    schemaError(
      field === "phone"
        ? phoneSchema(country, allowedPhoneCountries)
        : usernameSchema,
      value,
    );

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setUsername(profile.username ?? "");
      const saved = splitPhone(profile.phone ?? "");
      setPhone(saved.number);
      setPhoneCountry(saved.country ?? "PH");
      setProfileImage(profile.imgId ?? "");
      setIsPrivate(profile.isPrivate ?? false);
    }
  }, [profile]);

  const openSection = (section: SettingsSection) => {
    setActiveSection(section);
    setFormError(null);
  };

  // Re-check a field that is already showing an error, so the message goes
  // away as soon as the value is fixed rather than on the next save.
  const recheck = (field: ValidatedField, value: string, country?: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: fieldError(field, value, country),
      }));
    }
  };
  const checkOnBlur = (field: ValidatedField, value: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: fieldError(field, value) }));

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errors = {
      username: fieldError("username", username),
      phone: fieldError("phone", phone),
    };
    setFieldErrors(errors);
    setSaveBlocked(!!(errors.username || errors.phone));
    if (errors.username || errors.phone) return;

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        username: usernameSchema.parse(username),
        // E.164, or "" on purpose: it clears a saved number.
        phone: phoneSchema(phoneCountry, allowedPhoneCountries).parse(phone),
        profileImage: profileImage.trim() || undefined,
        isPrivate,
      });
      toast.success("Profile saved", {
        description: "Your changes are now live.",
      });
    } catch (err: any) {
      const data = err?.response?.data;
      const message = data?.message ?? "Failed to update profile";
      if (data?.field === "username" || data?.field === "phone") {
        setFieldErrors((prev) => ({ ...prev, [data.field]: message }));
      } else {
        setFormError(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (newPassword !== confirmPassword) {
      setFormError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setFormError("New password must be at least 6 characters");
      return;
    }
    setIsSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  // Submitting the form only asks; the dialog's confirm does the deleting.
  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (deleteConfirmation !== "DELETE") {
      setFormError("Type DELETE to confirm");
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const deleteAccountConfirmed = async () => {
    setIsSaving(true);
    try {
      await deleteAccount(deletePassword);
      await logout({ promptLogin: false });
    } catch (err: any) {
      // Close the dialog and show why on the form (e.g. a wrong password).
      setFormError(err?.response?.data?.message ?? "Failed to delete account");
      setIsSaving(false);
    }
  };

  // One error is already obvious from its field; a summary helps from two.
  const blockingFields = (Object.keys(FIELD_FIXES) as ValidatedField[]).filter(
    (field) => fieldErrors[field],
  );
  const showSummary = saveBlocked && blockingFields.length >= 2;

  const displayName = profile?.name || storeUser?.name || "User";
  const initials = displayName.charAt(0).toUpperCase();
  const roleLabel = (profile?.systemRole || storeUser?.systemRole || "user")
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-canvas text-white font-body antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 h-20 flex items-center gap-4">
          {/* On a phone this page is reached from the settings menu, so back
              goes there; on desktop that menu doesn't exist. */}
          <BackButton
            href="/user/settings"
            label="Back to settings"
            className="lg:hidden"
          />
          <BackButton
            href="/user"
            label="Back to profile"
            className="hidden lg:inline-flex"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-display font-bold">Account Settings</h1>
            <p className="text-xs text-white/40 truncate">
              {profile?.email || storeUser?.email}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-24 lg:pt-28 pb-20 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar — a scrolling tab row on phones */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-28 space-y-4 lg:space-y-6">
            {/* Avatar card */}
            <div className="bg-surface border border-white/5 rounded-[2rem] p-6 text-center">
              <div className="flex justify-center mb-4">
                <AvatarUploader
                  currentUrl={profileImage || undefined}
                  initials={initials}
                  onUploaded={(url) => setProfileImage(url)}
                />
              </div>
              <p className="font-display font-bold text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                @{profile?.username || storeUser?.username}
              </p>
              <span className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/40">
                {roleLabel}
              </span>
            </div>

            {/* Nav */}
            <nav className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar">
              <SectionButton
                active={activeSection === "profile"}
                icon="person"
                label="Profile"
                onClick={() => openSection("profile")}
              />
              <SectionButton
                active={activeSection === "privacy"}
                icon="shield"
                label="Privacy"
                onClick={() => openSection("privacy")}
              />
              <SectionButton
                active={activeSection === "security"}
                icon="lock"
                label="Security"
                onClick={() => openSection("security")}
              />
              <SectionButton
                active={activeSection === "danger"}
                icon="delete_forever"
                label="Delete Account"
                onClick={() => openSection("danger")}
                danger
              />
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-4">
          {formError && <InlineAlert tone="error">{formError}</InlineAlert>}

          {isLoading ? (
            <div className="bg-surface border border-white/5 rounded-[2rem] p-12 text-center text-white/30 text-sm">
              Loading profile…
            </div>
          ) : activeSection === "profile" ? (
            <form
              onSubmit={handleUpdateProfile}
              noValidate
              className="bg-surface border border-white/5 rounded-[2rem] p-5 sm:p-8 space-y-6"
            >
              <div>
                <h2 className="text-lg font-display font-bold mb-1">
                  Personal Information
                </h2>
                <p className="text-sm text-white/40">
                  Update your name, username, and contact details.
                </p>
              </div>

              {showSummary && (
                <FormErrorSummary
                  title={`${blockingFields.length} things to fix before you can save`}
                  items={blockingFields.map((field) => ({
                    message: FIELD_FIXES[field],
                    fieldId: field,
                  }))}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" icon="badge">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="input-field"
                  />
                </Field>
                <Field
                  label="Username"
                  icon="alternate_email"
                  htmlFor="username"
                  hint="Letters, numbers, _ and . only"
                  error={fieldErrors.username}
                  errorId="username-error"
                >
                  <FieldControl invalid={!!fieldErrors.username}>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        // Usernames are stored lowercase; show that as they type.
                        const next = e.target.value.toLowerCase();
                        setUsername(next);
                        recheck("username", next);
                      }}
                      onBlur={() => checkOnBlur("username", username)}
                      placeholder="your_username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={30}
                      aria-invalid={!!fieldErrors.username}
                      aria-describedby={
                        fieldErrors.username ? "username-error" : undefined
                      }
                      className={cn(
                        "input-field",
                        fieldErrors.username && "field-invalid",
                      )}
                    />
                  </FieldControl>
                </Field>
                <Field
                  label="Email address"
                  icon="mail"
                  hint="Contact support to change email"
                >
                  <input
                    type="email"
                    value={profile?.email || storeUser?.email || ""}
                    disabled
                    className="input-field opacity-40 cursor-not-allowed"
                  />
                </Field>
                <Field
                  label="Phone number"
                  icon="phone"
                  htmlFor="phone"
                  hint="Optional — leave empty to remove it"
                  error={fieldErrors.phone}
                  errorId="phone-error"
                >
                  <div className="mb-2">
                    <SearchableDropdown
                      value={
                        selectedPhoneCountry
                          ? phoneCountryLabel(selectedPhoneCountry)
                          : ""
                      }
                      options={phoneCountries.map(phoneCountryLabel)}
                      placeholder={
                        countries.isPending ? "Loading…" : "Country code"
                      }
                      searchPlaceholder="Search countries or codes…"
                      onChange={(label) => {
                        const next = phoneCountries.find(
                          (c) => phoneCountryLabel(c) === label,
                        )?.code;
                        if (!next) return;
                        setPhoneCountry(next);
                        recheck("phone", phone, next);
                      }}
                    />
                  </div>
                  <FieldControl invalid={!!fieldErrors.phone}>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => {
                        // Kept as typed — the format is checked on blur and on
                        // save. A full number with its own +code picks its
                        // country.
                        const next = e.target.value;
                        const named = countryOfPhone(next);
                        const country =
                          named && allowedPhoneCountries?.has(named)
                            ? named
                            : phoneCountry;
                        setPhoneCountry(country);
                        setPhone(next);
                        recheck("phone", next, country);
                      }}
                      onBlur={() => checkOnBlur("phone", phone)}
                      placeholder="917 123 4567"
                      maxLength={30}
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={
                        fieldErrors.phone ? "phone-error" : undefined
                      }
                      className={cn(
                        "input-field",
                        fieldErrors.phone && "field-invalid",
                      )}
                    />
                  </FieldControl>
                </Field>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">
                    Private Profile
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    New followers must be approved by you. Your followers and
                    following lists are hidden from everyone else.
                  </p>
                </div>
                <ToggleSwitch checked={isPrivate} onChange={setIsPrivate} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-accent text-black font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">
                      save
                    </span>
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          ) : activeSection === "privacy" ? (
            blockedUsersSlot
          ) : activeSection === "security" ? (
            <form
              onSubmit={handleChangePassword}
              className="bg-surface border border-white/5 rounded-[2rem] p-5 sm:p-8 space-y-6"
            >
              <div>
                <h2 className="text-lg font-display font-bold mb-1">
                  Change Password
                </h2>
                <p className="text-sm text-white/40">
                  Choose a strong password of at least 6 characters.
                </p>
              </div>

              <div className="space-y-4">
                <Field label="Current password" icon="lock">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field"
                  />
                </Field>
                <Field label="New password" icon="lock_open">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="input-field"
                  />
                </Field>
                <Field label="Confirm new password" icon="lock_open">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-accent text-black font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    key
                  </span>
                )}
                Update Password
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleDeleteAccount}
              className="bg-surface border border-red-500/10 rounded-[2rem] p-5 sm:p-8 space-y-6"
            >
              <div>
                <h2 className="text-lg font-display font-bold text-red-400 mb-1">
                  Delete Account
                </h2>
                <p className="text-sm text-white/40">
                  This is permanent. All your data — bookings, badges, stamps,
                  and listings — will be erased.
                </p>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-sm text-red-300 space-y-1">
                <p className="font-bold">Before you delete:</p>
                <ul className="text-white/40 space-y-0.5 list-disc list-inside">
                  <li>Cancel any active bookings first</li>
                  <li>Download any data you want to keep</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>

              <div className="space-y-4">
                <Field label="Confirm your password" icon="lock">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field"
                  />
                </Field>
                <Field label='Type "DELETE" to confirm' icon="warning">
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    required
                    className="input-field placeholder:text-white/20"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSaving || deleteConfirmation !== "DELETE"}
                className="px-6 py-3 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {isSaving ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    delete_forever
                  </span>
                )}
                Delete My Account
              </button>
            </form>
          )}
        </main>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={deleteAccountConfirmed}
        tone="danger"
        title="Delete your account?"
        description="Your bookings, badges, stamps and listings will be erased. This can't be undone."
        confirmLabel="Delete account"
      />

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: rgba(196, 232, 90, 0.4);
        }
        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  icon,
  htmlFor,
  hint,
  error,
  errorId,
  children,
}: {
  label: string;
  icon: string;
  htmlFor?: string;
  hint?: string;
  /** Replaces the hint while set. */
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-xs font-bold text-white/50 uppercase tracking-widest"
      >
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        {label}
      </label>
      {children}
      {error && errorId ? (
        <FieldError id={errorId} message={error} />
      ) : (
        hint && <p className="text-[11px] text-white/25">{hint}</p>
      )}
    </div>
  );
}
