import { pool } from "./pool.js";
import { auth } from "../lib/auth.js";

const MORNING = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
const AFTERNOON = ["02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function weekdaySchedule(saturdaySlots = []) {
  const days = WEEKDAY_NAMES.map((day) => ({ day, slots: [...MORNING, ...AFTERNOON] }));
  if (saturdaySlots.length) days.push({ day: "Saturday", slots: saturdaySlots });
  return days;
}

const SPECIALTIES = [
  { slug: "cardiology", name: "Cardiology", icon: "HeartPulse", description: "Heart and cardiovascular system care" },
  { slug: "dermatology", name: "Dermatology", icon: "Sparkles", description: "Skin, hair and nail treatment" },
  { slug: "pediatrics", name: "Pediatrics", icon: "Baby", description: "Health care for infants and children" },
  { slug: "orthopedics", name: "Orthopedics", icon: "Bone", description: "Bones, joints and muscle care" },
  { slug: "neurology", name: "Neurology", icon: "Brain", description: "Brain and nervous system disorders" },
  { slug: "dentistry", name: "Dentistry", icon: "Smile", description: "Dental and oral health care" },
  { slug: "ent", name: "ENT", icon: "Ear", description: "Ear, nose and throat specialists" },
  { slug: "gynecology", name: "Gynecology", icon: "Flower2", description: "Women's reproductive health" },
  { slug: "general", name: "General Physician", icon: "Stethoscope", description: "Primary and preventive care" },
  { slug: "psychiatry", name: "Psychiatry", icon: "BrainCog", description: "Mental health and wellbeing" },
  { slug: "ophthalmology", name: "Ophthalmology", icon: "Eye", description: "Eye care and vision correction" },
  { slug: "gastroenterology", name: "Gastroenterology", icon: "Pill", description: "Digestive system disorders" },
];

