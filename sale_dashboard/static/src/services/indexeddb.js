/** @odoo-module */

export const dbName = "sale_dashboard_db";
export const dashboardStore = "dashboardData";
export const chartStore = "chartData";

export async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 2); // Increased version for new stores
        request.onerror = () => reject("IndexedDB not supported or cannot open");
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = event => {
            const db = event.target.result;

            // Create dashboardData store if it doesn't exist
            if (!db.objectStoreNames.contains(dashboardStore)) {
                db.createObjectStore(dashboardStore);
            }

            // Create chartData store if it doesn't exist
            if (!db.objectStoreNames.contains(chartStore)) {
                db.createObjectStore(chartStore);
            }
        };
    });
}

export async function setCache(store, key, data) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([store], "readwrite");
            const objectStore = tx.objectStore(store);
            const request = objectStore.put(data, key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error("Error setting cache:", error);
        throw error;
    }
}

export async function getCache(store, key) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([store], "readonly");
            const objectStore = tx.objectStore(store);
            const request = objectStore.get(key);

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => reject("Error getting IndexedDB data");

            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error("Error getting cache:", error);
        return null;
    }
}

export async function clearCache(store) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([store], "readwrite");
            const objectStore = tx.objectStore(store);
            const request = objectStore.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error("Error clearing cache:", error);
        throw error;
    }
}

export async function deleteCache(store, key) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([store], "readwrite");
            const objectStore = tx.objectStore(store);
            const request = objectStore.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error("Error deleting cache:", error);
        throw error;
    }
}
