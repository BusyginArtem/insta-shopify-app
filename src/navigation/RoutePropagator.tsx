import React, { useEffect } from 'react'
import Router, { useRouter } from 'next/router'
import {
  // Provider,
  // Context as AppBridgeContext,
  // RoutePropagator as ShopifyRoutePropagator,
  // useRoutePropagation,
  useAppBridge
} from '@shopify/app-bridge-react'
// import { Provider } from '@shopify/app-bridge'
// import {Provider} from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions'

const RoutePropagator = () => {
  const router = useRouter()
  const { route } = router
  // const appBridge = React.useContext(AppBridgeContext)
  const appBridge = useAppBridge()
  console.log('%c appBridge', 'color: green; font-weight: bold;', appBridge)
  // Subscribe to appBridge changes - captures appBridge urls
  // and sends them to Next.js router. Use useEffect hook to
  // load once when component mounted
  useEffect(() => {
    // appBridge.subscribe(Redirect.Action.APP, ({ path }) => {
    //   Router.push(path)
    // })
  }, [])

  return appBridge && route ? <div /> /** <ShopifyRoutePropagator location={route} app={appBridge} /> */ : null
}

export default RoutePropagator
