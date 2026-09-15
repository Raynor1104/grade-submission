<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
} from 'vue'
import {
  BookOpen,
  Info,
  LockKeyhole,
} from '@lucide/vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  resetAuthExpiredNotification,
} from '@/core/api/http-client'
import { ApiRequestError } from '@/core/api/types'
import { setAuthenticatedSession } from '@/core/auth/auth-session'
import { appEnv } from '@/core/config/env'

import { authenticate } from '../api/auth.api'
import LoginForm from '../components/LoginForm.vue'
import type { LoginRequest } from '../model/auth.types'
import { resolveSafeReturnTo } from '../model/return-to'

const route = useRoute()
const router = useRouter()
const isSubmitting = ref(false)
const loginError = ref<string | null>(null)
const sessionNoticeDismissed = ref(false)
let activeController: AbortController | null = null

const showSessionExpired = computed(() => (
  route.query.reason === 'expired'
  && !sessionNoticeDismissed.value
  && !loginError.value
))

function getSafeLoginError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 401 || error.status === 403) {
      return 'Invalid username or password.'
    }

    if (error.source === 'network' || error.status >= 500) {
      return 'Unable to sign in right now. Please try again.'
    }
  }

  return 'Login failed. Please try again.'
}

function clearLoginError(): void {
  loginError.value = null
  sessionNoticeDismissed.value = true
}

async function handleLogin(credentials: LoginRequest): Promise<void> {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  loginError.value = null
  sessionNoticeDismissed.value = true
  const controller = new AbortController()
  activeController = controller

  try {
    const token = await authenticate(credentials, controller.signal)

    if (controller.signal.aborted) {
      return
    }

    setAuthenticatedSession(token, credentials.username)
    resetAuthExpiredNotification()

    await router.replace(
      resolveSafeReturnTo(router, route.query.returnTo),
    )
  } catch (error) {
    if (!controller.signal.aborted) {
      loginError.value = getSafeLoginError(error)
    }
  } finally {
    if (activeController === controller) {
      activeController = null
      isSubmitting.value = false
    }
  }
}

onBeforeUnmount(() => {
  activeController?.abort()
  activeController = null
})
</script>

<template>
  <main class="login-page">
    <div
      class="login-page__decoration"
      aria-hidden="true"
    />

    <section
      class="login-brand"
      aria-labelledby="product-name"
    >
      <div class="login-brand__identity">
        <div class="login-brand__name-row">
          <BookOpen
            aria-hidden="true"
            :size="42"
            :stroke-width="1.8"
          />

          <h1 id="product-name">
            GRADE SUBMISSION SYSTEM
          </h1>
        </div>

        <div class="login-brand__subtitle">
          <span aria-hidden="true" />
          <p>Learning Management System</p>
          <span aria-hidden="true" />
        </div>
      </div>

      <div class="login-brand__hero">
        <h2>
          Submit grades more<br>
          accurately and more securely.
        </h2>

        <p>
          A safe and reliable system that faculty<br>
          and staff can use with confidence.
        </p>
      </div>
    </section>

    <section
      class="login-card"
      aria-labelledby="login-heading"
    >
      <header class="login-card__header">
        <div class="login-card__lock-badge">
          <LockKeyhole
            aria-hidden="true"
            :size="30"
            :stroke-width="1.7"
          />
        </div>

        <h2 id="login-heading">
          Login
        </h2>

        <p>Login</p>
        <span aria-hidden="true" />
      </header>

      <p
        v-if="showSessionExpired"
        class="login-card__session-notice"
        role="alert"
      >
        Your session has expired. Please log in again.
      </p>

      <LoginForm
        :submitting="isSubmitting"
        :server-error="loginError"
        @submit="handleLogin"
        @clear-error="clearLoginError"
      />

      <div
        v-if="appEnv.demoAuth.enabled"
        class="login-card__demo"
      >
        <Info
          aria-hidden="true"
          :size="22"
          :stroke-width="1.8"
        />

        <span>
          Demo account:
          <strong>{{ appEnv.demoAuth.username }} / {{ appEnv.demoAuth.password }}</strong>
        </span>
      </div>

      <footer class="login-card__footer">
        <LockKeyhole
          aria-hidden="true"
          :size="19"
          :stroke-width="1.7"
        />

        <span>Access restricted to authorized faculty and staff only</span>
      </footer>
    </section>
  </main>
</template>

