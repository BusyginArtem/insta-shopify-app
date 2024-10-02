import { ComponentProps } from 'react'

// ** Next imports
import { useRouter } from 'next/router'

// ** Constants
import { APP_ROUTES } from 'src/configs/constants'

type Props = ComponentProps<'a'> & { children?: React.ReactNode; rel?: string }

function ShopifyNavMenuLink({ href, onClick, ...props }: Props) {
  const router = useRouter()

  return (
    <a
      href={href}
      onClick={e => {
        e.preventDefault()
        history.pushState(null, '', href)
        router.push(href!)
        // onClick?.(e)
      }}
      {...props}
    />
  )
}

export default function AppSideNav() {
  return (
    <ui-nav-menu>
      <ShopifyNavMenuLink href={APP_ROUTES.MAIN} rel='home' />
      <ShopifyNavMenuLink href={APP_ROUTES.PRODUCTS}>Products</ShopifyNavMenuLink>
      <ShopifyNavMenuLink href={'/about'}>About</ShopifyNavMenuLink>
    </ui-nav-menu>
  )
}
