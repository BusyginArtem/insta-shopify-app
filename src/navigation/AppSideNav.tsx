import React, { ComponentProps } from 'react'

// ** Next imports
import { useRouter } from 'next/navigation'

// ** Constants
import { APP_ROUTES } from 'src/configs/constants'
// import Link, { LinkProps } from 'next/link'
// TODO will remove it later from package.json if it's unnecessary
// import { NavMenu } from '@shopify/app-bridge-react'
// import createApp from '@shopify/app-bridge'
// import { Redirect } from '@shopify/app-bridge/actions'
// import { ClientApplication } from '@shopify/app-bridge/client'

type Props = ComponentProps<'a'> & { children?: React.ReactNode; rel?: string }

// let app: ClientApplication | null

// if (typeof window !== 'undefined') {
//   app = createApp({
//     apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
//     host: (window as any).shopify.config.host!
//   })
// }

// const redirectTo = (url: string) => {
//   if (app) {
//     const redirect = Redirect.create(app)
//     redirect.dispatch(Redirect.Action.APP, url)
//   }
// }

function ShopifyNavMenuLink({ href, onClick, ...props }: Props) {
  // function ShopifyNavMenuLink({ href, ...props }: LinkProps & { children?: React.ReactNode; rel?: string }) {
  const router = useRouter()
  // console.log('%c app', 'color: green; font-weight: bold;', app)

  return (
    <a
      href={href?.toString()}
      // active={{ value: router.pathname === href }}
      onClick={e => {
        e.preventDefault()
        // router.replace(href!.toString())
        router.push(href!.toString())
        history.pushState(null, '', href?.toString())
        // onClick?.(e)
        // ;(window as any).navigation.navigate(href!.toString(), {
        //   history: 'push'
        // })

        // redirectTo(href!.toString())
      }}
      {...props}
    />
  )
}

export default function AppSideNav() {
  return (
    // <NavMenu>
    <ui-nav-menu>
      <ShopifyNavMenuLink href={APP_ROUTES.MAIN} rel='home' />
      <ShopifyNavMenuLink href={APP_ROUTES.PRODUCTS}>Products</ShopifyNavMenuLink>
      <ShopifyNavMenuLink href={'/about'}>About</ShopifyNavMenuLink>
    </ui-nav-menu>
    // </NavMenu>
  )
}
