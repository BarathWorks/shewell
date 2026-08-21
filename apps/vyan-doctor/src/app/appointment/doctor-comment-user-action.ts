"use server"

import { db } from "~/server/db"
import { getServerAuthSession } from "~/server/auth"
import { logger } from "@repo/observability"

interface ICommentProps{
    comments : string,
    bookAppointmentId : string

}

/**
 * Records a practitioner's note against an appointment.
 *
 * This had no authentication and no ownership check, and it is imported by a client
 * component — so its action id ships to the browser and anyone could call it. That
 * allowed fabricated clinical notes to be attached to any patient's appointment,
 * given only an appointment id.
 *
 * Now: the caller must be signed in, and the appointment must be theirs.
 */
const DoctorCommentUserAction = async({comments, bookAppointmentId} : ICommentProps) => {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return {
      error : "Unauthorized"
    }
  }

  const trimmed = (comments ?? "").trim();
  if (!trimmed) {
    return {
      error : "Comment cannot be empty"
    }
  }

  // Scoped to the signed-in practitioner: an appointment id alone must not be
  // enough to write into a patient's record.
  const appointment = await db.bookAppointment.findFirst({
    where : {
      id : bookAppointmentId,
      professionalUserId : session.user.id
    },
    select : { id : true }
  })

  if (!appointment) {
    logger.warn("comment.appointment_not_owned", {
      source : "doctor-action",
      route : "DoctorCommentUserAction",
      userId : session.user.id
    })
    return {
      error : "Appointment not found"
    }
  }

  try{
    await db.comment.create({
        data : {
            comment : trimmed,
            bookAppointmentId : appointment.id
        }
       })

    logger.info("comment.created", {
      source : "doctor-action",
      userId : session.user.id,
      appointmentId : appointment.id
    })

    return{
     message : "Comment has created"
    }
  }
  catch(error){
    logger.error("comment.create_failed", { source : "doctor-action", error })
    throw new Error("Comment has not created")
  }
}

export default DoctorCommentUserAction
