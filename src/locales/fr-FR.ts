import component from './fr-FR/component';
import globalHeader from './fr-FR/globalHeader';
import menu from './fr-FR/menu';
import pages from './fr-FR/pages';
import pwa from './fr-FR/pwa';
import settingDrawer from './fr-FR/settingDrawer';
import settings from './fr-FR/settings';

export default {
  'navBar.lang': 'Langues',
  'layout.user.link.help': 'Aide',
  'layout.user.link.privacy': 'Confidentialité',
  'layout.user.link.terms': 'Conditions',
  'app.copyright.produced': 'Produit par Ant Financial Experience Department',
  'app.preview.down.block': 'Télécharger cette page dans votre projet local',
  'app.welcome.link.fetch-blocks': 'Obtenir tous les blocs',
  'app.welcome.link.block-list':
    'Créer rapidement des pages standard basées sur le développement de blocs',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
};
