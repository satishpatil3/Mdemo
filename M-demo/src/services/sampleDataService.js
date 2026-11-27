import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export const SAMPLE_DATA = [
  {
    organization: {
      name: "Bharat Electronics Solutions",
      category: "Enterprise Software & AI",
      country: "India",
      streetAddress: "Fort House, 221 Dr. D.N. Road",
      addressLine2: "Industrial Tech Zone, Fort",
      city: "Mumbai",
      state: "Maharashtra",
      contactName: "Rajesh Sharma",
      contactEmail: "rajesh.sharma@bharatelectronics.local",
      phone: "9820145678",
      iconColor: "from-blue-500 to-indigo-600"
    },
    building: {
      name: "Bharat Innovation Tower A",
      country: "India",
      floors: 10,
      floorsList: [
        { floorNo: "1", floorName: "Ground Floor & Visitor Center" },
        { floorNo: "2", floorName: "Client Experience & Showcase" },
        { floorNo: "3", floorName: "Software Engineering Hub" },
        { floorNo: "4", floorName: "AI & Machine Learning Labs" },
        { floorNo: "5", floorName: "Cloud Computing Operations" },
        { floorNo: "6", floorName: "Big Data & Analytics Wing" },
        { floorNo: "7", floorName: "Agile Collaboration Zones" },
        { floorNo: "8", floorName: "Executive Conference Suites" },
        { floorNo: "9", floorName: "DevOps & Infrastructure NOC" },
        { floorNo: "10", floorName: "Leadership Boardroom & Sky Lounge" }
      ],
      status: "Operational",
      maintenance: "Annual fire safety & elevator certification passed. All facilities operational."
    }
  },
  {
    organization: {
      name: "Apex Cloud Innovations",
      category: "Cloud Infrastructure",
      country: "India",
      streetAddress: "Plot 44, Electronic City Phase 1",
      addressLine2: "Hosur Road",
      city: "Bengaluru",
      state: "Karnataka",
      contactName: "Priya Patel",
      contactEmail: "priya.patel@apexcloud.local",
      phone: "9845123456",
      iconColor: "from-emerald-500 to-teal-600"
    },
    building: {
      name: "Apex Cloud Hub Building 3",
      country: "India",
      floors: 8,
      floorsList: [
        { floorNo: "1", floorName: "Main Reception & Security" },
        { floorNo: "2", floorName: "Cloud Data Center Core" },
        { floorNo: "3", floorName: "DevOps & Cloud SRE Hub" },
        { floorNo: "4", floorName: "Solutions Architecture Wing" },
        { floorNo: "5", floorName: "Enterprise Migration Lab" },
        { floorNo: "6", floorName: "Scrum Pods & Innovation Bay" },
        { floorNo: "7", floorName: "Technical Training Center" },
        { floorNo: "8", floorName: "Cafeteria & Terrace Garden" }
      ],
      status: "Operational",
      maintenance: "Routine HVAC and server cooling facilities certified. Fully operational."
    }
  },
  {
    organization: {
      name: "Horizon Cyber Systems",
      category: "Telecom & Cyber Systems",
      country: "India",
      streetAddress: "Cyber Gateway, Hitech City",
      addressLine2: "Madhapur",
      city: "Hyderabad",
      state: "Telangana",
      contactName: "Amit Verma",
      contactEmail: "amit.verma@horizoncyber.local",
      phone: "9701234567",
      iconColor: "from-amber-500 to-orange-600"
    },
    building: {
      name: "Horizon Cyber Heights",
      country: "India",
      floors: 6,
      floorsList: [
        { floorNo: "1", floorName: "Visitor Lounge & Access Control" },
        { floorNo: "2", floorName: "Network Operations Center (NOC)" },
        { floorNo: "3", floorName: "Cyber Security Command Wing" },
        { floorNo: "4", floorName: "5G & Telecom Core Research" },
        { floorNo: "5", floorName: "Product Engineering Suites" },
        { floorNo: "6", floorName: "Executive Suites & Boardroom" }
      ],
      status: "Operational",
      maintenance: "High-voltage electrical substation certified. Routine maintenance up to date."
    }
  },
  {
    organization: {
      name: "Zenith AI Technologies",
      category: "Artificial Intelligence",
      country: "India",
      streetAddress: "Tower B, DLF Cyber City",
      addressLine2: "Building 10, Sector 24",
      city: "Gurugram",
      state: "Haryana",
      contactName: "Ananya Iyer",
      contactEmail: "ananya.iyer@zenithai.local",
      phone: "9910456789",
      iconColor: "from-purple-500 to-pink-600"
    },
    building: {
      name: "Zenith AI Innovation Lab",
      country: "India",
      floors: 5,
      floorsList: [
        { floorNo: "1", floorName: "Lobby & Digital Demo Pavilion" },
        { floorNo: "2", floorName: "Neural Networks & GPU Compute Lab" },
        { floorNo: "3", floorName: "Generative AI Research Hub" },
        { floorNo: "4", floorName: "Product Testing & QA Suites" },
        { floorNo: "5", floorName: "Executive Leadership & Boardroom" }
      ],
      status: "Operational",
      maintenance: "Clean energy solar arrays and server cooling operational at 99.8% efficiency."
    }
  }
];

