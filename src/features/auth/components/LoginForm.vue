<script setup lang="ts">
import {
  computed,
  nextTick,
  reactive,
  ref,
} from 'vue'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from '@lucide/vue'

import type { LoginRequest } from '../model/auth.types'

const props = withDefaults(
  defineProps<{
    submitting?: boolean
    serverError?: string | null
  }>(),
  {
    submitting: false,
    serverError: null,
  },
)

const emit = defineEmits<{
  submit: [credentials: LoginRequest]
  'clear-error': []
}>()

const username = ref('')
const password = ref('')
const passwordVisible = ref(false)
const localSubmitGuard = ref(false)
const usernameInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)
const fieldErrors = reactive({
  username: '',
  password: '',
})

const isBusy = computed(() => props.submitting || localSubmitGuard.value)
const validationAnnouncement = computed(() => [
  fieldErrors.username,
  fieldErrors.password,
].filter(Boolean).join(' '))

function handleUsernameInput(): void {
  fieldErrors.username = ''
  emit('clear-error')
}

function handlePasswordInput(): void {
  fieldErrors.password = ''
  emit('clear-error')
}

async function focusFirstInvalidField(): Promise<void> {
  await nextTick()

  if (fieldErrors.username) {
    usernameInput.value?.focus()
    return
  }

  passwordInput.value?.focus()
}

async function handleSubmit(): Promise<void> {
  if (isBusy.value) {
    return
  }

  const normalizedUsername = username.value.trim()
  fieldErrors.username = normalizedUsername ? '' : 'Username is required.'
  fieldErrors.password = password.value.length > 0 ? '' : 'Password is required.'

  if (fieldErrors.username || fieldErrors.password) {
    await focusFirstInvalidField()
    return
  }

  localSubmitGuard.value = true
  emit('submit', {
    username: normalizedUsername,
    password: password.value,
  })

  await nextTick()
  localSubmitGuard.value = false
}
</script>

<template>
  <form
    class="login-form"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <p
      v-if="validationAnnouncement"
      class="login-form__sr-only"
      role="alert"
    >
      {{ validationAnnouncement }}
    </p>

    <div class="login-form__field">
      <label for="login-username">
        Username
      </label>

      <div
        class="login-form__control"
        :class="{ 'login-form__control--error': fieldErrors.username }"
      >
        <UserRound
          aria-hidden="true"
          :size="21"
          :stroke-width="1.7"
        />

        <input
          id="login-username"
          ref="usernameInput"
          v-model="username"
          name="username"
          type="text"
          autocomplete="username"
          autocapitalize="none"
          :spellcheck="false"
          placeholder="Enter your username"
          :aria-invalid="fieldErrors.username ? 'true' : undefined"
          :aria-describedby="fieldErrors.username ? 'login-username-error' : undefined"
          @input="handleUsernameInput"
        >
      </div>

      <p
        v-if="fieldErrors.username"
        id="login-username-error"
        class="login-form__field-error"
      >
        {{ fieldErrors.username }}
      </p>
    </div>

    <div class="login-form__field">
      <label for="login-password">
        Password
      </label>

      <div
        class="login-form__control login-form__control--password"
        :class="{ 'login-form__control--error': fieldErrors.password }"
      >
        <LockKeyhole
          aria-hidden="true"
          :size="20"
          :stroke-width="1.7"
        />

        <input
          id="login-password"
          ref="passwordInput"
          v-model="password"
          name="password"
          :type="passwordVisible ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="Enter your password"
          :aria-invalid="fieldErrors.password ? 'true' : undefined"
          :aria-describedby="fieldErrors.password ? 'login-password-error' : undefined"
          @input="handlePasswordInput"
        >

        <button
          type="button"
          class="login-form__password-toggle"
          :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
          :title="passwordVisible ? 'Hide password' : 'Show password'"
          @click="passwordVisible = !passwordVisible"
        >
          <EyeOff
            v-if="passwordVisible"
            aria-hidden="true"
            :size="21"
            :stroke-width="1.7"
          />

          <Eye
            v-else
            aria-hidden="true"
            :size="21"
            :stroke-width="1.7"
          />
        </button>
      </div>

      <p
        v-if="fieldErrors.password"
        id="login-password-error"
        class="login-form__field-error"
      >
        {{ fieldErrors.password }}
      </p>
    </div>

    <p
      v-if="serverError"
      class="login-form__server-error"
      role="alert"
    >
      {{ serverError }}
    </p>

    <button
      type="submit"
      class="login-form__submit"
      :disabled="isBusy"
      :aria-busy="isBusy ? 'true' : undefined"
    >
      {{ isBusy ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>

<style scoped lang="scss">
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  &__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;

    label {
      color: #111827;
      font-size: 1rem;
      font-weight: 650;
    }
  }

  &__control {
    display: flex;
    min-height: 60px;
    align-items: center;
    gap: 0.85rem;
    padding: 0 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #fff;
    color: #7182a2;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;

    &:focus-within {
      border-color: #0b4aba;
      box-shadow: 0 0 0 3px rgb(11 74 186 / 14%);
    }

    &--error {
      border-color: var(--color-danger);
    }

    input {
      min-width: 0;
      flex: 1;
      border: 0;
      outline: 0;
      background: transparent;
      color: #172033;
      font: inherit;
      font-size: 1rem;

      &::placeholder {
        color: #7182a2;
        opacity: 1;
      }
    }
  }

  &__password-toggle {
    display: inline-grid;
    width: 44px;
    min-width: 44px;
    height: 44px;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #7182a2;
    cursor: pointer;

    &:hover {
      background: #eef4fd;
      color: #0b4aba;
    }

    &:focus-visible {
      outline: 3px solid rgb(11 74 186 / 25%);
      outline-offset: 1px;
    }
  }

  &__field-error,
  &__server-error {
    margin: 0;
    color: var(--color-danger);
    font-size: 0.875rem;
  }

  &__server-error {
    margin-top: -0.5rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--color-danger-border);
    border-radius: 6px;
    background: var(--color-danger-light);
  }

  &__submit {
    min-height: 60px;
    margin-top: 0.1rem;
    border: 0;
    border-radius: 6px;
    background: linear-gradient(90deg, #0d43a0 0%, #003999 100%);
    box-shadow: 0 7px 16px rgb(5 58 151 / 16%);
    color: #fff;
    font: inherit;
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      filter 150ms ease,
      transform 150ms ease,
      opacity 150ms ease;

    &:hover:not(:disabled) {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 3px solid rgb(11 74 186 / 30%);
      outline-offset: 3px;
    }

    &:disabled {
      cursor: wait;
      opacity: 0.68;
    }
  }
}

@media (max-width: 640px) {
  .login-form {
    gap: 1.2rem;

    &__control,
    &__submit {
      min-height: 54px;
    }
  }
}
</style>
