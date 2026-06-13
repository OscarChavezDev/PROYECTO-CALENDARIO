import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReminderPicker } from './ReminderPicker'

function ControlledPicker() {
  const [offsets, setOffsets] = useState<number[]>([])
  return (
    <>
      <ReminderPicker value={offsets} onChange={setOffsets} />
      <output data-testid="value">{offsets.join(',')}</output>
    </>
  )
}

describe('ReminderPicker', () => {
  it('muestra las 6 opciones de tiempo', () => {
    render(<ReminderPicker value={[]} onChange={() => {}} />)
    expect(screen.getByLabelText('Al inicio exacto')).toBeInTheDocument()
    expect(screen.getByLabelText('10 minutos antes')).toBeInTheDocument()
    expect(screen.getByLabelText('15 minutos antes')).toBeInTheDocument()
    expect(screen.getByLabelText('20 minutos antes')).toBeInTheDocument()
    expect(screen.getByLabelText('30 minutos antes')).toBeInTheDocument()
    expect(screen.getByLabelText('1 hora antes')).toBeInTheDocument()
  })

  it('marca los offsets recibidos en value', () => {
    render(<ReminderPicker value={[15]} onChange={() => {}} />)
    expect(screen.getByLabelText('15 minutos antes')).toBeChecked()
    expect(screen.getByLabelText('30 minutos antes')).not.toBeChecked()
  })

  it('selecciona y deselecciona (ordenado)', () => {
    render(<ControlledPicker />)
    fireEvent.click(screen.getByLabelText('30 minutos antes'))
    fireEvent.click(screen.getByLabelText('10 minutos antes'))
    expect(screen.getByTestId('value')).toHaveTextContent('10,30')

    fireEvent.click(screen.getByLabelText('30 minutos antes'))
    expect(screen.getByTestId('value')).toHaveTextContent('10')
  })
})
