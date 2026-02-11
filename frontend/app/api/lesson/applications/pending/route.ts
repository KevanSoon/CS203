import axios from "axios";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET() {
    //get jwt from cookies
    const token = (await cookies()).get("jwt")?.value;

    //throw error
    if (!token) {
        return Response.json({error: "Unauthorized"},{status: 401});
    }

    try {
        const {data} = await axios.get(`${BACKEND_URL}/api/lesson/applications/pending`, {
            headers: {Authorization: `Bearer ${token}`},
        });

        return Response.json(data);
    } catch (err: any) {
        console.error("Backend request failed:", err.message);
        const status = err.response?.status || 500;
        return Response.json({error: "Failed to fetch lessons from backend"}, {status});
    }
}
