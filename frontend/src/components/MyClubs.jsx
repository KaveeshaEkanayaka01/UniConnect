import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyClubs,
  getActiveClubs,
  getJoinStatus,
  requestJoinClub,
  cancelJoinRequest,
  getClubDashboard,
} from "../services/clubService";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const MyClubs = () => {
  const navigate = useNavigate();

  const [myClubs, setMyClubs] = useState([]);
  const [availableClubs, setAvailableClubs] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [permissionsByClub, setPermissionsByClub] = useState({});
  const [loading, setLoading] = useState(true);

  const loadClubs = async () => {
    try {
      setLoading(true);

      const myRes = await getMyClubs();
      const activeRes = await getActiveClubs();

      const joined = Array.isArray(myRes?.data) ? myRes.data : [];
      const active = Array.isArray(activeRes?.data) ? activeRes.data : [];

      setMyClubs(joined);

      const joinedIds = new Set(joined.map((club) => String(club._id)));
      const available = active.filter((club) => !joinedIds.has(String(club._id)));
      setAvailableClubs(available);

      const statusMap = {};
      for (const club of available) {
        try {
          const statusRes = await getJoinStatus(club._id);
          statusMap[club._id] = statusRes?.data?.status || "none";
        } catch (error) {
          statusMap[club._id] = "none";
        }
      }
      setStatuses(statusMap);

      // Load dashboard permissions for joined clubs
      const permissionsMap = {};
      await Promise.all(
        joined.map(async (club) => {
          try {
            const dashboardRes = await getClubDashboard(club._id);
            const dashboardData = dashboardRes?.data || dashboardRes;

            permissionsMap[club._id] = {
              canManageClub: Boolean(dashboardData?.permissions?.canManageClub),
              membershipRole:
                dashboardData?.membership?.role ||
                club?.membership?.role ||
                "member",
              parentRole:
                dashboardData?.membership?.parentRole ||
                dashboardData?.permissions?.parentRole ||
                "STUDENT",
            };
          } catch (error) {
            permissionsMap[club._id] = {
              canManageClub: false,
              membershipRole: club?.membership?.role || "member",
              parentRole: "STUDENT",
            };
          }
        })
      );

      setPermissionsByClub(permissionsMap);
    } catch (error) {
      console.error("Error loading clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleJoin = async (clubId) => {
    try {
      await requestJoinClub(clubId);
      await loadClubs();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to join club");
    }
  };

  const handleCancelRequest = async (clubId) => {
    try {
      await cancelJoinRequest(clubId);
      await loadClubs();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to cancel request");
    }
  };

  const clubSummary = useMemo(() => {
    const managedCount = myClubs.filter(
      (club) => permissionsByClub[club._id]?.canManageClub
    ).length;

    return {
      joinedCount: myClubs.length,
      availableCount: availableClubs.length,
      managedCount,
    };
  }, [myClubs, availableClubs, permissionsByClub]);

  if (loading) {
    return <div className="text-slate-600">Loading clubs...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-400">
          Workspace
        </p>
        <h1 className="text-3xl font-bold text-slate-900">My Clubs</h1>
        <p className="text-slate-500 mt-2">
          View your joined clubs, manage clubs where your role allows it, and
          discover available clubs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">My Clubs</p>
          <h2 className="text-4xl font-bold text-slate-900 mt-2">
            {clubSummary.joinedCount}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Managed Clubs</p>
          <h2 className="text-4xl font-bold text-indigo-600 mt-2">
            {clubSummary.managedCount}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Available Clubs</p>
          <h2 className="text-4xl font-bold text-slate-900 mt-2">
            {clubSummary.availableCount}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Joined Clubs</h2>

        {myClubs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-lg">
              You haven't joined any clubs yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myClubs.map((club) => {
              const clubPermissions = permissionsByClub[club._id] || {};
              const canManageClub = Boolean(clubPermissions.canManageClub);
              const membershipRole = normalizeText(
                clubPermissions.membershipRole || club?.membership?.role || "member"
              );

              return (
                <div
                  key={club._id}
                  className="rounded-2xl border border-slate-200 p-5 bg-slate-50"
                >
                  <h3 className="text-xl font-semibold text-slate-900">
                    {club.name}
                  </h3>
                  <p className="text-slate-500 mt-2">{club.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-block text-sm font-medium text-indigo-600">
                      {club.category}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                      Role: {membershipRole || "member"}
                    </span>

                    {canManageClub && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        Can Manage
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/clubs/${club._id}`)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                    >
                      View Dashboard
                    </button>

                    {canManageClub && (
                      <button
                        onClick={() => navigate(`/clubs/${club._id}/manage`)}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-100 transition"
                      >
                        Manage Club
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Clubs</h2>

        {availableClubs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-lg">No available clubs right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {availableClubs.map((club) => (
              <div
                key={club._id}
                className="rounded-2xl border border-slate-200 p-5 bg-slate-50"
              >
                <h3 className="text-xl font-semibold text-slate-900">{club.name}</h3>
                <p className="text-slate-500 mt-2">{club.description}</p>
                <p className="text-indigo-600 mt-3 text-sm font-medium">
                  {club.category}
                </p>

                <div className="mt-5">
                  {statuses[club._id] === "pending" ? (
                    <button
                      onClick={() => handleCancelRequest(club._id)}
                      className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                    >
                      Cancel Request
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(club._id)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                    >
                      Join Club
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClubs;