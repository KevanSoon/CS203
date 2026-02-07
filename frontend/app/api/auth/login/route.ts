import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: Request) {
    const body = await req.json();
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`,body);
    //retrieve jwt cookie from Spring Boot      
    const cookie = response.headers["set-cookie"];

    //set jwt cookie in browser and return user info
    return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": cookie?.[0] || "",
        }
    });

}