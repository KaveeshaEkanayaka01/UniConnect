import React from "react";

const ProjectCard = ({ project }) => {
  return (
    <div className="p-4 border rounded shadow">
      <h3 className="font-bold">{project?.title}</h3>
      <p>{project?.description}</p>
    </div>
  );
};

export default ProjectCard;