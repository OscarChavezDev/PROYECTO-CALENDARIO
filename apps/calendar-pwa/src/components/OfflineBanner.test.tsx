import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineBanner } from './OfflineBanner'

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { value, configurable: true })
}

afterEach(() => setOnline(true))

describe('OfflineBanner', () => {
  it('no muestra nada cuando hay conexión', () => {
    setOnline(true)
    const { container } = render(<OfflineBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra el aviso cuando no hay conexión', () => {
    setOnline(false)
    render(<OfflineBanner />)
    expect(screen.getByRole('status')).toHaveTextContent(/sin conexión/i)
  })
})
