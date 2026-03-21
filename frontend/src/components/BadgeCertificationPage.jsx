import React, { useEffect, useMemo, useState } from "react";
import API from "./Auth/axios";
import { Award, BadgeCheck, Calendar, FileBadge2 } from "lucide-react";

const BadgeCertificationPage = () => {
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

            {certificates.length === 0 ? (
              <p className="text-sm text-slate-500">No certificates assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {certificates.map((certificate) => (
                  <div
                    key={certificate._id}
                    className="rounded-2xl border border-emerald-100 p-4 bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 shrink-0 rounded-lg border-2 border-emerald-200 bg-white p-2 shadow-sm">
                        <div className="h-11 rounded border border-dashed border-emerald-300 flex items-center justify-center text-emerald-600">
                          <FileBadge2 size={16} />
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
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default BadgeCertificationPage;