export const resetDatabaseToIndianSampleData = async () => {
  try {
    // 1. Delete all existing organizations
    const orgsSnap = await getDocs(collection(db, "organizations"));
    const orgDeletePromises = [];
    orgsSnap.forEach((docSnap) => {
      orgDeletePromises.push(deleteDoc(doc(db, "organizations", docSnap.id)));
    });
    await Promise.all(orgDeletePromises);

    // 2. Delete all existing buildings
    const buildingsSnap = await getDocs(collection(db, "buildings"));
    const bldgDeletePromises = [];
    buildingsSnap.forEach((docSnap) => {
      bldgDeletePromises.push(deleteDoc(doc(db, "buildings", docSnap.id)));
    });
    await Promise.all(bldgDeletePromises);

    // 3. Add the 4 new Indian organizations and 1 building each
    const createdOrgs = [];
    const createdBuildings = [];

    for (const item of SAMPLE_DATA) {
      const orgData = {
        ...item.organization,
        createdAt: new Date().toISOString()
      };
      const orgDocRef = await addDoc(collection(db, "organizations"), orgData);
      const orgId = orgDocRef.id;
      createdOrgs.push({ id: orgId, ...orgData });

      const buildingData = {
        ...item.building,
        orgId: orgId,
        orgName: item.organization.name,
        createdAt: new Date().toISOString()
      };
      const bldgDocRef = await addDoc(collection(db, "buildings"), buildingData);
      createdBuildings.push({ id: bldgDocRef.id, ...buildingData });
    }

    localStorage.setItem("sample_data_version", "indian_4_v1");

    return { organizations: createdOrgs, buildings: createdBuildings };
  } catch (error) {
    console.error("Error resetting database to Indian sample data:", error);
    throw error;
  }
};

export const checkAndSyncSampleData = async () => {
  try {
    const currentVersion = localStorage.getItem("sample_data_version");
    const orgsSnap = await getDocs(collection(db, "organizations"));

    let hasOldData = false;
    orgsSnap.forEach((d) => {
      const data = d.data();
      if (
        data.name === "Acme Global Industries" ||
        data.name === "TechSphere Dynamics" ||
        data.name === "Nordic Wave Media" ||
        data.name === "Horizon Energy Labs"
      ) {
        hasOldData = true;
      }
    });

    // If collection is empty or has old legacy data, seed Indian sample data
    if (hasOldData || orgsSnap.empty) {
      console.log("Syncing database with 4 Indian organizations and buildings...");
      const result = await resetDatabaseToIndianSampleData();
      return { synced: true, ...result };
    }

    return { synced: false };
  } catch (error) {
    console.error("Error in checkAndSyncSampleData:", error);
    return { synced: false, error };
  }
};
