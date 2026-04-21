import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "./Auth/axios";

const ProjectCard = ({ project }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [text, setText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likes, setLikes] = useState(project?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const description = project?.description || "No description available.";
  const shouldShowReadMore = description.length > 140;
  const projectImages = Array.isArray(project?.images)
    ? project.images.filter(Boolean)
    : [];

  const imageUrls = projectImages.map(
    (img) => `http://localhost:5000/uploads/${img}`
  );

  const hasImages = imageUrls.length > 0;
  const activeImage = hasImages
    ? imageUrls[Math.min(activeImageIndex, imageUrls.length - 1)]
    : null;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [project?._id]);

  const fetchComments = async () => {
    if (!project?._id) {
      setComments([]);
      setLoadingComments(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/projects/comments/${project._id}`
      );
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    let currentUserId = "";

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      currentUserId = String(storedUser?._id || "");
    } catch {
      currentUserId = "";
    }

    const likedBy = Array.isArray(project?.likedBy) ? project.likedBy : [];

    setHasLiked(
      currentUserId
        ? likedBy.some((id) => String(id) === currentUserId)
        : false
    );
    setLikes(project?.likes || 0);
    fetchComments();
  }, [project?._id, project?.likes, project?.likedBy]);

  const handleLike = async () => {
    if (!project?._id) return;

    try {
      setLiking(true);

      const res = await API.put(`/projects/like/${project._id}`);

      setLikes(res.data?.likes || 0);
      setHasLiked(Boolean(res.data?.liked));
    } catch (error) {
      console.error("Error liking project:", error);
      if (error?.response?.status === 401) {
        alert("Please login to like this project.");
      } else {
        alert("Failed to update like");
      }
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      alert("Please type a comment.");
      return;
    }

    try {
      setSubmittingComment(true);

      await API.post(`/projects/comment/${project._id}`, { text });

      setText("");
      await fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="h-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">
      {hasImages && (
        <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
          <img
            src={activeImage}
            alt={project?.projectName || "Project"}
            className="w-full h-full object-cover object-center"
          />

          {imageUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === 0 ? imageUrls.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 transition"
                aria-label="Previous image"
              >
                &#8249;
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === imageUrls.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 transition"
                aria-label="Next image"
              >
                &#8250;
              </button>

              <div className="absolute right-2 bottom-2 px-2 py-1 rounded-md bg-slate-900/65 text-white text-xs font-semibold">
                {activeImageIndex + 1}/{imageUrls.length}
              </div>
            </>
          )}
        </div>
      )}

      {imageUrls.length > 1 && (
        <div className="px-3 pt-3 flex gap-2 overflow-x-auto">
          {imageUrls.map((url, idx) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                activeImageIndex === idx
                  ? "border-indigo-500"
                  : "border-transparent hover:border-slate-300"
              }`}
              aria-label={`Show image ${idx + 1}`}
            >
              <img
                src={url}
                alt={`Project image ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {project?.projectName || "Untitled Project"}
          </h3>

          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 whitespace-nowrap">
            {project?.status || "Ongoing"}
          </span>
        </div>

        <p
          className={`text-sm text-slate-600 mb-1 ${
            showFullDescription ? "" : "line-clamp-3"
          }`}
        >
          {description}
        </p>

        {shouldShowReadMore && (
          <button
            type="button"
            onClick={() => setShowFullDescription((prev) => !prev)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-3"
          >
            {showFullDescription ? "Read Less" : "Read More"}
          </button>
        )}

        <div className="space-y-1 text-sm text-slate-500 mb-4">
          <p>
            <span className="font-medium text-slate-700">Category:</span>{" "}
            {project?.category || "-"}
          </p>
          <p>
            <span className="font-medium text-slate-700">Club:</span>{" "}
            {project?.clubName || "-"}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 mb-4">
          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            aria-pressed={hasLiked}
            className={`h-11 rounded-xl border text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              hasLiked
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={hasLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 9V5a3 3 0 00-6 0v4M5 11h14l-1 8H6l-1-8z"
              />
            </svg>
            <span>{hasLiked ? "Liked" : "Like"} ({likes})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            aria-expanded={showComments}
            className={`h-11 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2 ${
              showComments
                ? "bg-slate-100 border-slate-300 text-slate-900"
                : "bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h8M8 14h5m8-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{showComments ? "Hide" : "Comments"} ({comments.length})</span>
          </button>
        </div>

        {showComments && (
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">
              Add Comment
            </h4>

            <form onSubmit={handleAddComment} className="space-y-3 mb-5">
              <textarea
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />

              <button
                type="submit"
                disabled={submittingComment}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {submittingComment ? "Posting..." : "Post Comment"}
              </button>
            </form>

            <h4 className="text-sm font-semibold text-slate-800 mb-3">
              Comments
            </h4>

            {loadingComments ? (
              <p className="text-sm text-slate-400">Loading comments...</p>
            ) : comments.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                  >
                    <p className="text-sm font-medium text-slate-800">
                      {comment.userName || "Anonymous"}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {comment.text || "No comment text"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No comments yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;