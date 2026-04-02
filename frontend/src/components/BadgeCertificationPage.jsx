import React, { useEffect, useMemo, useState } from "react";
import API from "./Auth/axios";
import { Award, BadgeCheck, Calendar, FileBadge2, FileText, Loader2, ShieldCheck, Sparkles, X } from "lucide-react";

const VERIFICATION_CACHE_KEY_PREFIX = "uniconnect-cert-verification:";
const GLOBAL_VERIFICATION_CACHE_KEY = "uniconnect-cert-verification:global";

const buildKnownCredentialSet = (certificates) =>
  new Set(
    (Array.isArray(certificates) ? certificates : [])
      .map((item) => String(item?.credentialId || "").trim())
      .filter(Boolean)
  );

const loadMergedVerificationCache = ({ resolvedUserId, knownIds }) => {
  const rawGlobalCache = localStorage.getItem(GLOBAL_VERIFICATION_CACHE_KEY);
  const globalCache = rawGlobalCache ? JSON.parse(rawGlobalCache) : {};

  let userCache = {};
  if (resolvedUserId) {
    const cacheKey = `${VERIFICATION_CACHE_KEY_PREFIX}${resolvedUserId}`;
    const rawUserCache = localStorage.getItem(cacheKey);
    userCache = rawUserCache ? JSON.parse(rawUserCache) : {};
  }

  const mergedCache = { ...globalCache, ...userCache };
  return Object.entries(mergedCache).reduce((acc, [key, value]) => {
    if (knownIds.has(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const BadgeCertificationPage = () => {
  const [badges, setBadges] = useState([]);
  const [userId, setUserId] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [deletingCertificateId, setDeletingCertificateId] = useState("");
  const [verificationByCredential, setVerificationByCredential] = useState({});
  const [verifyingCredentialId, setVerifyingCredentialId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadShowcase = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await API.get("/student/dashboard");
        const profile = data?.profile || {};
        const resolvedUserId = String(data?.user?._id || "").trim();
        const resolvedCertificates = Array.isArray(profile.certificates)
          ? profile.certificates
          : [];
        const knownIds = buildKnownCredentialSet(resolvedCertificates);

        setUserId(resolvedUserId);

        // Restore global + user-specific verification state and keep only known credential IDs.
        try {
          const sanitized = loadMergedVerificationCache({
            resolvedUserId,
            knownIds,
          });
          setVerificationByCredential(sanitized);
        } catch {
          setVerificationByCredential({});
        }

        setBadges(Array.isArray(profile.badges) ? profile.badges : []);
        setCertificates(resolvedCertificates);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load badges and certificates");
      } finally {
        setLoading(false);
      }
    };

    loadShowcase();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const cacheKey = `${VERIFICATION_CACHE_KEY_PREFIX}${userId}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(verificationByCredential));
    } catch {
      // Ignore storage quota errors; page still functions.
    }
  }, [userId, verificationByCredential]);

  useEffect(() => {
    if (!userId) return;

    const knownIds = buildKnownCredentialSet(certificates);
    if (knownIds.size === 0) return;

    const syncFromStorage = () => {
      try {
        const sanitized = loadMergedVerificationCache({
          resolvedUserId: userId,
          knownIds,
        });
        setVerificationByCredential((prev) => {
          const prevString = JSON.stringify(prev);
          const nextString = JSON.stringify(sanitized);
          return prevString === nextString ? prev : sanitized;
        });
      } catch {
        // Ignore storage parse issues.
      }
    };

    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === GLOBAL_VERIFICATION_CACHE_KEY ||
        event.key === `${VERIFICATION_CACHE_KEY_PREFIX}${userId}`
      ) {
        syncFromStorage();
      }
    };

    const handleFocus = () => syncFromStorage();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [userId, certificates]);

  const totalItems = useMemo(() => badges.length + certificates.length, [badges, certificates]);

  const resolveCertificateUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;

    const apiBase = API?.defaults?.baseURL || "";
    const host = apiBase.replace(/\/api\/?$/, "");
    if (!host) return url;

    return `${host}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getVerificationMeta = (certificate) => {
    const credentialId = certificate?.credentialId;
    const result = credentialId ? verificationByCredential[credentialId] : null;
    const isVerifiedInDb = Boolean(certificate?.verifiedAt);

    if (result?.verified === true || isVerifiedInDb) {
      return {
        label: "Verified",
        className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      };
    }

    if (result?.verified === false) {
      return {
        label: "Not Verified",
        className: "bg-rose-100 text-rose-700 border border-rose-200",
      };
    }

    return {
      label: "Unverified",
      className: "bg-slate-100 text-slate-600 border border-slate-200",
    };
  };

  const certificateStatusSummary = useMemo(() => {
    return certificates.reduce(
      (acc, certificate) => {
        const credentialId = certificate?.credentialId;
        const result = credentialId ? verificationByCredential[credentialId] : null;

        if (result?.verified === true || certificate?.verifiedAt) {
          acc.verified += 1;
        } else if (result?.verified === false) {
          acc.notVerified += 1;
        } else {
          acc.unverified += 1;
        }

        return acc;
      },
      { verified: 0, notVerified: 0, unverified: 0 }
    );
  }, [certificates, verificationByCredential]);

  const handleVerifyCertificate = async (certificate) => {
    const credentialId = String(certificate?.credentialId || "").trim();
    if (!credentialId) {
      return;
    }

    try {
      setVerifyingCredentialId(credentialId);
      const { data } = await API.get(`/credentials/verify/${encodeURIComponent(credentialId)}`);
      const verified = Boolean(data?.valid) && data?.status === "VALID";
      const verificationResult = {
        verified,
        status: data?.status || "UNKNOWN",
        checkedAt: new Date().toISOString(),
        message: verified
          ? "Certificate is valid and active"
          : "Certificate verification failed",
      };

      setVerificationByCredential((prev) => ({
        ...prev,
        [credentialId]: verificationResult,
      }));

      try {
        const rawGlobalCache = localStorage.getItem(GLOBAL_VERIFICATION_CACHE_KEY);
        const globalCache = rawGlobalCache ? JSON.parse(rawGlobalCache) : {};
        globalCache[credentialId] = verificationResult;
        localStorage.setItem(GLOBAL_VERIFICATION_CACHE_KEY, JSON.stringify(globalCache));
      } catch {
        // Ignore storage errors.
      }
    } catch (verifyError) {
      const verificationResult = {
        verified: false,
        status: "ERROR",
        checkedAt: new Date().toISOString(),
        message: verifyError?.response?.data?.message || "Unable to verify certificate",
      };

      setVerificationByCredential((prev) => ({
        ...prev,
        [credentialId]: verificationResult,
      }));

      try {
        const rawGlobalCache = localStorage.getItem(GLOBAL_VERIFICATION_CACHE_KEY);
        const globalCache = rawGlobalCache ? JSON.parse(rawGlobalCache) : {};
        globalCache[credentialId] = verificationResult;
        localStorage.setItem(GLOBAL_VERIFICATION_CACHE_KEY, JSON.stringify(globalCache));
      } catch {
        // Ignore storage errors.
      }
    } finally {
      setVerifyingCredentialId("");
    }
  };

  const handleDeleteCertificate = async (certificate) => {
    const certificateDocId = String(certificate?._id || "").trim();
    if (!certificateDocId) {
      return;
    }

    const ok = window.confirm("Delete this certificate from your profile?");
    if (!ok) return;

    try {
      setDeletingCertificateId(certificateDocId);
      await API.delete(`/student/certificates/${encodeURIComponent(certificateDocId)}`);

      setCertificates((prev) =>
        prev.filter((item) => String(item?._id) !== certificateDocId)
      );

      const credentialId = String(certificate?.credentialId || "").trim();
      if (credentialId) {
        setVerificationByCredential((prev) => {
          const updated = { ...prev };
          delete updated[credentialId];
          return updated;
        });

        try {
          const rawGlobalCache = localStorage.getItem(GLOBAL_VERIFICATION_CACHE_KEY);
          const globalCache = rawGlobalCache ? JSON.parse(rawGlobalCache) : {};
          delete globalCache[credentialId];
          localStorage.setItem(GLOBAL_VERIFICATION_CACHE_KEY, JSON.stringify(globalCache));
        } catch {
          // Ignore storage errors.
        }
      }

      setSelectedCertificate(null);
    } catch (deleteError) {
      window.alert(
        deleteError?.response?.data?.message || "Failed to delete certificate"
      );
    } finally {
      setDeletingCertificateId("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-200/40 to-cyan-100/20 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-200/30 to-amber-100/20 blur-2xl" />

        <div className="relative p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1">
            <Sparkles size={13} className="text-indigo-600" />
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600">Showcase</p>
          </div>

          <h1 className="mt-3 text-3xl font-black text-slate-900">My Badges & Certificates</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Certificates are presented like traditionally framed wall diplomas to keep a clean, professional showcase.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 p-4 bg-gradient-to-br from-white to-slate-50">
              <p className="text-xs text-slate-500">Total Items</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalItems}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-gradient-to-br from-white to-indigo-50/40">
              <p className="text-xs text-slate-500">Badges</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{badges.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 p-4 bg-gradient-to-br from-white to-emerald-50/60">
              <p className="text-xs text-emerald-700">Verified Certificates</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">{certificateStatusSummary.verified}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-gradient-to-br from-white to-slate-50">
              <p className="text-xs text-slate-500">Need Verification</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{certificateStatusSummary.unverified}</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-28 rounded-2xl bg-slate-100" />
              <div className="h-28 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 p-6 text-sm font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck size={18} className="text-indigo-600" />
              <h2 className="text-xl font-black text-slate-900">Badges</h2>
            </div>

            {badges.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm font-semibold text-slate-500">No badges assigned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge._id}
                    className="group rounded-2xl border border-indigo-100 p-4 bg-gradient-to-br from-indigo-50 via-white to-amber-50 transition hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner transition group-hover:scale-105">
                        <Award size={18} />
                        <span className="absolute inset-0 rounded-full border-2 border-amber-200" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 truncate">{badge.title}</h3>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{badge.description || "No description"}</p>
                        {badge.criteria && (
                          <p className="text-xs text-slate-500 mt-2">Criteria: {badge.criteria}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileBadge2 size={18} className="text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900">Certificates</h2>
            </div>

            {certificates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm font-semibold text-slate-500">No certificates assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.map((certificate) => {
                  const verificationMeta = getVerificationMeta(certificate);

                  return (
                  <div
                    key={certificate._id}
                    className="rounded-2xl border border-emerald-100 p-4 bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/50 cursor-pointer hover:shadow-md transition"
                    onClick={() => setSelectedCertificate(certificate)}
                  >
                    <div className="flex items-start gap-4 justify-between">
                      <div className="flex items-start gap-4 min-w-0">
                      <div className="w-20 shrink-0 rounded-md border border-amber-700/70 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-600 p-1.5 shadow-[0_8px_18px_rgba(71,48,17,0.28)]">
                        <div className="rounded-sm bg-[#f4efe4] p-1.5 border border-amber-100/70">
                          <div className="h-9 rounded-[2px] border border-emerald-200 bg-white flex items-center justify-center text-emerald-600 overflow-hidden">
                          {resolveCertificateUrl(certificate.certificateUrl) ? (
                            <img
                              src={resolveCertificateUrl(certificate.certificateUrl)}
                              alt={certificate.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText size={24} />
                          )}
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 truncate">{certificate.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">Issued by: {certificate.issuer || "UniConnect"}</p>
                        <p className="text-xs text-slate-500 mt-1">Credential ID: {certificate.credentialId || "-"}</p>
                        <p className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-bold ${verificationMeta.className}`}>
                          {verificationMeta.label}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Calendar size={12} />
                          Issued: {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      </div>

                      <div className="hidden sm:flex shrink-0 items-center text-slate-400">
                        <ShieldCheck size={16} />
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {selectedCertificate && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCertificate(null)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-black text-slate-900">Certificate Details</h3>
              <button
                type="button"
                className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                onClick={() => setSelectedCertificate(null)}
                aria-label="Close certificate details"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">
              <div>
                {(() => {
                  const verificationMeta = getVerificationMeta(selectedCertificate);
                  const credentialId = selectedCertificate.credentialId;
                  const verifyState = credentialId ? verificationByCredential[credentialId] : null;
                  const isVerifying = verifyingCredentialId === credentialId;
                  const isDeleting = deletingCertificateId === String(selectedCertificate?._id || "");

                  return (
                    <>
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-wide font-bold text-slate-500">Verification</p>
                        <div className="mt-2 flex items-center gap-2">
                          <p className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${verificationMeta.className}`}>
                            {verificationMeta.label}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleVerifyCertificate(selectedCertificate)}
                            disabled={isVerifying || isDeleting || !credentialId}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isVerifying ? (
                              <>
                                <Loader2 size={12} className="animate-spin" /> Verifying...
                              </>
                            ) : (
                              "Verify Now"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCertificate(selectedCertificate)}
                            disabled={isDeleting || isVerifying}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 size={12} className="animate-spin" /> Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </div>
                        {verifyState?.message && (
                          <p className={`text-xs mt-2 ${verifyState.verified ? "text-emerald-700" : "text-rose-700"}`}>
                            {verifyState.message}
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}

                <p className="text-xs uppercase tracking-wide font-bold text-slate-500">Title</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{selectedCertificate.title || "-"}</p>

                <p className="text-xs uppercase tracking-wide font-bold text-slate-500 mt-4">Issuer</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{selectedCertificate.issuer || "UniConnect"}</p>

                <p className="text-xs uppercase tracking-wide font-bold text-slate-500 mt-4">Issued Date</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {selectedCertificate.issuedAt
                    ? new Date(selectedCertificate.issuedAt).toLocaleDateString()
                    : "-"}
                </p>

                <p className="text-xs uppercase tracking-wide font-bold text-slate-500 mt-4">Credential ID</p>
                <p className="text-sm font-semibold text-slate-900 mt-1 break-all">
                  {selectedCertificate.credentialId || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-stone-100 to-stone-200 p-6">
                <div className="mx-auto w-full max-w-sm">
                  <div className="mx-auto h-2 w-2 rounded-full bg-slate-500 shadow" />
                  <div className="mx-auto h-5 w-0.5 bg-slate-400" />
                  <div className="rounded-md border border-amber-700/80 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-700 p-3 shadow-[0_12px_24px_rgba(71,48,17,0.35)]">
                    <div className="rounded-sm border border-amber-100/70 bg-[#f4efe4] p-3">
                      {resolveCertificateUrl(selectedCertificate.certificateUrl) ? (
                        <img
                          src={resolveCertificateUrl(selectedCertificate.certificateUrl)}
                          alt={selectedCertificate.title || "Certificate"}
                          className="w-full h-64 object-contain rounded-sm bg-white border border-emerald-100"
                        />
                      ) : (
                        <div className="h-64 flex items-center justify-center bg-white rounded-sm border border-emerald-100 text-slate-400">
                          <FileText size={48} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCertificationPage;