const DOCTORS = [
  {
    name: "Dr. Ananya Sharma", specialtySlug: "cardiology", qualifications: "MBBS, MD (Cardiology), DM",
    experienceYears: 14, rating: 4.8, reviewsCount: 312, location: "Downtown Medical Center",
    hospital: "St. Luke's Heart Institute",
    bio: "Dr. Sharma specializes in interventional cardiology and preventive heart care, helping patients manage hypertension, arrhythmia and coronary artery disease.",
    consultationFee: 120, avatarColor: "bg-rose-100 text-rose-700", gender: "female",
    languages: ["English", "Hindi"], schedule: weekdaySchedule(MORNING),
  },
  {
    name: "Dr. Michael Chen", specialtySlug: "cardiology", qualifications: "MBBS, MD, FACC",
    experienceYears: 20, rating: 4.9, reviewsCount: 487, location: "Riverside Health Campus",
    hospital: "Riverside Cardiac Center",
    bio: "A senior cardiologist with two decades of experience in echocardiography and heart failure management.",
    consultationFee: 150, avatarColor: "bg-rose-100 text-rose-700", gender: "male",
    languages: ["English", "Mandarin"], schedule: weekdaySchedule(),
  },
  {
    name: "Dr. Priya Nair", specialtySlug: "dermatology", qualifications: "MBBS, MD (Dermatology)",
    experienceYears: 9, rating: 4.7, reviewsCount: 201, location: "Sunrise Skin Clinic",
    hospital: "Sunrise Wellness Hospital",
    bio: "Dr. Nair treats acne, eczema, psoriasis and provides cosmetic dermatology consultations with a patient-first approach.",
    consultationFee: 90, avatarColor: "bg-amber-100 text-amber-700", gender: "female",
    languages: ["English", "Malayalam"], schedule: weekdaySchedule(MORNING),
  },
  {
    name: "Dr. James Whitfield", specialtySlug: "pediatrics", qualifications: "MBBS, MD (Pediatrics)",
    experienceYears: 16, rating: 4.9, reviewsCount: 356, location: "Little Stars Children's Clinic",
    hospital: "Grace Children's Hospital",
    bio: "Dr. Whitfield is a warm and experienced pediatrician focused on childhood development, vaccinations and acute care.",
    consultationFee: 85, avatarColor: "bg-sky-100 text-sky-700", gender: "male",
    languages: ["English"], schedule: weekdaySchedule(MORNING),
  },
  {
    name: "Dr. Elena Rossi", specialtySlug: "orthopedics", qualifications: "MBBS, MS (Ortho)",
    experienceYears: 12, rating: 4.6, reviewsCount: 178, location: "Metro Bone & Joint Center",
    hospital: "Metro General Hospital",
    bio: "Specializes in sports injuries, joint replacement and spine care with a focus on minimally invasive procedures.",
    consultationFee: 110, avatarColor: "bg-violet-100 text-violet-700", gender: "female",
    languages: ["English", "Italian"], schedule: weekdaySchedule(),
  },
  {
    name: "Dr. Arjun Mehta", specialtySlug: "neurology", qualifications: "MBBS, DM (Neurology)",
    experienceYears: 18, rating: 4.8, reviewsCount: 264, location: "NeuroCare Institute",
    hospital: "Apex Brain & Spine Hospital",
    bio: "Expert in treating migraines, epilepsy, stroke recovery and other neurological disorders.",
    consultationFee: 140, avatarColor: "bg-indigo-100 text-indigo-700", gender: "male",
    languages: ["English", "Hindi", "Gujarati"], schedule: weekdaySchedule(MORNING),
  },
  {
    name: "Dr. Sofia Martinez", specialtySlug: "dentistry", qualifications: "BDS, MDS (Orthodontics)",
    experienceYears: 8, rating: 4.7, reviewsCount: 219, location: "Bright Smile Dental Studio",
    hospital: "Bright Smile Dental Studio",
    bio: "Focused on cosmetic dentistry, braces and general oral hygiene for the whole family.",
    consultationFee: 70, avatarColor: "bg-teal-100 text-teal-700", gender: "female",
    languages: ["English", "Spanish"], schedule: weekdaySchedule(AFTERNOON),
  },
  {
    name: "Dr. Daniel Obi", specialtySlug: "ent", qualifications: "MBBS, MS (ENT)",
    experienceYears: 11, rating: 4.5, reviewsCount: 143, location: "ClearHear ENT Clinic",
    hospital: "Unity General Hospital",
    bio: "Treats sinus issues, hearing loss and throat conditions with modern diagnostic equipment.",
    consultationFee: 95, avatarColor: "bg-cyan-100 text-cyan-700", gender: "male",
    languages: ["English"], schedule: weekdaySchedule(),
  },
  {
    name: "Dr. Kavita Iyer", specialtySlug: "gynecology", qualifications: "MBBS, MD (OBG)",
    experienceYears: 15, rating: 4.9, reviewsCount: 298, location: "Womens Wellness Center",
    hospital: "Lotus Maternity Hospital",
    bio: "Provides compassionate care in prenatal checkups, fertility consultations and general gynecological health.",
    consultationFee: 100, avatarColor: "bg-pink-100 text-pink-700", gender: "female",
    languages: ["English", "Hindi", "Tamil"], schedule: weekdaySchedule(MORNING),
  },
  {
    name: "Dr. Robert Hayes", specialtySlug: "general", qualifications: "MBBS, MD (Internal Medicine)",
    experienceYears: 22, rating: 4.8, reviewsCount: 512, location: "Community Health Clinic",
    hospital: "Parkview Medical Center",
    bio: "A trusted family physician offering checkups, chronic disease management and preventive care advice.",
    consultationFee: 60, avatarColor: "bg-emerald-100 text-emerald-700", gender: "male",
    languages: ["English"], schedule: weekdaySchedule([...MORNING, ...AFTERNOON]),
  },
  {
    name: "Dr. Grace Lin", specialtySlug: "general", qualifications: "MBBS, MD",
    experienceYears: 7, rating: 4.6, reviewsCount: 134, location: "Harbor View Clinic",
    hospital: "Harbor View Medical Group",
    bio: "Focuses on holistic primary care, health screenings and wellness planning for adults.",
    consultationFee: 55, avatarColor: "bg-emerald-100 text-emerald-700", gender: "female",
    languages: ["English", "Mandarin"], schedule: weekdaySchedule(),
  },
  {
    name: "Dr. Samuel Okafor", specialtySlug: "psychiatry", qualifications: "MBBS, MD (Psychiatry)",
    experienceYears: 13, rating: 4.7, reviewsCount: 187, location: "Mindful Path Clinic",
    hospital: "Serenity Behavioral Health",
    bio: "Provides confidential support for anxiety, depression and stress management with a non-judgmental approach.",
    consultationFee: 130, avatarColor: "bg-purple-100 text-purple-700", gender: "male",
    languages: ["English"], schedule: weekdaySchedule(MORNING),
  },
  {
    name: "Dr. Hannah Kim", specialtySlug: "ophthalmology", qualifications: "MBBS, MS (Ophthalmology)",
    experienceYears: 10, rating: 4.8, reviewsCount: 165, location: "Clear Vision Eye Center",
    hospital: "Clear Vision Eye Center",
    bio: "Specializes in cataract surgery, LASIK consultations and comprehensive eye exams.",
    consultationFee: 90, avatarColor: "bg-blue-100 text-blue-700", gender: "female",
    languages: ["English", "Korean"], schedule: weekdaySchedule(),
  },
  {
    name: "Dr. Thomas Berger", specialtySlug: "gastroenterology", qualifications: "MBBS, DM (Gastroenterology)",
    experienceYears: 17, rating: 4.7, reviewsCount: 231, location: "DigestCare Institute",
    hospital: "Cedar Valley Hospital",
    bio: "Experienced in treating acid reflux, IBS, liver disease and performing diagnostic endoscopies.",
    consultationFee: 125, avatarColor: "bg-orange-100 text-orange-700", gender: "male",
    languages: ["English", "German"], schedule: weekdaySchedule(MORNING),
  },
];

