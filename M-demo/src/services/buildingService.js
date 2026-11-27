import {
  collection,
  addDoc,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { SAMPLE_DATA } from "./sampleDataService";

// 4 Indian Buildings (1 building per organization)
const SEED_BUILDINGS = SAMPLE_DATA.map((item) => ({
  ...item.building,
  orgName: item.organization.name
}));

export const createBuilding = async ({
  name,
  orgId = "",
  orgName = "",
  floors = 6,
  floorsList = null,
  status = "Operational",
  maintenance = "Routine maintenance up to date. All facilities operational.",
  country = ""
}) => {
  const cleanName = name ? name.trim() : "";
  if (!cleanName) {
    throw new Error("Building name is required");
  }

  const numFloors = Number(floors) || (Array.isArray(floorsList) ? floorsList.length : 6);
  const finalFloorsList = Array.isArray(floorsList) && floorsList.length > 0
    ? floorsList
    : Array.from({ length: numFloors }, (_, i) => ({
        floorNo: String(i + 1),
        floorName: i === 0 ? "Ground Floor" : `Floor ${i + 1}`
      }));

  const buildingData = {
    name: cleanName,
    orgId: orgId || "",
    orgName: orgName.trim(),
    floors: numFloors,
    floorsList: finalFloorsList,
    status: status || "Operational",
    maintenance: maintenance || "Routine maintenance up to date. All facilities operational.",
    country: country || "",
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, "buildings"), buildingData);

  return {
    id: docRef.id,
    ...buildingData
  };
};

export const getAllBuildings = async () => {
  try {
    const q = query(collection(db, "buildings"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const seeded = [];
      for (const b of SEED_BUILDINGS) {
        const added = await addDoc(collection(db, "buildings"), {
          ...b,
          createdAt: new Date().toISOString()
        });
        seeded.push({ id: added.id, ...b });
      }
      return seeded;
    }

    const buildings = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      buildings.push({
        id: docSnap.id,
        name: data.name || "Unnamed Building",
        orgId: data.orgId || "",
        orgName: data.orgName || "",
        floors: data.floors || (Array.isArray(data.floorsList) ? data.floorsList.length : 4),
        floorsList: Array.isArray(data.floorsList) && data.floorsList.length > 0
          ? data.floorsList
          : Array.from({ length: Number(data.floors) || 1 }, (_, i) => ({
              floorNo: String(i + 1),
              floorName: i === 0 ? "Ground Floor" : `Floor ${i + 1}`
            })),
        status: data.status || "Operational",
        maintenance: data.maintenance || "Routine maintenance up to date. All facilities operational.",
        country: data.country || "",
        createdAt: data.createdAt || ""
      });
    });

    buildings.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return buildings;
  } catch (error) {
    console.error("Error fetching buildings:", error);
    throw error;
  }
};

export const getBuildingsByOrg = async (orgId, orgName) => {
  const all = await getAllBuildings();
  const cleanOrgId = (orgId || "").trim();
  const cleanOrgName = (orgName || "").trim().toLowerCase();

  return all.filter((b) => {
    const bOrgId = (b.orgId || "").trim();
    const bOrgName = (b.orgName || "").trim().toLowerCase();

    if (cleanOrgId && bOrgId && bOrgId === cleanOrgId) return true;
    if (cleanOrgName && bOrgName && bOrgName === cleanOrgName) return true;
    return false;
  });
};

export const updateBuilding = async (buildingId, updateData) => {
  if (!buildingId) {
    throw new Error("Building ID is required for updating");
  }

  const buildingDocRef = doc(db, "buildings", buildingId);
  const cleanData = {
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  await updateDoc(buildingDocRef, cleanData);

  return {
    id: buildingId,
    ...cleanData
  };
};

export const deleteBuilding = async (buildingId) => {
  const docRef = doc(db, "buildings", buildingId);
  return deleteDoc(docRef);
};
