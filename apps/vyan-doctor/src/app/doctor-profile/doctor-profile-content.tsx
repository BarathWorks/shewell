"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PersonalInfoUserAction from "../edit-profile/personal-info/personal-info-user-action";
import EditQualificationUserAction from "../edit-profile/qualification/qualification-user-action";
import SpecializationUserAction from "../edit-profile/specialization/specialization-user-action";

interface IProfessionalSpecialisation {
  id: string;
  specialization: string;
}

interface IProfessionalExperience {
  startingYear: string;
  endingYear: string;
  department: string;
  position: string;
  location: string;
}

interface IProfessionalDegree {
  degree: string;
}

interface IProfile {
  id: string;
  firstName: string | null;
  email: string;
  phoneNumber: string;
  aboutYou: string | null;
  aboutEducation: string | null;
  displayQualificationId: string | null;
  displayQualification: string | undefined;
  ProfessionalSpecializations: IProfessionalSpecialisation[];
  media: {
    fileUrl: string | null;
  } | null;
}

interface IDoctorProfileContent {
  profile: IProfile;
  professionalExperience: IProfessionalExperience[];
  degrees: IProfessionalDegree[];
  allSpecializations: { value: string; label: string }[];
}

const DoctorProfileContent = ({
  profile,
  professionalExperience,
  degrees: initialDegrees,
  allSpecializations = [],
}: IDoctorProfileContent) => {
  const session = useSession();
  const router = useRouter();

  if (session.status === "unauthenticated") {
    router.push("/auth/login");
  }

  // State values
  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || "");
  const [aboutYou, setAboutYou] = useState(profile.aboutYou || "");
  const [aboutEducation, setAboutEducation] = useState(profile.aboutEducation || "");
  const [displayQualificationId, setDisplayQualificationId] = useState(profile.displayQualificationId || "");

  // Dynamic Lists state
  const [degrees, setDegrees] = useState<IProfessionalDegree[]>(
    initialDegrees.length > 0 ? initialDegrees : [{ degree: "" }]
  );
  const [experiences, setExperiences] = useState<IProfessionalExperience[]>(
    professionalExperience.length > 0
      ? professionalExperience
      : [{ startingYear: "", endingYear: "", department: "", position: "", location: "" }]
  );

  // Selected Specializations mapping
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(
    profile.ProfessionalSpecializations.map((s) => s.id)
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Degrees handers
  const handleAddDegree = () => {
    setDegrees([...degrees, { degree: "" }]);
  };

  const handleRemoveDegree = (index: number) => {
    setDegrees(degrees.filter((_, i) => i !== index));
  };

  const handleDegreeChange = (index: number, val: string) => {
    const updated = [...degrees];
    if (updated[index]) {
      updated[index].degree = val;
      setDegrees(updated);
    }
  };

  // Experiences handlers
  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      { startingYear: "", endingYear: "", department: "", position: "", location: "" },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (
    index: number,
    field: keyof IProfessionalExperience,
    val: string
  ) => {
    const updated = [...experiences];
    if (updated[index]) {
      updated[index][field] = val;
      setExperiences(updated);
    }
  };

  // Specializations handlers
  const toggleSpecialization = (id: string) => {
    if (selectedSpecs.includes(id)) {
      setSelectedSpecs(selectedSpecs.filter((s) => s !== id));
    } else {
      setSelectedSpecs([...selectedSpecs, id]);
    }
  };

  // Save profile action
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // 1. Save Personal & Bio Info
      await PersonalInfoUserAction({
        fullName: firstName,
        phoneNumber,
        bio: aboutYou,
        displayQualificationId,
      });

      // 2. Save Academic Degrees & Experience
      await EditQualificationUserAction({
        education: aboutEducation,
        degrees: degrees.filter((d) => d.degree.trim() !== ""),
        experiences: experiences.filter(
          (e) => e.position.trim() !== "" || e.department.trim() !== ""
        ),
      });

      // 3. Save Connected Specializations
      const mappedSpecs = allSpecializations
        .filter((s) => selectedSpecs.includes(s.value))
        .map((s) => ({ value: s.value, label: s.label }));

      await SpecializationUserAction({
        specializations: mappedSpecs,
      });

      setMessage({ text: "Profile details updated successfully!", type: "success" });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Failed to update profile details", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-lg">
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-base">
          <h1 className="font-display-lg text-display-lg text-primary">Profile Management</h1>
          <p className="text-body-md text-on-surface-variant">
            Maintain your clinical details to ensure accurate patient matching.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <button
            onClick={() => router.refresh()}
            className="px-lg py-sm text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-low transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-xl py-sm bg-primary text-on-primary font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">
              {saving ? "sync" : "save"}
            </span>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-md rounded-xl font-bold text-body-md flex items-center gap-sm border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          <span className="material-symbols-outlined">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          {message.text}
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-12 gap-lg">
        {/* Left Column: Personal Summary */}
        <section className="col-span-12 lg:col-span-4 space-y-lg">
          {/* Identity Card */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg flex flex-col items-center border border-outline-variant/10">
            <div className="relative group mb-md">
              <img
                alt={firstName}
                className="w-32 h-32 rounded-full object-cover border-4 border-surface-container-low"
                src={profile.media?.fileUrl || "/images/fallback-user-profile.png"}
              />
              <button className="absolute bottom-1 right-1 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              </button>
            </div>
            <div className="w-full space-y-md">
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-md font-body-md text-on-surface custom-focus"
                />
              </div>
              <div>
                <span className="text-label-caps text-on-surface-variant block mb-1">
                  EMAIL ADDRESS (Read-only)
                </span>
                <p className="font-body-md text-on-surface font-medium p-md bg-gray-50 border border-gray-100 rounded-xl">
                  {profile.email}
                </p>
              </div>
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-1">
                  MOBILE NUMBER
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-md font-body-md text-on-surface custom-focus"
                />
              </div>
              <div>
                <label className="text-label-caps text-on-surface-variant block mb-1">
                  DISPLAY QUALIFICATION
                </label>
                <select
                  value={displayQualificationId}
                  onChange={(e) => setDisplayQualificationId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-md font-body-md text-on-surface custom-focus"
                >
                  <option value="">Select main specialization to display</option>
                  {allSpecializations.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg space-y-md border border-outline-variant/10">
            <div>
              <label className="text-label-caps text-on-surface-variant mb-xs block">
                PROFESSIONAL BIOGRAPHY
              </label>
              <textarea
                value={aboutYou}
                onChange={(e) => setAboutYou(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-md font-body-md text-on-surface custom-focus min-h-[120px] resize-none"
                placeholder="Enter your professional biography..."
              />
            </div>
            <div>
              <label className="text-label-caps text-on-surface-variant mb-xs block">
                ACADEMIC BACKGROUND
              </label>
              <textarea
                value={aboutEducation}
                onChange={(e) => setAboutEducation(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-md font-body-md text-on-surface custom-focus min-h-[120px] resize-none"
                placeholder="Describe your academic credentials and residency journey..."
              />
            </div>
          </div>
        </section>

        {/* Right Column: Professional Details */}
        <section className="col-span-12 lg:col-span-8 space-y-lg">
          {/* Education & Degrees */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg border border-outline-variant/10">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Education &amp; Credentials</h3>
              <button
                onClick={handleAddDegree}
                className="flex items-center gap-1 text-xs text-primary font-bold hover:opacity-80"
              >
                <span className="material-symbols-outlined text-[16px]">add</span> Add Degree
              </button>
            </div>
            <div className="space-y-sm">
              {degrees.map((degreeItem, idx) => (
                <div key={idx} className="flex gap-sm items-center">
                  <input
                    type="text"
                    value={degreeItem.degree}
                    onChange={(e) => handleDegreeChange(idx, e.target.value)}
                    placeholder="e.g. M.B.B.S, Johns Hopkins"
                    className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl p-md font-body-md text-on-surface custom-focus"
                  />
                  <button
                    onClick={() => handleRemoveDegree(idx)}
                    className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Work History */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg border border-outline-variant/10">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Work Experience</h3>
              <button
                onClick={handleAddExperience}
                className="flex items-center gap-1 text-xs text-primary font-bold hover:opacity-80"
              >
                <span className="material-symbols-outlined text-[16px]">add</span> Add Experience
              </button>
            </div>
            <div className="space-y-lg">
              {experiences.map((exp, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-sm items-end border-b border-outline-variant/10 pb-md last:border-b-0 last:pb-0">
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-on-surface-variant block mb-1">YEARS (START - END)</label>
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        placeholder="2018"
                        value={exp.startingYear}
                        onChange={(e) => handleExperienceChange(idx, "startingYear", e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 font-body-md text-on-surface text-center custom-focus"
                      />
                      <span className="text-outline">-</span>
                      <input
                        type="text"
                        placeholder="2022"
                        value={exp.endingYear}
                        onChange={(e) => handleExperienceChange(idx, "endingYear", e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 font-body-md text-on-surface text-center custom-focus"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-on-surface-variant block mb-1">POSITION / TITLE</label>
                    <input
                      type="text"
                      placeholder="Senior OB-GYN"
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(idx, "position", e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 font-body-md text-on-surface custom-focus"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-on-surface-variant block mb-1">DEPARTMENT</label>
                    <input
                      type="text"
                      placeholder="Obstetrics"
                      value={exp.department}
                      onChange={(e) => handleExperienceChange(idx, "department", e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 font-body-md text-on-surface custom-focus"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-on-surface-variant block mb-1">LOCATION</label>
                    <input
                      type="text"
                      placeholder="Chicago, IL"
                      value={exp.location}
                      onChange={(e) => handleExperienceChange(idx, "location", e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-2.5 font-body-md text-on-surface custom-focus"
                    />
                  </div>
                  <div className="md:col-span-1 text-right">
                    <button
                      onClick={() => handleRemoveExperience(idx)}
                      className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors flex items-center justify-center inline-block"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specializations Tags Selection */}
          <div className="bg-surface-container-lowest rounded-xl custom-shadow p-lg border border-outline-variant/10">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Specializations &amp; Services</h3>
            <div className="flex flex-wrap gap-xs">
              {allSpecializations.map((spec) => {
                const isSelected = selectedSpecs.includes(spec.value);
                return (
                  <button
                    key={spec.value}
                    onClick={() => toggleSpecialization(spec.value)}
                    className={`px-4 py-2 rounded-full font-body-md font-bold transition-all flex items-center gap-xs ${
                      isSelected
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {isSelected && <span className="material-symbols-outlined text-sm">check</span>}
                    {spec.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorProfileContent;
