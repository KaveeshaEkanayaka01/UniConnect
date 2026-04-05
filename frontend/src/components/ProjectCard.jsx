import { useState, useEffect } from "react";
import { likeProject, addComment, getComments } from "../api/projectApi";

const statusColors = {
  Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Ongoing:   "bg-amber-50 text-amber-600 border-amber-100",
  Planned:   "bg-sky-50 text-sky-600 border-sky-100",
};

export default function ProjectCard({ project }) {
  const [likes, setLikes]               = useState(Number(project.likes || 0));
  const [comments, setComments]         = useState([]);
  const [newComment, setNewComment]     = useState("");
  const [userName, setUserName]         = useState("");
  const [showComments, setShowComments] = useState(false);
  const [modalImage, setModalImage]     = useState(null);
  const [liked, setLiked]               = useState(false);

  useEffect(() => { loadComments(); }, []);

  const loadComments = async () => {
    try {
      const response = await getComments(project._id);
      setComments(response.data);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await likeProject(project._id);
      if (response.data?.likes !== undefined) setLikes(response.data.likes);
      else setLikes((prev) => prev + 1);
      setLiked(true);
    } catch (error) {
      console.error("Error liking project:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) return;
    try {
      await addComment(project._id, {
        userName: userName.trim(),
        text: newComment.trim(),
      });
      setNewComment("");
      setUserName("");
      loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const statusClass = statusColors[project.status] || "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <>
      <div className="glass-card p-7 bg-white hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-slate-800 font-bold text-xl leading-tight group-hover:text-indigo-600 transition-colors">{project.projectName}</h2>
          {project.status && (
            <span className={`badge flex-shrink-0 border ${statusClass}`}>{project.status}</span>
          )}
        </div>

        {/* Category & Club name (public feed) */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
              <span className="text-sky-500">📎</span>
              <span className="font-medium">{project.category || 'General'}</span>
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
              <span className="text-indigo-600">👤</span>
              <span className="font-medium">{project.clubName || 'ITPM Admin'}</span>
            </span>
          </div>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-4">{project.description}</p>

        {project.projectDate && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
            <span>📅</span>
            <span>{new Date(project.projectDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        )}

        {/* Images: show up to 3 equally-sized side-by-side images */}
        {project.images?.length > 0 && (
          <div className="mb-5">
            <div className="grid grid-cols-3 gap-2">
              {project.images.slice(0, 3).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setModalImage(`http://localhost:5000/uploads/${img}`)}
                  className="w-full h-28 sm:h-32 md:h-36 rounded-lg overflow-hidden border border-slate-100 shadow-sm focus:outline-none"
                >
                  <img
                    src={`http://localhost:5000/uploads/${img}`}
                    alt={`${project.projectName}-img-${idx}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
              {project.images.length > 3 && (
                <div className="relative w-full h-28 sm:h-32 md:h-36 rounded-lg overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center bg-black/40 text-white font-bold">
                  <span>+{project.images.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
              liked
                ? "bg-indigo-50 text-indigo-400 border border-indigo-100 cursor-default"
                : "bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100"
            }`}
          >
            👍 {liked ? "Liked" : "Like"} <span className="font-bold">{likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
          >
            💬 {showComments ? "Hide" : `Comments (${comments.length})`}
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-5 space-y-4 fade-in-up">
            <form onSubmit={handleAddComment} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm transition shadow-inner"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm transition shadow-inner"
                />
                <button
                  type="submit"
                  className="glow-btn px-5 py-2.5 rounded-xl font-medium text-sm shadow-md"
                >
                  Post
                </button>
              </div>
            </form>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No comments yet — be the first!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-indigo-600 font-semibold text-sm">{comment.userName}</span>
                      <span className="text-slate-400 text-xs">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="expanded"
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-5 right-5 text-slate-600 bg-white border border-slate-200 rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-50 transition shadow-lg"
            onClick={() => setModalImage(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}