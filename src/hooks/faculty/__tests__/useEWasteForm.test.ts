import { renderHook, act, waitFor } from '@testing-library/react';
import { useEWasteForm } from '../useEWasteForm';

// 1. I-mock ang Supabase Client para hindi mag-trigger ng totoong API requests
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', user_metadata: { full_name: 'Juan Dela Cruz' } } },
        error: null,
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'work-order-123' }, error: null }),
    }),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/photo.jpg' } }),
      }),
    },
  },
}));

// Mock window.alert para hindi mag-error kapag tinawag ng hook
window.alert = jest.fn();

describe('useEWasteForm Hook Tests', () => {

  // TEST 1: Initial State Checking
  it('dapat may tamang default initial states', async () => {
    const { result } = renderHook(() => useEWasteForm());

    // Hihintayin na matapos ang background fetchLedger sa useEffect
    await waitFor(() => {
      expect(result.current.formState.itemName).toBe('');
    });

    expect(result.current.departmentCode).toBe('CICS');
    expect(result.current.formState.category).toBe('IT Equipment');
    expect(result.current.formState.equipmentItems).toHaveLength(1); 
    expect(result.current.formState.submitError).toBeNull();
  });

  // TEST 2: State Updates / Setters
  it('dapat mabago ang itemName kapag ginamit ang setItemName', async () => {
    const { result } = renderHook(() => useEWasteForm());

    await waitFor(() => {
      expect(result.current.formState.itemName).toBe('');
    });

    act(() => {
      result.current.setters.setItemName('Old Computer Monitors Batch');
    });

    expect(result.current.formState.itemName).toBe('Old Computer Monitors Batch');
  });

  // TEST 3: Array Manipulations (Add Row)
  it('dapat makapagdagdag ng bagong row sa equipment items', async () => {
    const { result } = renderHook(() => useEWasteForm());

    await waitFor(() => {
      expect(result.current.formState.itemName).toBe('');
    });

    act(() => {
      result.current.actions.addEquipmentRow();
    });

    expect(result.current.formState.equipmentItems).toHaveLength(2);
  });

  // TEST 4: Array Manipulations (Remove Row)
  it('dapat makapagbawas ng row kapag higit sa 1 ang rows', async () => {
    const { result } = renderHook(() => useEWasteForm());

    await waitFor(() => {
      expect(result.current.formState.itemName).toBe('');
    });

    // Magdagdag muna para maging 2 rows
    act(() => {
      result.current.actions.addEquipmentRow();
    });
    expect(result.current.formState.equipmentItems).toHaveLength(2);

    // Kunan ang ID ng unang item para burahin
    const firstItemId = result.current.formState.equipmentItems[0].id;

    act(() => {
      result.current.actions.removeEquipmentRow(firstItemId);
    });

    expect(result.current.formState.equipmentItems).toHaveLength(1);
  });

  // TEST 5: Form Validation Guard (Submit without Item Name)
  it('dapat magpakita ng error kapag nag-submit nang walang item name', async () => {
    const { result } = renderHook(() => useEWasteForm());

    await waitFor(() => {
      expect(result.current.formState.itemName).toBe('');
    });

    let success = false;
    await act(async () => {
      success = await result.current.actions.submitRequest();
    });

    expect(success).toBe(false);
    expect(result.current.formState.submitError).toBe('Please enter an item name or batch title.');
  });

});