import { createId } from "@paralleldrive/cuid2"
import type { LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { nostIdCookie } from "~/cookies.server"
import { db } from "~/lib/firebase.server"

export const loader = async (args: LoaderArgs) => {
	const nostIdCookieValue = args.request.headers.get("Cookie")
	const nostId = await nostIdCookie.parse(nostIdCookieValue)

	console.log("Nost ID", nostId)

	if (typeof nostId === "string" && nostId.length > 0) {
		return redirect(`/nost/${nostId}`)
	}

	while (true) {
		const tryId = createId()
		const doc = await db.collection("nost").doc(tryId).get()
		if (!doc.exists) {
			return redirect(`/nost/${tryId}`)
		}
	}
}

export default function NostIndex() {
	console.log("Nost Index")
	useLoaderData<typeof loader>()
	return null
}