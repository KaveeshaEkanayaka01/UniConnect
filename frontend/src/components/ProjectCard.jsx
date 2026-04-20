import React, { useEffect, useState } from "react";
import axios from "axios";

const ProjectCard = ({ project }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [userName, setUserName] = useState("");
  const [text, setText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likes, setLikes] = useState(project?.likes || 0);
  const [liking, setLiking] = useState(false);

  const firstImage =
    project?.images?.length > 0
      ? `http://localhost:5000/uploads/${project.images[0]}`
      : null;

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
    setLikes(project?.likes || 0);
    fetchComments();
  }, [project?._id, project?.likes]);

  const handleLike = async () => {
    if (!project?._id) return;

    try {
      setLiking(true);

      const res = await axios.put(
        `http://localhost:5000/api/projects/like/${project._id}`
      );

      setLikes(res.data?.likes || 0);
    } catch (error) {
      console.error("Error liking project:", error);
      alert("Failed to like project");
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!userName.trim() || !text.trim()) {
      alert("Please enter both name and comment.");
      return;
    }

    try {
      setSubmittingComment(true);

      await axios.post(
        `http://localhost:5000/api/projects/comment/${project._id}`,
        {
          userName,
          text,
        }
      );

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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
      {firstImage && (
        <img
          src={firstImage}
          alt={project?.projectName || "Project"}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {project?.projectName || "Untitled Project"}
          </h3>

          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 whitespace-nowrap">
            {project?.status || "Ongoing"}
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-3 line-clamp-3">
          {project?.description || "No description available."}
        </p>

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

        <div className="flex items-center gap-6 border-t border-slate-200 pt-4 mb-4 text-sm text-slate-600">
          <button
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-2 hover:text-indigo-600 transition disabled:opacity-60"
          >
            <span className="text-lg">👍</span>
            <span>
              <span className="font-semibold text-slate-800">{likes}</span>{" "}
              Likes
            </span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <span>
              <span className="font-semibold text-slate-800">
                {comments.length}
              </span>{" "}
              Comments
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">
            Add Comment
          </h4>

          <form onSubmit={handleAddComment} className="space-y-3 mb-5">
            <input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />

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
      </div>
    </div>
  );
};

export default ProjectCard;