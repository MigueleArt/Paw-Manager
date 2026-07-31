const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const HOUR_MS = 60 * 60 * 1000;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getServiceAccount() {
  const raw = requiredEnv("FIREBASE_SERVICE_ACCOUNT");
  const serviceAccount = JSON.parse(raw);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  return serviceAccount;
}

function buildAppointmentDateTime(date, time) {
  return new Date(`${date}T${time}:00-06:00`);
}

function isReminderCandidate(appointmentDateTime, now) {
  const windowStart = new Date(now.getTime() + 23 * HOUR_MS);
  const windowEnd = new Date(now.getTime() + 25 * HOUR_MS);

  return appointmentDateTime >= windowStart && appointmentDateTime <= windowEnd;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createTransporter() {
  return nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port: Number(requiredEnv("SMTP_PORT")),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASS"),
    },
  });
}

function buildEmail(appointment) {
  const petName = appointment.petName || "tu mascota";
  const ownerName = appointment.ownerName || "cliente";
  const reason = appointment.reason || appointment.type || "Consulta veterinaria";
  const doctor = appointment.doctor || "Por confirmar";
  const date = appointment.date;
  const time = appointment.time;

  return {
    subject: `Recordatorio de cita para ${petName}`,
    text:
      `Hola ${ownerName}, te recordamos que ${petName} tiene una cita ` +
      `programada el ${date} a las ${time}. ` +
      `Motivo: ${reason}. Veterinario: ${doctor}. Te esperamos.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="color: #1B4332;">Recordatorio de cita veterinaria</h2>
        <p>Hola <strong>${escapeHtml(ownerName)}</strong>,</p>
        <p>Te recordamos que <strong>${escapeHtml(petName)}</strong> tiene una cita programada.</p>
        <ul>
          <li><strong>Mascota:</strong> ${escapeHtml(petName)}</li>
          <li><strong>Fecha:</strong> ${escapeHtml(date)}</li>
          <li><strong>Hora:</strong> ${escapeHtml(time)}</li>
          <li><strong>Motivo:</strong> ${escapeHtml(reason)}</li>
          <li><strong>Veterinario:</strong> ${escapeHtml(doctor)}</li>
        </ul>
        <p>Te esperamos en la clínica.</p>
        <p style="font-size: 12px; color: #6b7280;">Este mensaje fue enviado automáticamente por PawManager.</p>
      </div>
    `,
  };
}

async function main() {
  const serviceAccount = getServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();
  const transporter = createTransporter();

  const now = new Date();

  console.log("Iniciando revisión de recordatorios:", now.toISOString());

  const snapshot = await db
    .collection("appointments")
    .where("reminderSent", "==", false)
    .limit(200)
    .get();

  if (snapshot.empty) {
    console.log("No hay citas pendientes de recordatorio.");
    return;
  }

  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const appointmentDoc of snapshot.docs) {
    const appointment = appointmentDoc.data();

    try {
      const validStatus =
        appointment.status === "Pendiente" ||
        appointment.status === "Confirmada";

      if (!validStatus) {
        skippedCount++;
        continue;
      }

      if (!appointment.date || !appointment.time || !appointment.petName) {
        await appointmentDoc.ref.update({
          reminderStatus: "invalid_data",
          reminderLastError: "La cita no tiene fecha, hora o nombre de mascota.",
          reminderCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        skippedCount++;
        continue;
      }

      const appointmentDateTime = buildAppointmentDateTime(
        appointment.date,
        appointment.time
      );

      if (Number.isNaN(appointmentDateTime.getTime())) {
        await appointmentDoc.ref.update({
          reminderStatus: "invalid_datetime",
          reminderLastError: "La fecha u hora de la cita no es válida.",
          reminderCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        skippedCount++;
        continue;
      }

      if (!isReminderCandidate(appointmentDateTime, now)) {
        skippedCount++;
        continue;
      }

      if (!appointment.ownerEmail) {
        await appointmentDoc.ref.update({
          reminderStatus: "missing_email",
          reminderLastError: "La cita no tiene correo del dueño registrado.",
          reminderCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        skippedCount++;
        continue;
      }

      const email = buildEmail(appointment);

      const info = await transporter.sendMail({
        from: requiredEnv("SMTP_FROM"),
        to: appointment.ownerEmail,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      await appointmentDoc.ref.update({
        reminderSent: true,
        reminderStatus: "sent",
        reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
        reminderProvider: "github_actions_smtp",
        reminderMessageId: info.messageId || null,
        reminderLastError: null,
        history: admin.firestore.FieldValue.arrayUnion({
          text: "Recordatorio de cita enviado automáticamente por correo",
          timestamp: now.toISOString(),
        }),
      });

      sentCount++;
      console.log(`Recordatorio enviado: ${appointmentDoc.id} -> ${appointment.ownerEmail}`);
    } catch (error) {
      failedCount++;

      await appointmentDoc.ref.update({
        reminderStatus: "failed",
        reminderLastError: error.message || String(error),
        reminderCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.error(`Error procesando cita ${appointmentDoc.id}:`, error);
    }
  }

  console.log("Proceso finalizado:", {
    sentCount,
    skippedCount,
    failedCount,
  });
}

main().catch((error) => {
  console.error("Error general en recordatorios:", error);
  process.exit(1);
});
