import { expect, test } from '@playwright/test'

test('la pantalla inicial carga y navega a login', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /organizador de calendario inteligente/i }),
  ).toBeVisible()

  await page.getByRole('link', { name: /iniciar sesión/i }).click()
  await expect(page).toHaveURL(/\/login$/)
})
