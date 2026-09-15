import {
  createRouter,
  createWebHistory,
  type NavigationGuard,
  type Router,
} from 'vue-router'

import { authSession } from '@/core/auth/auth-session'
import { resolveSafeReturnTo } from '@/features/auth/model/return-to'

import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export function createAuthGuard(routerInstance: Router): NavigationGuard {
  return (to) => {
    const requiresAuth = to.matched
      .some(record => record.meta.requiresAuth === true)

    if (requiresAuth && !authSession.isAuthenticated) {
      return {
        name: 'login',
        query: { returnTo: to.fullPath },
        replace: true,
      }
    }

    if (to.name === 'login' && authSession.isAuthenticated) {
      const destination = routerInstance.resolve(
        resolveSafeReturnTo(routerInstance, to.query.returnTo),
      )

      return {
        path: destination.path,
        query: destination.query,
        hash: destination.hash,
        replace: true,
      }
    }

    return true
  }
}

router.beforeEach(createAuthGuard(router))

export default router
