import dns from "dns";
import { promisify } from "util";
import mongoose from "mongoose";
import { DB_Name } from "../constant.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

const buildMongoUri = async () => {
    const baseUri = process.env.MONGO_URI;
    if (!baseUri) {
        throw new Error("MONGO_URI is missing in .env");
    }

    // Prefer a non-SRV URI when Windows DNS breaks mongodb+srv querySrv
    if (baseUri.startsWith("mongodb+srv://")) {
        const parsed = new URL(baseUri);
        const host = parsed.hostname;
        const username = decodeURIComponent(parsed.username);
        const password = decodeURIComponent(parsed.password);

        const srvRecords = await resolveSrv(`_mongodb._tcp.${host}`);
        const txtRecords = await resolveTxt(host).catch(() => []);
        const txtOptions = (txtRecords.flat?.() || txtRecords)
            .flat()
            .join("")
            .split("&")
            .filter(Boolean);

        const hosts = srvRecords
            .map((record) => `${record.name}:${record.port}`)
            .join(",");

        const params = new URLSearchParams(parsed.search);
        for (const option of txtOptions) {
            const [key, value] = option.split("=");
            if (key && value && !params.has(key)) {
                params.set(key, value);
            }
        }

        if (!params.has("ssl") && !params.has("tls")) {
            params.set("tls", "true");
        }
        if (!params.has("authSource")) {
            params.set("authSource", "admin");
        }
        if (!params.has("retryWrites")) {
            params.set("retryWrites", "true");
        }
        if (!params.has("w")) {
            params.set("w", "majority");
        }

        const dbName = parsed.pathname.replace(/^\//, "") || DB_Name;
        return `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hosts}/${dbName}?${params.toString()}`;
    }

    try {
        const parsed = new URL(baseUri);
        if (!parsed.pathname || parsed.pathname === "/") {
            parsed.pathname = `/${DB_Name}`;
        }
        return parsed.toString();
    } catch {
        if (baseUri.includes("?")) {
            const [hostPart, query] = baseUri.split("?");
            return `${hostPart.replace(/\/$/, "")}/${DB_Name}?${query}`;
        }
        return `${baseUri.replace(/\/$/, "")}/${DB_Name}`;
    }
};

const connectDB = async () => {
    try {
        const uri = await buildMongoUri();
        const connectionInstance = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
            family: 4,
        });
        console.log(`Mongodb connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Mongodb connection failed", error);
        process.exit(1);
    }
};

export default connectDB;
