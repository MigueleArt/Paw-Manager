/**
 * Script de migración: Incidente "Dueño como texto libre"
 * -------------------------------------------------------
 * Lee todos los documentos de la colección "pets" que todavía NO tengan
 * "clientId", agrupa por (clinicId + nombre de dueño + teléfono) para no
 * duplicar clientes, crea un documento real en la colección "clients" por
 * cada grupo único, y actualiza cada paciente con su "clientId".
 *
 * Es SEGURO ejecutarlo más de una vez: los pacientes que ya tengan
 * clientId se omiten, y no se crean clientes duplicados si el script
 * se corre dos veces.
 *
 * Cómo ejecutarlo (desde la carpeta backend/):
 *   npx ts-node scripts/migrateOwnersToClients.ts
 */
import { db } from '../src/config/firebase';

const normalize = (value: string) => (value || '').trim().toLowerCase();

async function migrate() {
  console.log('🔎 Leyendo pacientes existentes...');
  const petsSnapshot = await db.collection('pets').get();

  const petsToMigrate = petsSnapshot.docs.filter((doc) => !doc.data().clientId);
  console.log(`📋 Pacientes sin clientId encontrados: ${petsToMigrate.length} de ${petsSnapshot.size} totales.`);

  if (petsToMigrate.length === 0) {
    console.log('✅ No hay nada que migrar. Todos los pacientes ya tienen clientId.');
    return;
  }

  // Cache de clientes ya creados/encontrados en esta corrida, para no duplicar.
  // key = clinicId + "|" + nombre normalizado + "|" + teléfono normalizado
  const clientCache = new Map<string, string>(); // key -> clientId

  let clientsCreated = 0;
  let petsUpdated = 0;

  for (const petDoc of petsToMigrate) {
    const pet = petDoc.data();
    const clinicId = pet.clinicId || 'clinica_por_defecto';
    const ownerName = (pet.owner || '').trim();
    const ownerPhone = (pet.ownerPhone || '').trim();

    if (!ownerName) {
      console.warn(`⚠️  Paciente "${pet.name}" (${petDoc.id}) no tiene dueño registrado. Se omite.`);
      continue;
    }

    const key = `${clinicId}|${normalize(ownerName)}|${normalize(ownerPhone)}`;

    let clientId = clientCache.get(key);

    if (!clientId) {
      // ¿Ya existe un cliente igual en Firestore (de una corrida anterior)?
      const existingSnapshot = await db
        .collection('clients')
        .where('clinicId', '==', clinicId)
        .where('name', '==', ownerName)
        .get();

      const existingMatch = existingSnapshot.docs.find(
        (d) => normalize(d.data().phone || '') === normalize(ownerPhone)
      );

      if (existingMatch) {
        clientId = existingMatch.id;
      } else {
        const newClientRef = await db.collection('clients').add({
          name: ownerName,
          phone: ownerPhone || '',
          email: '',
          address: '',
          clinicId,
          createdAt: new Date().toISOString(),
          migratedFromPetText: true,
        });
        clientId = newClientRef.id;
        clientsCreated += 1;
        console.log(`➕ Cliente creado: "${ownerName}" (${ownerPhone || 'sin teléfono'}) -> ${clientId}`);
      }

      clientCache.set(key, clientId);
    }

    await petDoc.ref.update({ clientId });
    petsUpdated += 1;
  }

  console.log('\n--- Resumen de migración ---');
  console.log(`Clientes nuevos creados: ${clientsCreated}`);
  console.log(`Pacientes vinculados:    ${petsUpdated}`);
  console.log('✅ Migración completada.');
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  });