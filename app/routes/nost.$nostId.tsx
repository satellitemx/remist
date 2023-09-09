import type { ActionFunction, LinksFunction, LoaderArgs, V2_MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import * as cheerio from "cheerio"
import { useEffect, useRef } from "react"
import { debounceTime, distinct, filter, fromEvent, map, switchMap, tap } from "rxjs"
import { fromFetch } from "rxjs/fetch"
import LoadingToast from "~/components/loading-toast"
import { nostIdCookie } from "~/cookies.server"
import { db } from "~/lib/firebase.server"
import type { NostDoc } from "~/models/nost.server"
import nostStyles from "~/styles/nost.css"

export const loader = async (args: LoaderArgs) => {
	const nostId = args.params.nostId
	if (!nostId) {
		return redirect("/nost")
	}

	const doc = await db.collection("nost").doc(nostId).get()
	const data = doc.data() as NostDoc | undefined

	const content = data?.content || ""
	const views = (data?.views || 0) + 1
	const description = cheerio.load(content).text().slice(0, 200)

	return json({
		nostId, content, views, description,
		headers: {
			"Set-Cookie": await nostIdCookie.serialize(nostId)
		}
	})
}

export const action: ActionFunction = async (args) => {
	const nostId = args.params.nostId
	if (!nostId) {
		return new Response("No Nost address.", { status: 400 })
	}

	const payload = await args.request.formData()
	const content = payload.get("content")

	if (content) {
		try {
			await db.collection("nost").doc(nostId).set({
				content,
			}, { mergeFields: ["content"] })
			return new Response("Saved nost", { status: 200 })
		} catch (e) {
			return new Response("Failed to save nost", { status: 500 })
		}
	} else {
		return new Response("No content", { status: 400 })
	}
}

export const links: LinksFunction = () => ([
	{ rel: "stylesheet", href: nostStyles }
])

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => ([
	{ title: `${data?.nostId} Nost` },
	{ name: "description", content: data?.description }
])

export default function NostPage() {
	const { content, nostId } = useLoaderData<typeof loader>()
	const editorRef = useRef<HTMLDivElement>(null)
	const bc = useRef(new BroadcastChannel("loading_sources"))

	useEffect(() => {
		const sub = fromEvent<InputEvent>(editorRef.current!, "input")
			.pipe(
				debounceTime(500),
				distinct(),
				filter(event => event.target !== null),
				map(event => event.target as HTMLDivElement),
				map(target => target.innerHTML),
				tap(() => {
					bc.current.postMessage({ resource: nostId, loading: true })
				}),
				switchMap(content => {
					const form = new FormData()
					form.set("content", content)
					return fromFetch(`/nost/${nostId}`, {
						method: "POST",
						body: form,
					})
				}),
				tap(res => {
					if (res.ok) {
						bc.current.postMessage({ resource: nostId, loading: false })
					}
				}),
			)
			.subscribe()

		return () => sub.unsubscribe()
	}, [nostId])

	return <>
		<div
			ref={editorRef}
			className="p-4 w-[calc(100%-2rem)] max-w-[850px] rounded focus:outline-none mx-auto bg-white border border-solid border-slate-200 my-4 min-h-[calc(100vh-2rem)]"
			contentEditable
			dangerouslySetInnerHTML={{
				__html: content
			}}
		/>
		<LoadingToast />
	</>
}