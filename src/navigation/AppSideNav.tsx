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
        router.push(href?.toString()!)
        onClick?.(e)
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
      {/* <Link href={'/about'}>About</Link> */}
    </ui-nav-menu>
  )
}