import { config } from "../config";
import { cooldownsToBeMigrated } from "../types";


export async function workWithCoolDowns() {
    const response = await fetch(
        `${config.value.DEV_URL}/api/verificationservice/create-new-verification-cooldowns`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.value.TOKEN
            },
            body: JSON.stringify(cooldownsToBeMigrated)
        }
    )
    return ((await response.json()) ?? null)
}