function offsetISODate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  const client = await pool.connect();
  let doctorIds = [];
  try {
    await client.query("BEGIN");

    console.log("Clearing existing data...");
    await client.query(
      `TRUNCATE appointments, doctor_schedule, doctors, patients, specialties,
                "user", session, account, verification
       RESTART IDENTITY CASCADE`,
    );

    console.log("Seeding specialties...");
    const specialtyIdBySlug = {};
    for (const s of SPECIALTIES) {
      const { rows } = await client.query(
        "INSERT INTO specialties (slug, name, icon, description) VALUES ($1, $2, $3, $4) RETURNING id",
        [s.slug, s.name, s.icon, s.description],
      );
      specialtyIdBySlug[s.slug] = rows[0].id;
    }

    console.log("Seeding doctors and schedules...");
    for (const doc of DOCTORS) {
      const { rows } = await client.query(
        `INSERT INTO doctors
          (specialty_id, name, qualifications, experience_years, rating, reviews_count, location, hospital, bio, consultation_fee, avatar_color, gender, languages)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          specialtyIdBySlug[doc.specialtySlug],
          doc.name,
          doc.qualifications,
          doc.experienceYears,
          doc.rating,
          doc.reviewsCount,
          doc.location,
          doc.hospital,
          doc.bio,
          doc.consultationFee,
          doc.avatarColor,
          doc.gender,
          doc.languages,
        ],
      );
      const doctorId = rows[0].id;
      doctorIds.push(doctorId);

      for (const { day, slots } of doc.schedule) {
        for (const slot of slots) {
          await client.query(
            "INSERT INTO doctor_schedule (doctor_id, day_of_week, slot_time) VALUES ($1, $2, $3)",
            [doctorId, day, slot],
          );
        }
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  // Demo accounts are created through Better Auth's own sign-up flow so
  // passwords are hashed exactly as they would be for a real user, and the
  // databaseHooks in lib/auth.js handle linking patients/doctors rows.
  console.log("Seeding demo users...");

  const { user: patientUser } = await auth.api.signUpEmail({
    body: {
      name: "Jordan Patient",
      email: "patient@demo.com",
      password: "patient123",
      role: "patient",
      phone: "+1 555-0101",
    },
  });

  // Seeded first, so this is the doctor the create.after hook auto-links to
  // (the first doctor row with a NULL user_id) — Dr. Ananya Sharma, Cardiology.
  await auth.api.signUpEmail({
    body: {
      name: "Dr. Ananya Sharma",
      email: "doctor@demo.com",
      password: "doctor123",
      role: "doctor",
      phone: "+1 555-0102",
    },
  });

  // Admins can't self-register (blocked in databaseHooks.user.create.before),
  // so sign up as a patient, then promote directly and drop the
  // auto-created patient profile.
  const { user: adminUser } = await auth.api.signUpEmail({
    body: {
      name: "Alex Admin",
      email: "admin@demo.com",
      password: "admin123",
      role: "patient",
      phone: "+1 555-0103",
    },
  });
  await pool.query('UPDATE "user" SET role = $1 WHERE id = $2', ["admin", adminUser.id]);
  await pool.query("DELETE FROM patients WHERE user_id = $1", [adminUser.id]);

  const { rows: patientRows } = await pool.query("SELECT id FROM patients WHERE user_id = $1", [
    patientUser.id,
  ]);
  const patientId = patientRows[0].id;

  console.log("Seeding sample appointments...");
  const demoDoctorId = doctorIds[0];
  const secondDoctorId = doctorIds[1];
  await pool.query(
    `INSERT INTO appointments (doctor_id, patient_id, appointment_date, appointment_time, reason, status, fee)
     VALUES
      ($1, $2, $3, '10:00 AM', 'Routine heart checkup and ECG review.', 'upcoming', 120),
      ($1, $2, $4, '09:30 AM', 'Follow-up on blood pressure medication.', 'completed', 120),
      ($5, $2, $6, '02:00 PM', 'Second opinion on arrhythmia symptoms.', 'cancelled', 150)`,
    [demoDoctorId, patientId, offsetISODate(2), offsetISODate(-6), secondDoctorId, offsetISODate(-12)],
  );

  console.log("Seed complete.");
  console.log("Demo accounts: patient@demo.com / patient123, doctor@demo.com / doctor123, admin@demo.com / admin123");

  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
