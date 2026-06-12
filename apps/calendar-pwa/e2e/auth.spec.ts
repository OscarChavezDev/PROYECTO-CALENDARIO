import { expect, test } from '@playwright/test'

test('navega de login a registro', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()

  await page.getByRole('link', { name: /regístrate/i }).click()
  await expect(page).toHaveURL(/\/register$/)
  await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible()
})

test('/app redirige a /login sin sesión', async ({ page }) => {
  await page.goto('/app')
  await expect(page).toHaveURL(/\/login$/)
})
