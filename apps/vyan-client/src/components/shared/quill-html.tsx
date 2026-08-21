import React from "react";
import { cn } from "~/lib/utils";
import { sanitizeRichText } from "~/lib/sanitize";
import "quill/dist/quill.snow.css";

const QuillHtml = ({
  body,
  className,
}: {
  body: string;
  className?: string | undefined;
}) => {
  return (
    <div
      className={cn("", className)}
      // Sanitised, not raw: this markup is author-supplied.
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
    ></div>
  );
};

export default QuillHtml;
