// @ts-nocheck
// This app will no longer receive updates unless it breaks Remix build

import type { LinksFunction, V2_MetaFunction } from "@remix-run/node"
import { useEffect, useRef, useState } from "react"
import styles from "./main.css"
import vocab from "./vocab.json"

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Stastro | CCL Prep" },
    { name: "description", content: "Legacy app for Chinese CCL test takers." },
  ]
}

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: styles },
]

const Hero = ({ collapsed, collapseHero }) => {
	return (
		<div className={`hero ${collapsed && "collapsed"}`}>
			<div className="hero-description">
				<p className="hero-em">免费在线</p>
				<p className="hero-title">CCL VOCAB PRACTICE</p>
				<p>时间宝贵，本服务无需注册。点击下方按钮即可开始练习。</p>
				<p><button onClick={collapseHero} className="button">立刻开始 <span role="img" aria-label="Arrow Pointing Down">👇</span></button></p>
			</div>
			<div className="hero-image"></div>
		</div>
	)
}

const SelectVocabCate = ({ vocabCate, handleVocabCateChange }) => {

	return (
		<select className="button" name="vocab" value={vocabCate} onChange={handleVocabCateChange}>
			<option value="medical">医疗</option>
			<option value="legal">法律</option>
			<option value="education">教育</option>
			<option value="immigration">移民</option>
			<option value="welfare">Centrelink/社区服务</option>
			<option value="business">商业/金融/保险</option>
		</select>
	)
}

const BookmarkedOnlyCheckbox = ({ bookmarkedOnly, toggleBookmarkedOnly }) => {
	return (
		<label className="checkbox">
			仅查看已收藏
			<input
				className={bookmarkedOnly ? "checked" : ""}
				type="checkbox"
				checked={bookmarkedOnly}
				onChange={toggleBookmarkedOnly}
				name="bookmark" />
			<span className="checkmark" ></span>
		</label>
	)
}

