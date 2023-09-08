import { cssBundleHref } from "@remix-run/css-bundle"
import type { LinksFunction, V2_MetaFunction } from "@remix-run/node"
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react"
import tailwindStyles from "~/styles/tailwind.css"

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Stastro" },
    { name: "description", content: "Personal site." },
  ]
}

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
	{ rel: "stylesheet", href: tailwindStyles },
]

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}