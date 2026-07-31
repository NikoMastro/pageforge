import { useState } from 'react';
import type { ColumnTxtOptions } from '../../types/ui.types';

export const useColumnTxtOptions = () => {
  const [columnTxtOptions, setColumnTxtOptions] = useState<ColumnTxtOptions>({
    rows: [],
    background: {
      type: 'solid',
      color: '#ffffff',
    },
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontSize: '16px',
    imageHeight: 'auto',
    gap: 32,
    padding: '40px 20px',
  });

  return {
    columnTxtOptions,
    setColumnTxtOptions,
  };
};
