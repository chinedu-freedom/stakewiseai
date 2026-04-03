"use client";

// Temporary toast function for notifications
export const toast = ({ title = "", description = "", variant = "default" }) => {
  let message = title;
  if (description) message += `: ${description}`;

  switch (variant) {
    case "destructive":
      console.error(message);
      alert(message);
      break;
    default:
      console.log(message);
      alert(message);
      break;
  }
};
