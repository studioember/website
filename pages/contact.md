---
title: Contact
title_hidden: false
description: Say hi 👋
date: "git Last Modified"
date_hidden: true
layout: layouts/base.njk
---

Have questions about your infrastructure? Let’s talk.
We work with small teams to clarify architecture, reduce unnecessary complexity, and plan practical improvements. Even if you’re still exploring options, we’re happy to help you think through the right path forward.

---

<form
  action="https://formspree.io/f/xlgwwkgg"
  method="POST"
  target="_top"
  class="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
>
  <!-- Header -->
  <div class="mb-6">
    <h2 class="text-xl font-semibold tracking-tight text-slate-900">Contact</h2>
    <p class="mt-1 text-sm leading-6 text-slate-600">
      Send a message and we’ll get back to you.
    </p>
  </div>

  <div class="space-y-5">
    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-slate-900">Name</label>
      <div class="mt-2">
        <input
          id="name"
          name="name"
          type="text"
          autocomplete="name"
          placeholder="Your name"
          class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
        />
      </div>
    </div>

    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-slate-900">Email</label>
      <div class="mt-2">
        <input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          placeholder="you@company.com"
          class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
        />
      </div>
    </div>

    <!-- Message -->
    <div>
      <label for="message" class="block text-sm font-medium text-slate-900">Message</label>
      <div class="mt-2">
        <textarea
          id="message"
          name="message"
          rows="6"
          placeholder="How can we help?"
          class="block w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
        ></textarea>
      </div>
      <p class="mt-2 text-xs leading-5 text-slate-500">We usually respond within 1–2 business days.</p>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-2">
      <button
        type="submit"
        class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/20 active:translate-y-px"
      >
        Send
      </button>
    </div>
  </div>
</form>