const Workspace = ({ expanded, collapseHero }) => {
	const [vocabCate, _setVocabCate] = useState("medical")
	const [vocabStore, _setVocabStore] = useState({})
	const [vocabIndex, _setVocabIndex] = useState(0)
	const [bookmarkedOnly, setBookmarkedOnly] = useState(false)
	const [bookmarkedStore, setBookmarkedStore] = useState({})

	const vocabCateRef = useRef(vocabCate)
	const vocabStoreRef = useRef(vocabStore)
	const vocabIndexRef = useRef(vocabIndex)

	const autoRefSetter = (ref, origSetter) => data => {
		ref.current = data
		origSetter(data)
	}

	const setVocabCate = autoRefSetter(vocabCateRef, _setVocabCate)
	const setVocabStore = autoRefSetter(vocabStoreRef, _setVocabStore)
	const setVocabIndex = autoRefSetter(vocabIndexRef, _setVocabIndex)

	const toggleCurrentWordBookmarked = () => {
		const currentWord = displayedWords[vocabIndex]
		const origIndex = vocabStore[vocabCate].indexOf(currentWord)
		if (bookmarkedStore[vocabCate].indexOf(vocabIndex) === -1 && !bookmarkedOnly) {
			setBookmarkedStore({
				...bookmarkedStore,
				[vocabCate]: [...bookmarkedStore[vocabCate], origIndex]
			})
		} else {
			setBookmarkedStore({
				...bookmarkedStore,
				[vocabCate]: [...bookmarkedStore[vocabCate]].filter(index => index !== origIndex)
			})
		}
		recordBookmark()
	}

	const handleVocabCateChange = (e) => {
		const newCate = e.target.value
		if (!localStorage.getItem(newCate)) {
			setVocabIndex(0)
			localStorage.setItem(newCate, 0)
			recordProgress()
		}
		setVocabCate(newCate)
		if (bookmarkedOnly) {
			setVocabIndex(0)
		} else {
			setVocabIndex(parseInt(localStorage.getItem(newCate)))
		}
		recordProgress()
		collapseHero()
	}

	const nextWord = () => {
		if (vocabIndexRef.current < displayedWords.length - 1) {
			setVocabIndex(vocabIndexRef.current + 1)
		}
		recordProgress()
	}

	const prevWord = () => {
		if (vocabIndexRef.current > 0) {
			setVocabIndex(vocabIndexRef.current - 1)
		}
		recordProgress()
	}

	const recordProgress = () => {
		if (bookmarkedOnly) return
		localStorage.setItem("current", JSON.stringify({
			category: vocabCateRef.current,
			index: vocabIndexRef.current
		}))
		localStorage.setItem(vocabCateRef.current, vocabIndexRef.current)
	}

	const toggleBookmarkedOnly = () => {
		if (bookmarkedOnly) {
			setVocabIndex(parseInt(localStorage.getItem(vocabCate)))
		} else {
			setVocabIndex(0)
		}
		setBookmarkedOnly(!bookmarkedOnly)
	}

	const toggleWordHovered = (e) => {
		switch (e.type) {
			case "mouseover": setWordHovered(true); break
			case "mouseout": setWordHovered(false); break
			default: return
		}
	}

	const checkIfBookmarked = () => {
		if (bookmarkedOnly) return true
		if (bookmarkedStore[vocabCate]) {
			return bookmarkedStore[vocabCate].indexOf(vocabIndex) !== -1
		}
		return false
	}

	const recordBookmark = () => {
		if (bookmarkedOnly) return
		localStorage.setItem("bookmarked", JSON.stringify(bookmarkedStore))
	}

	const keySwitcher = (e) => {
		switch (e.keyCode) {
			case 37:
				prevWord()
				break
			case 39:
				nextWord()
				break
			default:
				return
		}
	}

	useEffect(() => {
		window.addEventListener("keydown", keySwitcher)
		setVocabStore(vocab)
	}, [])

	useEffect(() => {
		const currentProgress = localStorage.getItem("current")
		const currentBookmarkedStore = localStorage.getItem("bookmarked")
		if (currentProgress) {
			const parsed = JSON.parse(currentProgress)
			setVocabCate(parsed.category)
			setVocabIndex(parsed.index)
		} else {
			recordProgress()
		}
		if (currentBookmarkedStore) {
			const parsed = JSON.parse(currentBookmarkedStore)
			setBookmarkedStore(parsed)
		} else {
			setBookmarkedStore(Object.keys(vocabStore).reduce((cum, cur) => {
				return {
					...cum,
					[cur]: []
				}
			}, {}))
		}
	}, [vocabStore])

	let displayedWords = bookmarkedOnly
		? bookmarkedStore[vocabCate].map(index => vocabStore[vocabCate][index])
		: vocabStore[vocabCate] ? vocabStore[vocabCate].map(word => word) : []

	if (displayedWords.length === 0) {
		displayedWords.push("收藏中空空如也")
	}

	return (
		<div className={`workspace ${expanded && "expanded"}`}>
			<div className="workspace-status">
				<p>
					选择词库 <span role="img" aria-label="Arrow Pointing Right">👉</span>
					<SelectVocabCate vocabCate={vocabCate} handleVocabCateChange={handleVocabCateChange} />
					<BookmarkedOnlyCheckbox bookmarkedOnly={bookmarkedOnly} toggleBookmarkedOnly={toggleBookmarkedOnly} />
				</p>
			</div>
			<div className="workspace-word" onClick={toggleCurrentWordBookmarked} onMouseOver={toggleWordHovered} onMouseOut={toggleWordHovered}>
				<p className={checkIfBookmarked() ? "bookmarked" : ""}>
					{displayedWords[vocabIndex]}
				</p>
				<button className="button">{checkIfBookmarked() ? "取消收藏" : "收藏"}</button>
			</div>
			<div className="workspace-control">
				<div onClick={prevWord} className="control control-left"></div><p>{vocabIndex + 1} / {displayedWords.length}</p>
				<div onClick={nextWord} className="control control-right"></div>
			</div>
		</div >
	)
}

const App = () => {
	const [heroCollapsed, setHeroCollapsed] = useState(false)

	const collapseHero = () => {
		setHeroCollapsed(true)
	}

	return (
		<>
			<Hero collapsed={heroCollapsed} collapseHero={collapseHero} />
			<Workspace expanded={heroCollapsed} collapseHero={collapseHero} />
		</>
	)
}

export default App