import { useEffect, useMemo, useRef, useState } from "react"
import { fromEvent, tap } from "rxjs"

const LoadingToast = () => {
	const [sources, setSources] = useState<Record<string, boolean>>(Object.create(null))
	const loading = useMemo(() => {
		const status = Object.values(sources)
		if (status.length && status.some(v => v)) {
			return true
		}
		return false
	}, [sources])
	const bc = useRef(new BroadcastChannel("loading_sources"))

	useEffect(() => {
		const sub = fromEvent<MessageEvent>(bc.current, "message")
			.pipe(
				tap(({ data }) => {
					setSources(s => ({
						...s,
						[data.resource]: data.loading,
					}))
				})
			)
			.subscribe()
		return () => sub.unsubscribe()
	}, [])

	if (!loading) return null
	return <div className="absolute flex items-center gap-2 p-2 border border-solid rounded bottom-4 right-4 border-slate-200">
		{/* https://samherbert.net/svg-loaders/svg-loaders/puff.svg */}
		<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 44 44" stroke="#373c38">
			<g fill="none" fillRule="evenodd" strokeWidth="2">
				<circle cx="22" cy="22" r="1">
					<animate attributeName="r" begin="0s" dur="2s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite" />
					<animate attributeName="stroke-opacity" begin="0s" dur="2s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite" />
				</circle>
				<circle cx="22" cy="22" r="1">
					<animate attributeName="r" begin="-1s" dur="2s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite" />
					<animate attributeName="stroke-opacity" begin="-1s" dur="2s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite" />
				</circle>
			</g>
		</svg>
		<span className="text-[#373c38] text-sm leading-3 tracking-wider animate-pulse">
			LOADING...
		</span>
	</div>
}
export default LoadingToast