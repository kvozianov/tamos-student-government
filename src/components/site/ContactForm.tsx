'use client'

import clsx from 'clsx'
import { useActionState, useState } from 'react'

import { sendMessage } from '@/app/(frontend)/contact/actions'
import { MESSAGE_TOPICS, type ContactState } from '@/lib/contact'

const field = 'mt-2 block w-full border border-rule bg-paper px-4 py-3 text-[16px] text-ink transition-colors focus:border-navy-700 focus:outline-none aria-invalid:border-brand-red'

/** Форма обращения. Работает и без JavaScript: это обычная форма с серверным действием. */
export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: 'idle' })
  const [startedAt] = useState(() => Date.now())
  const errors = state.errors ?? {}
  const v = state.values

  if (state.status === 'ok') {
    return (
      <div role="status" className="border-t-[3px] border-navy-700 bg-mist p-8 md:p-10">
        <p className="label-wide-sm text-navy-700">Сообщение отправлено</p>
        <p className="mt-4 font-serif text-[30px] leading-tight">Спасибо! Администрация ответит на указанную почту в течение недели.</p>
      </div>
    )
  }

  return (
    <form action={action} noValidate className="space-y-6" aria-describedby={errors.form ? 'form-error' : undefined}>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Сайт
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Имя" error={errors.name}>
          <input id="name" name="name" required autoComplete="name" defaultValue={v?.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} className={field} />
        </Field>
        <Field id="email" label="Почта для ответа" error={errors.email}>
          <input id="email" name="email" type="email" required autoComplete="email" defaultValue={v?.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className={field} />
        </Field>
        <Field id="grade" label="Класс (необязательно)">
          <input id="grade" name="grade" defaultValue={v?.grade} placeholder="10B" className={field} />
        </Field>
        <Field id="topic" label="Раздел">
          <select id="topic" name="topic" defaultValue={v?.topic ?? 'question'} className={field}>
            {Object.entries(MESSAGE_TOPICS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field id="subject" label="Тема" error={errors.subject}>
        <input id="subject" name="subject" required maxLength={140} defaultValue={v?.subject} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'subject-error' : undefined} className={field} />
      </Field>
      <Field id="message" label="Сообщение" error={errors.message}>
        <textarea id="message" name="message" required rows={6} maxLength={4000} defaultValue={v?.message} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} className={clsx(field, 'resize-y')} />
      </Field>

      {errors.form ? (
        <p id="form-error" role="alert" className="text-[15px] text-brand-red">
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={pending} className="label-wide bg-navy-700 px-8 py-4 text-white transition-colors hover:bg-navy-900 disabled:opacity-60">
          {pending ? 'Отправляем…' : 'Отправить'}
        </button>
        <p className="text-[14px] text-muted">Сообщение увидят только президент и вице-президент.</p>
      </div>
    </form>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label-wide-sm text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[14px] text-brand-red">
          {error}
        </p>
      ) : null}
    </div>
  )
}
