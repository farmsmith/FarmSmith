"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Phone, Mail, Edit3, Save, X } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface CustomerProfile {
  email: string;
  fullName: string;
  phone: string;
}

export default function AccountClient() {
  const [profile, setProfile] = useState<CustomerProfile>({ email: "", fullName: "", phone: "" });
  const [editForm, setEditForm] = useState<CustomerProfile>({ email: "", fullName: "", phone: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile update state
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Validation
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; phone?: string }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const supabase = createBrowserSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const userMetaName = user.user_metadata?.full_name || user.user_metadata?.name || "";
          const userMetaPhone = user.user_metadata?.phone || (user as any).phone || "";
          const userEmail = user.email || "";

          // Also check localStorage fallback if empty
          let localName = "";
          let localPhone = "";
          try {
            const storedCust = localStorage.getItem("farmsmith_customer_info_v1");
            if (storedCust) {
              const parsed = JSON.parse(storedCust);
              localName = parsed.name || "";
              localPhone = parsed.phone || "";
            }
          } catch {}

          const initialName = userMetaName || localName;
          const initialPhone = userMetaPhone || localPhone;

          const initialProfile = {
            email: userEmail,
            fullName: initialName,
            phone: initialPhone,
          };
          setProfile(initialProfile);
          setEditForm(initialProfile);

          // Fetch profile from API
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const res = await fetch("/api/account/profile", {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.ok) {
              const data = await res.json();
              const fetchedProfile = {
                email: data.email || userEmail,
                fullName: data.fullName || initialName,
                phone: data.phone || initialPhone,
              };
              setProfile(fetchedProfile);
              setEditForm(fetchedProfile);
            }
          }
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchProfile();
  }, []);

  const validateProfile = () => {
    const e: typeof fieldErrors = {};
    if (!editForm.fullName.trim()) {
      e.fullName = "Name cannot be empty";
    }
    const cleanPhone = editForm.phone.trim().replace(/\D/g, "");
    if (!editForm.phone.trim()) {
      e.phone = "Mobile number cannot be empty";
    } else if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      e.phone = "Enter a valid 10-digit mobile number";
    }
    return e;
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProfile();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setProfileSubmitting(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setProfileError("Session expired. Please log in again.");
        return;
      }

      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          fullName: editForm.fullName.trim(),
          phone: editForm.phone.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update profile");
      }

      const updated = await res.json();
      const updatedProfile = {
        email: updated.email || profile.email,
        fullName: updated.fullName,
        phone: updated.phone,
      };
      setProfile(updatedProfile);
      setEditForm(updatedProfile);
      setIsEditing(false);
      setProfileSuccess("Profile details updated successfully.");
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm(profile);
    setFieldErrors({});
    setIsEditing(false);
    setProfileError(null);
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingBlock: "2rem 3rem" }}>
        <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-xl)", maxWidth: "640px", margin: "0 auto" }} />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-background)", minHeight: "80vh", width: "100%", overflowX: "hidden" }}>
      <div className="container" style={{ paddingBlock: "2rem 3.5rem", paddingInline: "1rem" }}>
        <div
          style={{
            maxWidth: "640px",
            width: "100%",
            margin: "0 auto",
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "clamp(1.25rem, 4vw, 2.25rem)",
            boxShadow: "var(--shadow-card)",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.875rem",
              marginBottom: "1.75rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div style={{ minWidth: 0, flex: "1 1 200px" }}>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.375rem, 4vw, 1.75rem)",
                  color: "var(--color-primary)",
                  margin: "0 0 0.25rem",
                  lineHeight: 1.2,
                }}
              >
                My Account
              </h1>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-muted)" }}>
                Personal details and account preferences
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={() => {
                  setProfileSuccess(null);
                  setProfileError(null);
                  setIsEditing(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  background: "rgba(196,136,62,0.12)",
                  color: "var(--color-accent)",
                  border: "1px solid rgba(196,136,62,0.3)",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>

          {/* Feedback messages */}
          {profileSuccess && (
            <div
              style={{
                background: "rgba(42, 72, 50, 0.1)",
                border: "1px solid var(--color-primary)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                color: "var(--color-primary)",
                marginBottom: "1.5rem",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div
              style={{
                background: "var(--color-error-bg)",
                border: "1px solid var(--color-error)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                color: "var(--color-error)",
                marginBottom: "1.5rem",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {profileError}
            </div>
          )}

          {/* View Mode */}
          {!isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Full Name Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.875rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  width: "100%",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    background: "rgba(31,58,46,0.1)",
                    color: "var(--color-primary)",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <User size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-muted)",
                      fontWeight: 600,
                      marginBottom: "0.125rem",
                    }}
                  >
                    Full Name
                  </span>
                  <span
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--color-primary)",
                      display: "block",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      lineHeight: 1.4,
                    }}
                  >
                    {profile.fullName || "Not provided"}
                  </span>
                </div>
              </div>

              {/* Mobile Number Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.875rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  width: "100%",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    background: "rgba(31,58,46,0.1)",
                    color: "var(--color-primary)",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <Phone size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-muted)",
                      fontWeight: 600,
                      marginBottom: "0.125rem",
                    }}
                  >
                    Mobile Number
                  </span>
                  <span
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--color-primary)",
                      display: "block",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      lineHeight: 1.4,
                    }}
                  >
                    {profile.phone || "Not provided"}
                  </span>
                </div>
              </div>

              {/* Email Address Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.875rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  width: "100%",
                  boxSizing: "border-box",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    background: "rgba(31,58,46,0.1)",
                    color: "var(--color-primary)",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <Mail size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-muted)",
                      fontWeight: 600,
                      marginBottom: "0.125rem",
                    }}
                  >
                    Email Address
                  </span>
                  <span
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--color-primary)",
                      display: "block",
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                      lineHeight: 1.4,
                    }}
                  >
                    {profile.email}
                  </span>
                </div>
              </div>

              {/* View Orders Action Bar */}
              <div
                style={{
                  marginTop: "0.75rem",
                  paddingTop: "1.25rem",
                  borderTop: "1px solid var(--color-border)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <Link
                  href="/account/orders"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    background: "var(--color-primary)",
                    color: "#FBFAF6",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    boxSizing: "border-box",
                    maxWidth: "100%",
                  }}
                >
                  View Orders →
                </Link>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleProfileSave} style={{ display: "flex", flexDirection: "column", gap: "1.125rem", width: "100%", minWidth: 0 }}>
              <Input
                id="edit-fullName"
                label="Full Name"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                error={fieldErrors.fullName}
                placeholder="Enter your full name"
                required
              />

              <Input
                id="edit-phone"
                label="Mobile Number"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                error={fieldErrors.phone}
                placeholder="10-digit mobile number"
                required
              />

              <div style={{ width: "100%", minWidth: 0 }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.375rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "rgba(0,0,0,0.03)",
                    color: "var(--color-muted)",
                    cursor: "not-allowed",
                    fontSize: "0.9375rem",
                    boxSizing: "border-box",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "0.25rem", display: "block" }}>
                  Email cannot be changed directly.
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "0.75rem" }}>
                <Button type="submit" variant="primary" loading={profileSubmitting} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem" }}>
                  <Save size={16} /> Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={profileSubmitting} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem" }}>
                  <X size={16} /> Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
