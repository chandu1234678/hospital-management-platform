/**
 * Tests for invoiceGenerator utility
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock window.print and document.body since we're in jsdom
const mockPrint = vi.fn()
const mockDoc = { open: vi.fn(), write: vi.fn(), close: vi.fn() }
const mockIframe = {
  style: { cssText: '' },
  contentDocument: mockDoc,
  contentWindow: { document: mockDoc, print: mockPrint, focus: vi.fn() },
  remove: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
  vi.spyOn(document, 'createElement').mockReturnValue(mockIframe)
})

describe('invoiceGenerator', () => {
  it('module exports a generateInvoice function', async () => {
    const mod = await import('../utils/invoiceGenerator.js')
    expect(typeof mod.generateInvoice).toBe('function')
  })

  it('generateInvoice calls document.createElement with iframe', async () => {
    const { generateInvoice } = await import('../utils/invoiceGenerator.js')
    const bill = {
      invoiceId: 'BILL-001', date: '14 Mar 2026', desc: 'Consultation',
      amount: 1500, status: 'Paid', paidOn: '14 Mar 2026',
    }
    const patient = { name: 'Arjun Mehta', email: 'arjun@deepthi.com' }
    generateInvoice(bill, patient)
    expect(document.createElement).toHaveBeenCalledWith('iframe')
  })
})