<style scoped lang="scss">
.login-page {
  position: relative;
  display: grid;
  min-height: 100vh;
  min-height: 100dvh;
  grid-template-columns: minmax(0, 0.9fr) minmax(560px, 1.1fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 7rem);
  overflow-x: hidden;
  padding: clamp(2rem, 4vw, 4rem);
  background:
    radial-gradient(circle at 58% 7%, rgb(221 232 249 / 52%), transparent 25%),
    linear-gradient(130deg, #f9fbfe 0%, #f4f7fb 47%, #f9fbfe 100%);

  &__decoration {
    position: absolute;
    z-index: 0;
    bottom: -22vw;
    left: -15vw;
    width: 50vw;
    height: 48vw;
    transform: rotate(45deg);
    background:
      repeating-linear-gradient(
        90deg,
        rgb(35 83 153 / 7%) 0,
        rgb(35 83 153 / 7%) 1px,
        transparent 1px,
        transparent 5px
      );
    box-shadow: -5vw 5vw 0 rgb(17 69 148 / 88%);
    pointer-events: none;
  }
}

.login-brand,
.login-card {
  position: relative;
  z-index: 1;
}

.login-brand {
  align-self: stretch;
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.25rem 0 29vh;
  color: #0c3e8f;

  &__name-row {
    display: flex;
    align-items: center;
    gap: 1rem;

    h1 {
      margin: 0;
      font-size: clamp(1.35rem, 2vw, 2rem);
      font-weight: 760;
      letter-spacing: 0.015em;
      line-height: 1.15;
    }
  }

  &__subtitle {
    display: grid;
    grid-template-columns: minmax(2rem, 7rem) auto minmax(2rem, 5rem);
    align-items: center;
    gap: 1rem;
    margin-top: 1.25rem;
    color: #405273;

    span {
      height: 1px;
      background: #acbdd5;
    }

    p {
      margin: 0;
      white-space: nowrap;
      font-size: clamp(0.9rem, 1.25vw, 1.12rem);
    }
  }

  &__hero {
    max-width: 34rem;
    margin: auto 0 0 clamp(1.5rem, 6vw, 6rem);

    h2 {
      margin: 0 0 1.2rem;
      color: #111827;
      font-size: clamp(1.55rem, 2.4vw, 2.1rem);
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: #405273;
      font-size: clamp(1rem, 1.35vw, 1.2rem);
      line-height: 1.7;
    }
  }
}

.login-card {
  width: 100%;
  max-width: 720px;
  justify-self: center;
  padding: clamp(2rem, 4vw, 3.5rem);
  border: 1px solid rgb(221 228 238 / 86%);
  border-radius: 10px;
  background: rgb(255 255 255 / 96%);
  box-shadow:
    0 18px 45px rgb(34 56 91 / 10%),
    0 2px 8px rgb(34 56 91 / 8%);

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.8rem;

    h2 {
      margin: 1rem 0 0.4rem;
      color: #111827;
      font-size: 2rem;
      line-height: 1.1;
    }

    p {
      margin: 0;
      color: #405273;
      font-size: 1.05rem;
    }

    > span {
      width: 58px;
      height: 4px;
      margin-top: 0.8rem;
      border-radius: 99px;
      background: #0b4aba;
    }
  }

  &__lock-badge {
    display: grid;
    width: 70px;
    height: 70px;
    place-items: center;
    border-radius: 50%;
    background: linear-gradient(145deg, #edf4fd, #dce8f8);
    color: #0b4aba;
  }

  &__session-notice {
    margin: 0 0 1.25rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid #bcd5fb;
    border-radius: 6px;
    background: #eff6ff;
    color: #173f7a;
    font-size: 0.9rem;
  }

  &__demo {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1.25rem;
    padding: 1rem;
    border: 1px solid #b8d4fb;
    border-radius: 6px;
    background: #f5f9ff;
    color: #111827;
    font-size: 0.95rem;

    svg,
    strong {
      color: #0750c8;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 1.4rem;
    padding-top: 1.4rem;
    border-top: 1px solid #dbe3ee;
    color: #51627f;
    text-align: center;
    font-size: 0.9rem;
  }
}

@media (max-width: 1050px) {
  .login-page {
    grid-template-columns: minmax(260px, 0.7fr) minmax(480px, 1.3fr);
    gap: 2rem;
    padding: 2rem;
  }

  .login-brand {
    &__subtitle span:last-child {
      display: none;
    }

    &__subtitle {
      grid-template-columns: minmax(2rem, 5rem) auto;
    }

    &__hero {
      margin-left: 1rem;
    }
  }
}

@media (max-width: 900px) {
  .login-page {
    display: flex;
    min-height: 100dvh;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .login-page__decoration {
    display: none;
  }

  .login-brand {
    width: min(100%, 640px);
    align-self: center;
    padding: 0;

    &__identity {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &__name-row {
      justify-content: center;
      text-align: center;
    }

    &__subtitle {
      width: min(100%, 430px);
      grid-template-columns: minmax(2rem, 1fr) auto minmax(2rem, 1fr);

      span:last-child {
        display: block;
      }
    }

    &__hero {
      display: none;
    }
  }

  .login-card {
    max-width: 640px;
  }
}

@media (max-width: 520px) {
  .login-page {
    padding: 1rem;
  }

  .login-brand {
    &__name-row {
      gap: 0.65rem;

      svg {
        width: 32px;
        height: 32px;
      }

      h1 {
        font-size: 1.05rem;
      }
    }

    &__subtitle {
      gap: 0.7rem;
      margin-top: 0.75rem;

      p {
        font-size: 0.78rem;
      }
    }
  }

  .login-card {
    padding: 1.5rem 1.1rem;

    &__header {
      margin-bottom: 1.4rem;

      h2 {
        font-size: 1.65rem;
      }
    }

    &__lock-badge {
      width: 58px;
      height: 58px;
    }

    &__demo,
    &__footer {
      align-items: flex-start;
      text-align: left;
    }
  }
}
</style>
