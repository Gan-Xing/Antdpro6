import { dictsControllerFindItemsByTypeCode } from '@/services/nest-web/dicts';
import { unwrapResponse } from '@/utils/apiResponse';
import { useEffect, useMemo, useState } from 'react';

export type DictOption = {
  label: string;
  value: string;
  color?: string | null;
};

function toStatus(color?: string | null) {
  if (color === 'success') return 'Success';
  if (color === 'error') return 'Error';
  if (color === 'warning') return 'Warning';
  if (color === 'processing' || color === 'blue') return 'Processing';
  return 'Default';
}

export function useDictOptions(typeCode: string, fallback: DictOption[] = []) {
  const [items, setItems] = useState<NestWebAPI.DictItemEntity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = unwrapResponse<NestWebAPI.DictItemEntity[]>(
          await dictsControllerFindItemsByTypeCode({ code: typeCode }, { skipErrorHandler: true }),
        );
        if (mounted) {
          setItems(data);
        }
      } catch {
        if (mounted) {
          setItems([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [typeCode]);

  const options = useMemo<DictOption[]>(() => {
    if (!items.length) {
      return fallback;
    }

    return items.map((item) => ({
      label: item.label,
      value: item.value,
      color: item.color,
    }));
  }, [fallback, items]);

  const valueEnum = useMemo(() => {
    return Object.fromEntries(
      options.map((option) => [
        option.value,
        {
          text: option.label,
          status: toStatus(option.color),
        },
      ]),
    );
  }, [options]);

  return {
    loading,
    options,
    valueEnum,
  };
}
