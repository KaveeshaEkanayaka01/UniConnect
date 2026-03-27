import React, { useEffect, useMemo, useState } from "react";
import API from "./Auth/axios";
import { Award, BadgeCheck, Calendar, ExternalLink, FileBadge2, Trash2, X } from "lucide-react";

const BadgeCertificationPage = () => {
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [deletingCertificateId, setDeletingCertificateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const loadShowcase = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await API.get("/student/dashboard");
        const profile = data?.profile || {};

        setBadges(Array.isArray(profile.badges) ? profile.badges : []);
        setCertificates(Array.isArray(profile.certificates) ? profile.certificates : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load badges and certificates");
      } finally {
        setLoading(false);
      }
    };

    loadShowcase();
  }, []);

  const totalItems = useMemo(() => badges.length + certificates.length, [badges, certificates]);

  const resolveCertificateUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;

    const apiBase = API?.defaults?.baseURL || "";
    const host = apiBase.replace(/\/api\/?$/, "");
    if (!host) return url;

    return `${host}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (!certificateId) return;

    try {
      setActionError("");
      setDeletingCertificateId(certificateId);
      await API.delete(`/student/certificates/${certificateId}`);

      setCertificates((prev) => prev.filter((certificate) => certificate._id !== certificateId));
      setSelectedCertificate((prev) => (prev?._id === certificateId ? null : prev));
    } catch (err) {
      setActionError(err?.response?.data?.message || "Failed to delete certificate");
    } finally {
      setDeletingCertificateId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-7 shadow-sm">
         
        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Showcase</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">My Badges & Certificates</h1>
        <p className="mt-2 text-sm text-slate-500 max-w-2xl">
          View your achievements, recognitions, and credentials earned through UniConnect.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Total Showcase Items</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalItems}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Badges</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{badges.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
            <p className="text-xs text-slate-500">Certificates</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{certificates.length}</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-slate-500">
          Loading your showcase...
        </div>
      )}

      {!loading && error && (
        <div className="bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 p-6 text-sm font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck size={18} className="text-indigo-600" />
              <h2 className="text-xl font-black text-slate-900">Badges</h2>
            </div>

            {badges.length === 0 ? (
              <p className="text-sm text-slate-500">No badges assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge._id}
                    className="rounded-2xl border border-indigo-100 p-4 bg-gradient-to-br from-indigo-50 via-white to-amber-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
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

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileBadge2 size={18} className="text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900">Certificates</h2>
            </div>

            {actionError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {actionError}
              </div>
            )}

            {certificates.length === 0 ? (
              <p className="text-sm text-slate-500">No certificates assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {certificates.map((certificate) => (
                  <div
                    key={certificate._id}
                    className="rounded-2xl border border-emerald-100 p-4 bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/50 cursor-pointer hover:shadow-md transition"
                    onClick={() => setSelectedCertificate(certificate)}
                  >
                    <div className="flex items-start gap-4 justify-between">
                      <div className="flex items-start gap-4 min-w-0">
                      <div className="w-20 shrink-0 rounded-lg border-2 border-emerald-200 bg-white p-2 shadow-sm">
                        <div className="h-11 rounded border border-dashed border-emerald-300 flex items-center justify-center text-emerald-600">
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
                        <div className="mt-1.5 h-1 rounded bg-emerald-100" />
                        <div className="mt-1 h-1 rounded bg-emerald-100 w-4/5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 truncate">{certificate.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">Issued by: {certificate.issuer || "UniConnect"}</p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Calendar size={12} />
                          Issued: {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteCertificate(certificate._id);
                        }}
                        disabled={deletingCertificateId === certificate._id}
                        className="h-7 w-7 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        title="Delete certificate"
                        aria-label="Delete certificate"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
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
            className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
              <div>
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

                {selectedCertificate.verificationUrl && (
                  <a
                    href={selectedCertificate.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Verify Certificate <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                {resolveCertificateUrl(selectedCertificate.certificateUrl) ? (
                  <img
                    src={resolveCertificateUrl(selectedCertificate.certificateUrl)}
                    alt={selectedCertificate.title || "Certificate"}
                    className="w-full h-64 object-contain rounded-lg bg-white"
                  />
                ) : (
                  <div className="h-64 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-500 text-sm font-semibold">
                    Certificate image not available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCertificationPage;
