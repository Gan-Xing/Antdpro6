import { formatGlobalMessage } from '@/utils/i18n';

export const imageCategoryFallbackOptions = [
  {
    label: formatGlobalMessage('pages.resources.images.category.progress', 'Progress'),
    value: 'progress',
    color: 'blue',
  },
  {
    label: formatGlobalMessage('pages.resources.images.category.safety', 'Safety'),
    value: 'safety',
    color: 'error',
  },
  {
    label: formatGlobalMessage('pages.resources.images.category.quality', 'Quality'),
    value: 'quality',
    color: 'success',
  },
];
