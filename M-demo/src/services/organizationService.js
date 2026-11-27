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
import {
  SAMPLE_DATA,
  resetDatabaseToIndianSampleData,
  checkAndSyncSampleData
} from "./sampleDataService";

// 4 Indian Organizations with addresses from different Indian states
const SEED_ORGANIZATIONS = SAMPLE_DATA.map((item) => item.organization);

export { resetDatabaseToIndianSampleData, checkAndSyncSampleData };

// Helper to pick dynamic gradient for new organizations
const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600"
];

export const createOrganization = async ({
  name,
  country = "",
  category = "Corporate",
  streetAddress = "",
  addressLine2 = "",
  city = "",
  state = "",
  contactName = "",
  contactEmail = "",
  phone = ""
}) => {
  const cleanName = name ? name.trim() : "";
  const cleanCountry = country ? country.trim() : "";

  if (!cleanName) {
    throw new Error("Organization name is required");
  }

  const randomGradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

  const newOrgData = {
    name: cleanName,
    country: cleanCountry,
    category: category.trim() || "Corporate",
    streetAddress: streetAddress.trim(),
    addressLine2: addressLine2.trim(),
    city: city.trim(),
    state: state.trim(),
    contactName: contactName.trim(),
    contactEmail: contactEmail.trim(),
    phone: phone.trim(),
    iconColor: randomGradient,
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, "organizations"), newOrgData);

  return {
    id: docRef.id,
    ...newOrgData
  };
};

export const updateOrganization = async (orgId, updateData) => {
  if (!orgId) {
    throw new Error("Organization ID is required for updating");
  }

  const orgDocRef = doc(db, "organizations", orgId);
  const cleanData = {
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  await updateDoc(orgDocRef, cleanData);

  return {
    id: orgId,
    ...cleanData
  };
};

export const getAllOrganizations = async () => {
  try {
    const q = query(collection(db, "organizations"));
    const querySnapshot = await getDocs(q);

    // If completely empty on first visit, seed sample organizations
    if (querySnapshot.empty) {
      const seeded = [];
      for (const org of SEED_ORGANIZATIONS) {
        const added = await addDoc(collection(db, "organizations"), {
          ...org,
          createdAt: new Date().toISOString()
        });
        seeded.push({ id: added.id, ...org });
      }
      return seeded;
    }

    const organizations = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      organizations.push({
        id: docSnap.id,
        name: data.name || "Unnamed Organization",
        country: data.country || "India",
        category: data.category || "Corporate",
        streetAddress: data.streetAddress || "",
        addressLine2: data.addressLine2 || "",
        city: data.city || "",
        state: data.state || "",
        contactName: data.contactName || "",
        contactEmail: data.contactEmail || "",
        phone: data.phone || "",
        iconColor: data.iconColor || "from-blue-500 to-indigo-600",
        createdAt: data.createdAt || "",
        updatedAt: data.updatedAt || ""
      });
    });

    // Sort descending by creation date or update date
    organizations.sort((a, b) => {
      const timeA = a.updatedAt || a.createdAt || "";
      const timeB = b.updatedAt || b.createdAt || "";
      return timeB.localeCompare(timeA);
    });

    return organizations;
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw error;
  }
};

export const deleteOrganization = async (orgId) => {
  if (!orgId) {
    throw new Error("Organization ID is required for deletion");
  }
  const orgDocRef = doc(db, "organizations", orgId);
  return deleteDoc(orgDocRef);
};
