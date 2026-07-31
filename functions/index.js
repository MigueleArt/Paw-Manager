const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

const HOUR_MS = 60 * 60 * 1000;

function buildAppointmentDateTime(date, time) {
  return new Date(`${date}T${time}:00-06:00`);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isReminderCandidate(appointmentDateTime, now) {
  const windowStart = new Date(now.getTime() + 23.5 * HOUR_MS);
  const windowEnd = new Date(now.getTime() + 24.5 * HOUR_MS);

  return appointmentDateTime >= windowStart && appointmentDateTime <= windowEnd;
}

exports.sendAppointmentReminders = onSchedule(
  {
    schedule: "every 30 minutes",
    timeZone: "America/Mexico_City",
    region: "us-central1",
  },
  async () => {
    const now = new Date();

    const snapshot = await db
      .collection("appointments")
      .where("reminderSent", "==", false)
      .limit(200)
      .get();

    if (snapshot.empty) {
      logger.info("No hay citas pendientes de recordatorio.");
      return;
    }

    const batch = db.batch();
    let queuedCount = 0;
    let skippedCount = 0;

    for (const appointmentDoc of snapshot.docs) {
      const appointment = appointmentDoc.data();

      const validStatus =
        appointment.status === "Pendiente" ||
        appointment.status === "Confirmada";

      if (!validStatus) {
        skippedCount++;
        continue;
      }

      if (!appointment.date || !appointment.time || !appointment.petName) {
        skippedCount++;
        continue;
      }

      const appointmentDateTime = buildAppointmentDateTime(
        appointment.date,
        appointment.time
      );

      if (Number.isNaN(appointmentDateTime.getTime())) {
        skippedCount++;
        continue;
      }

      if (!isReminderCandidate(appointmentDateTime, now)) {
        skippedCount++;
        continue;
      }

      if (!appointment.ownerEmail) {
        batch.update(appointmentDoc.ref, {
          reminderStatus: "missing_email",
          reminderLastError: "La cita no tiene correo del dueño registrado.",
          reminderCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        skippedCount++;
        continue;
      }

      const petName = appointment.petName || "tu mascota";
      const ownerName = appointment.ownerName || "cliente";
      const reason = appointment.reason || appointment.type || "Consulta veterinaria";
      const doctor = appointment.doctor || "Por confirmar";

      const mailRef = db.collection("mail").doc();

      batch.set(mailRef, {
        to: [appointment.ownerEmail],
        message: {
          subject: `Recordatorio de cita para ${petName}`,
          text:
            `Hola ${ownerName}, te recordamos que ${petName} tiene una cita ` +
            `programada el ${appointment.date} a las ${appointment.time}. ` +
            `Motivo: ${reason}. Veterinario: ${doctor}. Te esperamos.`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
              <h2 style="color: #1B4332;">Recordatorio de cita veterinaria</h2>
              <p>Hola <strong>${escapeHtml(ownerName)}</strong>,</p>
              <p>Te recordamos que <strong>${escapeHtml(petName)}</strong> tiene una cita programada.</p>
              <ul>
                <li><strong>Fecha:</strong> ${escapeHtml(appointment.date)}</li>
                <li><strong>Hora:</strong> ${escapeHtml(appointment.time)}</li>
                <li><strong>Motivo:</strong> ${escapeHtml(reason)}</li>
                <li><strong>Veterinario:</strong> ${escapeHtml(doctor)}</li>
              </ul>
              <p>Te esperamos en la clínica.</p>
              <p style="font-size: 12px; color: #6b7280;">Este mensaje fue enviado automáticamente por PawManager.</p>
            </div>
          `,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        appointmentId: appointmentDoc.id,
        clinicId: appointment.clinicId || null,
      });

      batch.update(appointmentDoc.ref, {
        reminderSent: true,
        reminderStatus: "queued",
        reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
        reminderMailId: mailRef.id,
        history: admin.firestore.FieldValue.arrayUnion({
          text: "Recordatorio de cita encolado para envío por correo",
          timestamp: now.toISOString(),
        }),
      });

      queuedCount++;
    }

    if (queuedCount > 0 || skippedCount > 0) {
      await batch.commit();
    }

    logger.info("Proceso de recordatorios finalizado.", {
      queuedCount,
      skippedCount,
    });
  }
);
