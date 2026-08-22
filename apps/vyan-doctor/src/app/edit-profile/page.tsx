import { redirect } from "next/navigation";

/**
 * `/edit-profile` has no content of its own — the four sections do.
 *
 * It rendered the string "helo". Anyone reaching this URL from a bookmark or by
 * trimming a path saw that and nothing else. It sends them to the first section
 * instead.
 */
const EditProfile = () => {
  redirect("/edit-profile/personal-info");
};

export default EditProfile;
