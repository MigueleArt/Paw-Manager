import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0ig9ydA0HGu0HS2fM1J1w9blZbMcl87g",
  authDomain: "paw-manager-3e46b.firebaseapp.com",
  projectId: "paw-manager-3e46b",
  storageBucket: "paw-manager-3e46b.firebasestorage.app",
  messagingSenderId: "1089763357375",
  appId: "1:1089763357375:web:eec03bcdd466fe16be4c0a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  try {
    console.log("Iniciando creación de datos de prueba...");

    // 1. Crear una clínica
    const clinicRef = await addDoc(collection(db, 'clinics'), {
      name: "Veterinaria Huellitas de Prueba",
      ownerUid: "seed_admin", // Se actualizará pronto
      createdAt: new Date().toISOString()
    });
    console.log("✅ Clínica creada exitosamente con ID: " + clinicRef.id);

    // 2. Crear un usuario Administrador
    const adminEmail = "admin2@pawmanager.com";
    const adminPass = "PawManager123!";
    const adminUser = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
    console.log("✅ Cuenta de Administrador creada en Auth: " + adminUser.user.uid);

    await addDoc(collection(db, 'roles'), {
      name: "Dr. Admin Demo",
      email: adminEmail,
      role: 'Administrador',
      status: 'Activo',
      uid: adminUser.user.uid,
      clinicId: clinicRef.id
    });
    console.log("✅ Documento de rol de Administrador creado en Firestore");

    // Actualizar dueño de la clínica
    await setDoc(doc(db, 'clinics', clinicRef.id), {
      name: "Veterinaria Huellitas de Prueba",
      ownerUid: adminUser.user.uid,
      createdAt: new Date().toISOString()
    });

    // 3. Crear un usuario Empleado
    const empEmail = "recepcion@pawmanager.com";
    const empPass = "PawManager123!";
    const empUser = await createUserWithEmailAndPassword(auth, empEmail, empPass);
    console.log("✅ Cuenta de Empleado creada en Auth: " + empUser.user.uid);

    await addDoc(collection(db, 'roles'), {
      name: "María Recepción",
      email: empEmail,
      role: 'Recepcionista',
      status: 'Activo',
      uid: empUser.user.uid,
      clinicId: clinicRef.id
    });
    console.log("✅ Documento de rol de Empleado creado en Firestore");

    // 4. Crear un par de pacientes de prueba
    await addDoc(collection(db, 'pets'), {
      name: "Firulais",
      species: "Perro",
      breed: "Golden Retriever",
      age: "3 años",
      owner: "Juan Pérez",
      clinicId: clinicRef.id,
      lastVisit: new Date().toLocaleDateString('es-ES')
    });
    
    await addDoc(collection(db, 'pets'), {
      name: "Michi",
      species: "Gato",
      breed: "Siamés",
      age: "1 año",
      owner: "Ana López",
      clinicId: clinicRef.id,
      lastVisit: new Date().toLocaleDateString('es-ES')
    });
    console.log("✅ Pacientes de prueba creados");

    console.log("=== ¡SEMBRADO DE DATOS COMPLETADO! ===");
    console.log("Puedes iniciar sesión con:");
    console.log("Admin: " + adminEmail + " / " + adminPass);
    console.log("Empleado: " + empEmail + " / " + empPass);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error durante la creación de datos:", err);
    process.exit(1);
  }
}

seed();
